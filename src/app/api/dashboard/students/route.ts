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

        // If the user is a teacher, filter ONLY students assigned to them
        // UNLESS 'all=true' is requested (for Academy Timetable)
        if (userRole === 'teacher' && !showAll) {
            query = query.contains('assigned_teachers', [userId]);
        }

        // Execute query
        const { data, error } = await query;

        if (error) {
            console.error('Error fetching students via API:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // 3. 당월 출석 횟수 계산
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

        const { data: sessions, error: sessionsError } = await supabaseAdmin
            .from('attendance_sessions')
            .select('student_id')
            .eq('status', 'present')
            .gte('date', `${currentMonthStr}-01`)
            .lte('date', `${currentMonthStr}-31`);

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
