const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudent() {
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .eq('name', '최준일');
        
    if (userError) {
        console.error('User Error:', userError);
        return;
    }
    
    console.log('Users:', users);
    
    for (const user of users) {
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('user_id, assigned_teachers')
            .eq('user_id', user.id);
            
        if (studentError) {
            console.error('Student Error:', studentError);
        } else {
            console.log('Student for', user.name, ':', student);
        }
    }
}

checkStudent();
