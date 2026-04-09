const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error selecting from community_posts:', error);
  } else {
    console.log('Columns in community_posts:', Object.keys(data[0] || {}));
  }
}

checkColumns();
