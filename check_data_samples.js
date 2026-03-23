
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Users Sample ---');
  const { data: users } = await supabase.from('users').select('role, status').limit(10);
  console.log(users);

  console.log('--- Attendance Sample ---');
  const { data: att } = await supabase.from('attendance_sessions').select('date, status, created_at').limit(5);
  console.log(att);

  console.log('--- Consultations Sample ---');
  const { data: cons } = await supabase.from('consultations').select('status').limit(5);
  console.log(cons);
  
  const today = new Date().toISOString().split('T')[0];
  console.log('Today (UTC):', today);
}

check();
