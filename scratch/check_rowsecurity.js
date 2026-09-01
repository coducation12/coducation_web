const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRowSecurity() {
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'students' });
    if (error) {
        // Direct query to pg_class
        const { data: cls, error: pgError } = await supabase
            .from('pg_class')
            .select('relrowsecurity')
            .eq('relname', 'students');
        console.log('Row security:', cls);
    } else {
        console.log('Table info:', data);
    }
}

checkRowSecurity();
