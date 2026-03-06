import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function test() {
    console.log('--- 제약 조건 허용 값 테스트 ---');

    // 임의의 존재하는 유저 한 명을 대상으로 테스트 (저장은 안 함)
    const { data: user } = await supabase.from('users').select('id, name').limit(1).single();
    if (!user) return;

    const valuesToTest = ['코딩메이커', '코딩 메이커', 'coding-maker', '광양코딩', '광양 코딩', 'gwangyang-coding'];

    for (const val of valuesToTest) {
        console.log(`테스트 중: [${val}]`);
        const { error } = await supabase
            .from('users')
            .update({ academy: val })
            .eq('id', user.id);

        if (error) {
            console.log(`  ❌ 실패: ${error.message}`);
        } else {
            console.log(`  ✅ 성공!`);
        }
    }
}

test();
