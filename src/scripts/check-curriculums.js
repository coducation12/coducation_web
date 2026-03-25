const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    console.log('Checking Curriculums table existence...');
    const { data, error } = await supabase.from('curriculums').select('*').limit(1);
    
    if (error) {
        console.error('Error selecting from curriculums:', error.message);
    } else {
        console.log('Table found! Sample keys:', Object.keys(data[0] || {}));
    }
}

check();
