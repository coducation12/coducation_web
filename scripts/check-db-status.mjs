import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcljkkvfsufndxzfcigp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjbGpra3Zmc3VmbmR4emZjaWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM0NjcwNiwiZXhwIjoyMDY2OTIyNzA2fQ.FxTAt7cwUk8bDjQJuFFDaBoJ9hIob62jsytJcKq2K-U';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
    console.log('--- DB 상태 체크 시작 ---');

    // 1. 현재 users 테이블에 등록된 고유한 academy 값들 확인
    const { data: academies, error: academyError } = await supabase
        .from('users')
        .select('academy')
        .order('academy');

    if (academyError) {
        console.error('학원 목록 조회 실패:', academyError);
    } else {
        const uniqueAcademies = [...new Set(academies.map(a => a.academy))];
        console.log('현재 DB 내 학원 목록:', uniqueAcademies);
    }

    // 2. 제약 조건 정의 확인 (PostgreSQL 시스템 테이블 조회)
    const { data: constraints, error: constraintError } = await supabase
        .rpc('check_constraint_definition', { table_name: 'users', constraint_name: 'chk_users_academy_valid' });

    // RPC가 없을 수 있으므로 직접 쿼리 시도 (supabase rpc는 함수가 정의되어 있어야 함)
    // 대신 raw SQL을 run_command에서 실행할 수 있는 방법은 없으므로, 
    // migrate-academy.mjs와 유사하게 fetch를 사용하여 api를 직접 호출해봅니다.

    console.log('--- 체크 완료 ---');
}

check();
