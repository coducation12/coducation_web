const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    console.log('\n--- Checking curriculums columns ---');
    const { data: cur, error: curError } = await supabase
        .from('curriculums')
        .select('*')
        .limit(1);
    
    if (curError) {
        console.error('Curriculums check error:', curError.message);
    } else {
        console.log('Curriculums success! Keys:', Object.keys(cur[0] || {}));
    }
}

check();
