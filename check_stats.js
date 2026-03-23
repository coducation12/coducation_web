
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- User Roles/Statuses ---');
  const { data: users } = await supabase.from('users').select('role, status');
  const userStats = users.reduce((acc, u) => {
    const key = `${u.role}:${u.status}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  console.log(userStats);

  const today = new Date().toISOString().split('T')[0];
  console.log('--- Attendance Today ---', today);
  const { count: attCount } = await supabase.from('attendance_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('date', today);
  console.log('Total for today:', attCount);

  const { data: attSample } = await supabase.from('attendance_sessions')
    .select('date, status, created_at')
    .eq('date', today)
    .limit(5);
  console.log('Sample for today:', attSample);
  
  console.log('--- Consultations ---');
  const { data: cons } = await supabase.from('consultations').select('status');
  const consStats = cons.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  console.log(consStats);
}

check();
