import { supabaseAdmin } from './src/lib/supabase.ts';

async function debugStudent() {
    const { data, error } = await supabaseAdmin
        .from('students')
        .select('user_id, attendance_schedule')
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('--- Students Attendance Schedule Debug ---');
    data.forEach(s => {
        console.log(`Student ID: ${s.user_id}`);
        console.log('Schedule:', JSON.stringify(s.attendance_schedule, null, 2));
        console.log('-------------------------------------------');
    });
}

debugStudent();
