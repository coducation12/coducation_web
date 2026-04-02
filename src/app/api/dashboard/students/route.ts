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

        const { searchParams } = new URL(request.url);
        const showAll = searchParams.get('all') === 'true';

        // Query students query
        let query = supabaseAdmin
            .from('students')
            .select(`
                user_id, 
                parent_id, 
                current_curriculum_id, 
                enrollment_start_date, 
                attendance_schedule,
                assigned_teachers,
                main_subject,
                sub_subject,
                learning_progress,
                memo,
                tuition_fee,
                users!students_user_id_fkey ( 
                    id, 
                    name, 
                    username, 
                    phone, 
                    birth_year, 
                    academy, 
                    created_at, 
                    email, 
                    status,
                    assigned_teacher_id
                ), 
                parent:users!students_parent_id_fkey ( phone )
            `);

        // 1. 권한 기반 필터링 적용
        if (userRole === 'admin') {
            // 관리자는 모든 학생 조회 가능
        } else if (userRole === 'teacher') {
            // 강사는 기본적으로 담당 학생만 조회, 'all=true'일 때만 전체 조회(시간표용) 가능
            if (!showAll) {
                query = query.contains('assigned_teachers', [userId]);
            }
        } else {
            // 학생/학부모는 전체 학생 목록 API 접근 권한 없음 (보안 강화)
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Execute query
        const { data, error } = await query;

        if (error) {
            console.error('Error fetching students via API:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // 2. 당월 출석 횟수 계산 (로그인한 강사의 수업만)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA');
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('en-CA');

        let attendanceQuery = supabaseAdmin
            .from('attendance_sessions')
            .select('student_id')
            .eq('status', 'present')
            .gte('date', firstDayOfMonth)
            .lte('date', lastDayOfMonth);

        // 강사인 경우 본인이 담당한(체크한) 수업만 카운트
        if (userRole === 'teacher') {
            attendanceQuery = attendanceQuery.eq('teacher_id', userId);
        }

        const { data: sessions, error: sessionsError } = await attendanceQuery;

        const attendanceCounts: Record<string, number> = {};
        if (sessions) {
            sessions.forEach((s: any) => {
                attendanceCounts[s.student_id] = (attendanceCounts[s.student_id] || 0) + 1;
            });
        }

        const dataWithCounts = data.map((student: any) => ({
            ...student,
            monthlyAttendanceCount: attendanceCounts[student.user_id] || 0
        }));

        // 4. 담당 강사들의 정보(이름, 색상) 조회
        const assignedTeacherIds = new Set<string>();
        dataWithCounts.forEach((s: any) => {
            if (Array.isArray(s.assigned_teachers)) {
                s.assigned_teachers.forEach((id: string) => assignedTeacherIds.add(id));
            }
        });

        const { data: teachersData } = await supabaseAdmin
            .from('users')
            .select('id, name, teachers(label_color)')
            .in('id', Array.from(assignedTeacherIds));

        return NextResponse.json({
            data: dataWithCounts,
            teachers: teachersData,
            userId: userId,
            userRole: userRole
        });
    } catch (error) {
        console.error('API /dashboard/students error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
