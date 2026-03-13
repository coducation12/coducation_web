const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDuplicates() {
  console.log('Checking sessions for 2026-03-13...');
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('student_id, session_type, status, users!attendance_sessions_student_id_fkey(name)')
    .eq('date', '2026-03-13');

  if (error) {
    console.error('Error:', error);
  } else {
    data.forEach(s => {
      console.log(`${s.users.name} | ${s.session_type} | ${s.status}`);
    });
  }
}

checkDuplicates();
