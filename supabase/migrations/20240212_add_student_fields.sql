-- students 테이블에 세부과목 및 메모 필드 추가
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS sub_subject TEXT,
ADD COLUMN IF NOT EXISTS memo TEXT;

-- 주석 추가
COMMENT ON COLUMN public.students.sub_subject IS '세부 과목';
COMMENT ON COLUMN public.students.memo IS '기타 메모';
