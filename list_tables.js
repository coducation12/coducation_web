
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('get_tables'); // Some DBs have this rpc
  if (error) {
    // Fallback: try to select from a non-existent table to see error or just try to list some common ones
    console.log('RPC get_tables failed, trying direct query if allowed or just listing common ones');
    const { data: tables, error: err } = await supabase.from('pg_catalog.pg_tables').select('tablename').eq('schemaname', 'public');
    if (err) {
        console.error('Failed to list tables:', err);
    } else {
        console.log('Tables:', tables.map(t => t.tablename));
    }
  } else {
    console.log('Tables (RPC):', data);
  }
}

check();
