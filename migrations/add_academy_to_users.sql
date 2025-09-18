-- users 테이블에 academy 컬럼 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS academy VARCHAR(50);

-- academy 컬럼에 기본값 설정
UPDATE public.users 
SET academy = 'coding-maker' 
WHERE academy IS NULL;

-- academy 컬럼에 NOT NULL 제약 조건 추가
ALTER TABLE public.users 
ALTER COLUMN academy SET NOT NULL;

-- academy 필드에 체크 제약 조건 추가 (유효한 값만 허용)
ALTER TABLE public.users 
ADD CONSTRAINT chk_users_academy_valid 
CHECK (academy IN ('coding-maker', 'gwangyang-coding'));

-- academy 필드에 대한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_academy ON public.users(academy);

-- 기존 데이터 업데이트 (필요시)
-- UPDATE public.users SET academy = 'coding-maker' WHERE role IN ('student', 'parent', 'teacher', 'admin');
