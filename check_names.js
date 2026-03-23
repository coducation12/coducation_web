
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- PCRoomLayouts Academia Names ---');
  const { data: layouts } = await supabase.from('pc_room_layouts').select('academy_name, room_name');
  console.log(layouts);

  console.log('--- Tuition Annual Records Sample ---');
  const { data: tuition } = await supabase.from('tuition_annual_records').select('month, base_amount').limit(5);
  console.log(tuition);
}

check();
