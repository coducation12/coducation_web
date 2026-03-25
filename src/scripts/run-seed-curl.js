const { execSync } = require('child_process');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/curriculums`;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const cmd = `curl -X POST "${url}" -H "apikey: ${key}" -H "Authorization: Bearer ${key}" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d "@src/scripts/seed-data.json"`;

console.log('Running cURL seeding...');
try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('Done!');
} catch (e) {
    console.error('Error:', e.message);
}
