import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
    console.log('--- DB 상태 재체크 ---');
    const { data: user } = await supabase.from('users').select('id, academy').limit(1).single();
    if (!user) return;

    const values = ['코딩메이커', '광양코딩', '광양 코딩'];
    for (const val of values) {
        const { error } = await supabase.from('users').update({ academy: val }).eq('id', user.id);
        if (error) {
            console.log(`[${val}] -> FAIL: ${error.message}`);
        } else {
            console.log(`[${val}] -> SUCCESS`);
        }
    }
}

check();
