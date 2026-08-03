const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDelete() {
    console.log("Searching for 김준민...");
    const { data: student, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('name', '김준민')
        .eq('role', 'student')
        .single();

    if (error || !student) {
        console.error("Student not found:", error);
        return;
    }
    console.log("Found student:", student);

    const studentId = student.id;

    // Try deleting directly to see what foreign key fails
    const { error: delError } = await supabaseAdmin.from('users').delete().eq('id', studentId);
    
    if (delError) {
        console.error("Delete failed with error:", delError.message, delError.details, delError.hint);
    } else {
        console.log("Delete succeeded!");
    }
}

testDelete();
