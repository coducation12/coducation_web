const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    console.log('Fetching single row to see columns...');
    const { data, error } = await supabase.from('curriculums').select('*').limit(1);
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Sample Row Keys:', Object.keys(data[0] || {}));
    }
}

check();
