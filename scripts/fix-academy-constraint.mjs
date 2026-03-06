const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';
const PROJECT_REF = 'xcljkkvfsufndxzfcigp';

async function runSQL(sql) {
    console.log(`Executing SQL: ${sql}`);
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql })
    });
    const status = res.status;
    const data = await res.json();
    console.log(`Status: ${status}`, data);
    return { status, data };
}

async function fix() {
    console.log('1. Dropping constraint...');
    await runSQL(`ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_academy_valid;`);

    console.log('2. Normalizing academy names...');
    // '광양 코딩' -> '광양코딩', '코딩 메이커' -> '코딩메이커' 등 공백 제거 및 통일
    await runSQL(`UPDATE users SET academy = '광양코딩' WHERE academy = '광양 코딩' OR academy = 'gwangyang-coding';`);
    await runSQL(`UPDATE users SET academy = '코딩메이커' WHERE academy = '코딩 메이커' OR academy = 'coding-maker';`);

    console.log('3. Adding clean constraint...');
    await runSQL(`ALTER TABLE users ADD CONSTRAINT chk_users_academy_valid CHECK (academy IN ('코딩메이커', '광양코딩'));`);

    console.log('Done.');
}

fix().catch(console.error);
