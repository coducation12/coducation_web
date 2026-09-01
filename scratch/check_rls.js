const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
    const { data, error } = await supabase.rpc('get_policies', { table_name: 'students' });
    if (error) {
        // If RPC doesn't exist, we can query pg_policies directly
        const { data: policies, error: pgError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'students');
        
        console.log('PG Policies for students:', policies);
    } else {
        console.log('Policies:', data);
    }
}

checkPolicies();
