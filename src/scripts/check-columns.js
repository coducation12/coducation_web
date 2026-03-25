const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    console.log('--- Searching for curriculums columns ---');
    // We can't query information_schema directly via postgrest easily without a RPC
    // So let's just try to select everything and see what comes back in the error or data
    const { data, error } = await supabase
        .from('curriculums')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Select error:', error.message);
        if (error.hint) console.log('Hint:', error.hint);
    } else {
        console.log('Columns found:', Object.keys(data[0] || {}));
    }

    console.log('\n--- Checking for learning_materials columns ---');
    const { data: lmData, error: lmError } = await supabase
        .from('learning_materials')
        .select('*')
        .limit(1);

    if (lmError) {
        console.log('learning_materials doesn\'t exist or error:', lmError.message);
    } else {
        console.log('learning_materials columns:', Object.keys(lmData[0] || {}));
    }
}

checkColumns();
