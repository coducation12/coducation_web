-- users 테이블에 status 컬럼 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 기존 사용자는 모두 active로 설정
UPDATE public.users 
SET status = 'active' 
WHERE status IS NULL;

-- status 필드에 체크 제약 조건 추가
ALTER TABLE public.users 
ADD CONSTRAINT chk_users_status_valid 
CHECK (status IN ('active', 'pending', 'suspended'));

-- status 필드에 대한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);