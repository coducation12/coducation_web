const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    console.log('Checking tables...');
    const { data: insertData, error: insertError } = await supabase
        .from('curriculums')
        .insert([{ title: 'SEED_TEST', category: 'TEST', level: '기초', public: true }]);
    
    if (insertError) {
        console.error('Insert test error:', insertError.message);
    } else {
        console.log('Insert test success!');
    }

    console.log('Checking buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.error('Buckets error:', bucketError.message);
    } else {
        console.log('Buckets:', buckets.map(b => b.name));
    }
}

check();
