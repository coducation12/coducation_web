import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function test() {
    console.log('--- DETAILED CONSTRAINT TEST ---');
    const { data: user } = await supabase.from('users').select('id, academy').limit(1).single();
    if (!user) return;

    // 원래 상태 백업
    const originalValue = user.academy;
    console.log(`Original value for user ${user.id}: [${originalValue}]`);

    const values = ['코딩메이커', '코딩 메이커', 'coding-maker', '광양코딩', '광양 코딩', 'gwangyang-coding'];
    const results = {};

    for (const val of values) {
        const { error } = await supabase.from('users').update({ academy: val }).eq('id', user.id);
        results[val] = error ? `FAIL: ${error.message}` : 'SUCCESS';

        // 성공했다면 일단 다음 테스트를 위해 상태 유지 또는 원복
    }

    // 최종 결과 출력
    console.log(JSON.stringify(results, null, 2));

    // 원복
    await supabase.from('users').update({ academy: originalValue }).eq('id', user.id);
    console.log('Restored original value.');
}

test();
