const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Wait, the client uses the anon key and user session.
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseAdminKey); // I'll just use admin key to see if RLS is the issue

async function testUpdate() {
    const studentId = '49f60b59-f6cf-4be6-a4fd-584eecd42363';
    // Let's assume teacherIndex is 1, so we remove the second teacher.
    const assignedTeacherIds = [ '3a1a3fa0-3092-4e7e-9715-a99d90ed34da' ];

    console.log('Updating to', assignedTeacherIds);

    const { data, error } = await supabase
        .from('students')
        .update({ assigned_teachers: assignedTeacherIds })
        .eq('user_id', studentId);
        
    console.log('Data:', data, 'Error:', error);
}

testUpdate();
