const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugStudent() {
    const { data, error } = await supabase
        .from('students')
        .select('user_id, attendance_schedule')
        .limit(20);

    if (error) {
        console.error('Error:', error);
        return;
    }

    const output = data.filter(s => s.attendance_schedule).map(s => ({
        userId: s.user_id,
        schedule: s.attendance_schedule
    }));

    fs.writeFileSync('debug_output.json', JSON.stringify(output, null, 2));
    console.log('Done mapping to debug_output.json');
}

debugStudent();
