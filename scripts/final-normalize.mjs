import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function normalize() {
    console.log('--- FINAL DATA NORMALIZATION ---');

    // 1. '광양코딩' -> '광양 코딩' (수정!)
    const { count: c1, error: e1 } = await supabase
        .from('users')
        .update({ academy: '광양 코딩' })
        .eq('academy', '광양코딩');

    if (e1) console.error('광양코딩 -> 광양 코딩 변환 실패:', e1);
    else console.log('광양코딩 -> 광양 코딩 변환 완료');

    // 2. '코딩 메이커' -> '코딩메이커'
    const { count: c2, error: e2 } = await supabase
        .from('users')
        .update({ academy: '코딩메이커' })
        .eq('academy', '코딩 메이커');

    if (e2) console.error('코딩 메이커 -> 코딩메이커 변환 실패:', e2);
    else console.log('코딩 메이커 -> 코딩메이커 변환 완료');

    // 3. 영문명 -> 한글명
    await supabase.from('users').update({ academy: '광양 코딩' }).eq('academy', 'gwangyang-coding');
    await supabase.from('users').update({ academy: '코딩메이커' }).eq('academy', 'coding-maker');

    console.log('--- DONE ---');
}

normalize();
