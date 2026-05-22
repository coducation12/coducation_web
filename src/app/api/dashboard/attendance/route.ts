import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;
        const userRole = cookieStore.get('user_role')?.value;

        if (!userId || !userRole) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const dateStr = request.nextUrl.searchParams.get('date');
        if (!dateStr) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        // 🟢 최적화: 관리자 계정은 세션과 학생 데이터를 동시에 가져옵니다.
        // 강사 계정은 세션 결과에 따라 쿼리가 달라지므로 순차 처리하되, 최종 교사 정보는 병렬 처리합니다.
        
        let sessionData: any[] | null = null;
        let studentsData: any[] | null = null;
 
        if (userRole === 'admin') {
            const [sessionRes, studentsRes] = await Promise.all([
                supabaseAdmin
                    .from('attendance_sessions')
                    .select('id, student_id, status, session_type, start_time, end_time, teacher_id, korean_typing_speed, english_typing_speed, memo')
                    .eq('date', dateStr),
                supabaseAdmin
                    .from('students')
                    .select('user_id, assigned_teachers, main_subject, sub_subject, users!students_user_id_fkey(name, status)')
            ]);
            sessionData = sessionRes.data;
            studentsData = studentsRes.data;
            
            if (sessionRes.error) throw sessionRes.error;
            if (studentsRes.error) throw studentsRes.error;
        } else {
            // 강사 계정: 본인 세션만 조회 후 연관 학생 조회
            const { data: sData, error: sError } = await supabaseAdmin
                .from('attendance_sessions')
                .select('id, student_id, status, session_type, start_time, end_time, teacher_id, korean_typing_speed, english_typing_speed, memo')
                .eq('date', dateStr)
                .eq('teacher_id', userId);
            
            if (sError) throw sError;
            sessionData = sData;
 
            const studentIdsFromSessions = (sessionData || [])
                .filter((s: any) => s.teacher_id === userId)
                .map((s: any) => s.student_id);
 
            let studentsQuery = supabaseAdmin
                .from('students')
                .select('user_id, assigned_teachers, main_subject, sub_subject, users!students_user_id_fkey(name, status)');
 
            if (studentIdsFromSessions.length > 0) {
                studentsQuery = studentsQuery.or(`assigned_teachers.cs.{${userId}},user_id.in.(${studentIdsFromSessions.join(',')})`);
            } else {
                studentsQuery = studentsQuery.contains('assigned_teachers', [userId]);
            }
 
            const { data: stData, error: stError } = await studentsQuery;
            if (stError) throw stError;
            studentsData = stData;
        }
 
        const activeStudents = (studentsData || []).filter((s: any) =>
            s.users?.status === 'active' || !s.users?.status
        );
 
        // 🟢 최적화: 가벼운 student_progresses 및 student_schedules 데이터를 병렬 병합
        const activeStudentIds = activeStudents.map((s: any) => s.user_id);
        let progressesData: any[] = [];
        let schedulesData: any[] = [];

        if (activeStudentIds.length > 0) {
            const [progRes, schedRes] = await Promise.all([
                supabaseAdmin
                    .from('student_progresses')
                    .select('student_id, category, title, percentage, status')
                    .in('student_id', activeStudentIds)
                    .eq('status', 'ongoing'),
                supabaseAdmin
                    .from('student_schedules')
                    .select('student_id, day_of_week, start_time, end_time, teacher_id')
                    .in('student_id', activeStudentIds)
            ]);
            
            if (!progRes.error) progressesData = progRes.data || [];
            if (!schedRes.error) schedulesData = schedRes.data || [];
        }
 
        const progressMap = new Map<string, any[]>();
        progressesData.forEach((p: any) => {
            const list = progressMap.get(p.student_id) || [];
            list.push({
                category: p.category,
                title: p.title,
                percentage: p.percentage,
                status: p.status
            });
            progressMap.set(p.student_id, list);
        });

        const scheduleMap = new Map<string, any>();
        schedulesData.forEach((s: any) => {
            const studentId = s.student_id;
            if (!scheduleMap.has(studentId)) {
                scheduleMap.set(studentId, {});
            }
            const schedObj = scheduleMap.get(studentId);
            schedObj[s.day_of_week.toString()] = {
                startTime: s.start_time ? s.start_time.substring(0, 5) : '',
                endTime: s.end_time ? s.end_time.substring(0, 5) : '',
                teacherId: s.teacher_id || 'none'
            };
        });
 
        const finalizedStudents = activeStudents.map((s: any) => ({
            ...s,
            attendance_schedule: scheduleMap.get(s.user_id) || {},
            learning_progress: progressMap.get(s.user_id) || []
        }));

        // 3. 강사 이름 정보를 가져갈 때도 병렬 처리 고려
        const teacherIds = new Set<string>();
        finalizedStudents.forEach((s: any) => {
            if (Array.isArray(s.assigned_teachers)) {
                s.assigned_teachers.forEach((id: string) => teacherIds.add(id));
            }
        });
        (sessionData || []).forEach((s: any) => {
            if (s.teacher_id) teacherIds.add(s.teacher_id);
        });

        const { data: teachersData } = await supabaseAdmin
            .from('users')
            .select('id, name')
            .in('id', Array.from(teacherIds));

        return NextResponse.json({
            students: finalizedStudents,
            sessions: sessionData,
            teachers: teachersData,
            userId: userId,
            userRole: userRole
        });

    } catch (error) {
        console.error('API /dashboard/attendance error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
