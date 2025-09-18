-- users 테이블의 status 컬럼을 확장하여 학생 수강 상태 포함
-- 기존 CHECK 제약조건 제거
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS chk_users_status_valid;

-- 새로운 CHECK 제약조건 추가 (학생 수강 상태 포함)
ALTER TABLE public.users 
ADD CONSTRAINT chk_users_status_valid
CHECK (
  (role = 'student' AND status IN ('pending', 'active', 'suspended', '휴강', '종료')) OR
  (role != 'student' AND status IN ('active', 'pending', 'suspended'))
);

-- students 테이블의 status 데이터를 users 테이블로 마이그레이션
UPDATE public.users 
SET status = s.status
FROM public.students s
WHERE users.id = s.user_id 
  AND users.role = 'student'
  AND s.status IS NOT NULL;

-- students 테이블의 status 컬럼 제거 (users 테이블로 통합)
ALTER TABLE public.students DROP COLUMN IF EXISTS status;
