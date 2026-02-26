// Step 1: Drop the check constraint, update values, then re-add constraint with Korean values
const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';
const PROJECT_REF = 'xcljkkvfsufndxzfcigp';

async function runSQL(sql) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql })
    });
    return { status: res.status, data: await res.json() };
}

async function migrate() {
    console.log('1. Dropping check constraint...');
    const r1 = await runSQL(`ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_academy_valid;`);
    console.log(r1.status, JSON.stringify(r1.data).slice(0, 200));

    console.log('2. Updating coding-maker -> 코딩메이커...');
    const r2 = await runSQL(`UPDATE users SET academy = '코딩메이커' WHERE academy = 'coding-maker';`);
    console.log(r2.status, JSON.stringify(r2.data).slice(0, 200));

    console.log('3. Updating gwangyang-coding -> 광양코딩...');
    const r3 = await runSQL(`UPDATE users SET academy = '광양코딩' WHERE academy = 'gwangyang-coding';`);
    console.log(r3.status, JSON.stringify(r3.data).slice(0, 200));

    console.log('4. Adding new constraint with Korean values...');
    const r4 = await runSQL(`ALTER TABLE users ADD CONSTRAINT chk_users_academy_valid CHECK (academy IN ('코딩메이커', '광양코딩'));`);
    console.log(r4.status, JSON.stringify(r4.data).slice(0, 200));

    console.log('Done.');
}

migrate().catch(console.error);
