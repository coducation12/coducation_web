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

        // 1. Fetch Students
        let studentsQuery = supabaseAdmin
            .from('students')
            .select(`
                user_id,
                assigned_teachers,
                attendance_schedule,
                main_subject,
                sub_subject,
                users!students_user_id_fkey(name, status)
            `);

        // Force teacher filtering on the server
        if (userRole === 'teacher') {
            studentsQuery = studentsQuery.contains('assigned_teachers', [userId]);
        }

        const { data: studentsData, error: studentsError } = await studentsQuery;

        if (studentsError) {
            console.error('Error fetching students via API:', studentsError);
            return NextResponse.json({ error: 'Database error fetching students' }, { status: 500 });
        }

        const activeStudents = (studentsData || []).filter((s: any) =>
            s.users?.status === 'active' || !s.users?.status
        );

        // 2. Fetch Attendance Sessions Data
        const { data: sessionData, error: sessionError } = await supabaseAdmin
            .from('attendance_sessions')
            .select(`
                id, 
                student_id, 
                status, 
                session_type, 
                start_time, 
                end_time, 
                korean_typing_speed, 
                english_typing_speed, 
                memo
            `)
            .eq('date', dateStr);

        if (sessionError) {
            console.error('Error fetching sessions via API:', sessionError);
            return NextResponse.json({ error: 'Database error fetching sessions' }, { status: 500 });
        }

        // 3. Collect assigned teacher IDs to fetch their names securely
        const teacherIds = new Set<string>();
        activeStudents.forEach((s: any) => {
            if (Array.isArray(s.assigned_teachers)) {
                s.assigned_teachers.forEach((id: string) => teacherIds.add(id));
            }
        });

        // Add teacher IDs from sessions as well
        sessionData.forEach((s: any) => {
            if (s.teacher_id) teacherIds.add(s.teacher_id);
        });

        const { data: teachersData } = await supabaseAdmin
            .from('users')
            .select('id, name')
            .in('id', Array.from(teacherIds));

        // Return combined data, the client will process it to avoid large data transfer overheads
        return NextResponse.json({
            students: activeStudents,
            sessions: sessionData, // Changed from logs to sessions
            teachers: teachersData,
            userId: userId,
            userRole: userRole
        });

    } catch (error) {
        console.error('API /dashboard/attendance error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
