import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function fix() {
    console.log('--- 데이터 정규화 시작 ---');

    // '광양 코딩' -> '광양코딩'
    const { data: d1, error: e1 } = await supabase
        .from('users')
        .update({ academy: '광양코딩' })
        .eq('academy', '광양 코딩');

    if (e1) console.error('광양 코딩 수정 실패:', e1);
    else console.log('광양 코딩 수정 완료');

    // '코딩 메이커' -> '코딩메이커'
    const { data: d2, error: e2 } = await supabase
        .from('users')
        .update({ academy: '코딩메이커' })
        .eq('academy', '코딩 메이커');

    if (e2) console.error('코딩 메이커 수정 실패:', e2);
    else console.log('코딩 메이커 수정 완료');

    console.log('--- 정규화 완료 ---');
}

fix();
