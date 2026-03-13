const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConstraints() {
  console.log('Checking constraints for attendance_sessions...');
  
  // Query to find unique constraints on the table
  const { data, error } = await supabase.rpc('query_info', {
    sql_query: `
      SELECT 
          conname as constraint_name,
          pg_get_constraintdef(c.oid) as constraint_definition
      FROM 
          pg_constraint c
      JOIN 
          pg_class t ON t.oid = c.conrelid
      WHERE 
          t.relname = 'attendance_sessions';
    `
  });

  if (error) {
    console.log('RPC query_info not found, trying common query...');
    // If RPC doesn't exist, we might be able to use a trick if select on some pg table is allowed
    // But usually it's not. Let's try to just insert a duplicate and see if it fails with a unique constraint violation.
    
    console.log('Testing for unique constraint by attempting duplicate insertion...');
    const testData = {
        student_id: '30427f3a-f72a-4155-97d8-4607518594b2',
        date: '2026-03-14',
        session_type: 'regular',
        status: 'present'
    };
    
    const { error: ins1Error } = await supabase.from('attendance_sessions').insert(testData);
    if (ins1Error) {
        console.error('Initial insert failed:', ins1Error);
    } else {
        console.log('Initial insert succeeded. Attempting duplicate...');
        const { error: ins2Error } = await supabase.from('attendance_sessions').insert(testData);
        if (ins2Error) {
            console.log('Duplicate insertion failed as expected (Constraint might exist!):', ins2Error.message);
        } else {
            console.warn('Duplicate insertion SUCCEEDED. UNIQUE CONSTRAINT IS MISSING!');
            // Cleanup
            await supabase.from('attendance_sessions').delete().eq('date', '2026-03-14').eq('student_id', '30427f3a-f72a-4155-97d8-4607518594b2');
        }
    }
  } else {
    console.table(data);
  }
}

checkConstraints();
