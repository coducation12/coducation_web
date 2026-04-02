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
                    .select('user_id, assigned_teachers, attendance_schedule, main_subject, sub_subject, learning_progress, users!students_user_id_fkey(name, status)')
            ]);
            sessionData = sessionRes.data;
            studentsData = studentsRes.data;
            
            if (sessionRes.error) throw sessionRes.error;
            if (studentsRes.error) throw studentsRes.error;
        } else {
            // 강사 계정: 세션 먼저 조회 후 연관 학생 조회
            const { data: sData, error: sError } = await supabaseAdmin
                .from('attendance_sessions')
                .select('id, student_id, status, session_type, start_time, end_time, teacher_id, korean_typing_speed, english_typing_speed, memo')
                .eq('date', dateStr);
            
            if (sError) throw sError;
            sessionData = sData;

            const studentIdsFromSessions = (sessionData || [])
                .filter((s: any) => s.teacher_id === userId)
                .map((s: any) => s.student_id);

            let studentsQuery = supabaseAdmin
                .from('students')
                .select('user_id, assigned_teachers, attendance_schedule, main_subject, sub_subject, learning_progress, users!students_user_id_fkey(name, status)');

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

        // 3. 강사 이름 정보를 가져갈 때도 병렬 처리 고려
        const teacherIds = new Set<string>();
        activeStudents.forEach((s: any) => {
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
            students: activeStudents,
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
