const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    const studentId = '49f60b59-f6cf-4be6-a4fd-584eecd42363';
    // Let's remove the second teacher again
    const assignedTeacherIds = [ '3a1a3fa0-3092-4e7e-9715-a99d90ed34da' ];

    console.log('Updating to', assignedTeacherIds);

    const { data, error } = await supabase
        .from('students')
        .update({ assigned_teachers: assignedTeacherIds })
        .eq('user_id', studentId)
        .select(); // IMPORTANT: see if rows were actually affected
        
    console.log('Data:', data, 'Error:', error);
}

testUpdate();
