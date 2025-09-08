-- 상담 문의 테이블에 학원 선택 필드 추가
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS academy VARCHAR(50) NOT NULL DEFAULT 'coding-maker';

-- 학원 필드에 대한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_consultations_academy ON public.consultations(academy);

-- 학원 필드에 체크 제약 조건 추가 (유효한 값만 허용)
ALTER TABLE public.consultations 
ADD CONSTRAINT chk_academy_valid 
CHECK (academy IN ('coding-maker', 'gwangyang-coding'));

-- 기존 데이터가 있다면 기본값으로 업데이트 (선택사항)
UPDATE public.consultations 
SET academy = 'coding-maker' 
WHERE academy IS NULL;
