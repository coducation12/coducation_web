-- =============================================
-- 🔧 상담문의 문제 디버깅
-- =============================================

-- 1. consultations 테이블 RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'consultations';

-- 2. consultations 테이블의 모든 정책 확인
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'consultations' 
ORDER BY policyname;

-- 3. consultations 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'consultations'
ORDER BY ordinal_position;

-- 4. 기존 상담문의 데이터 확인
SELECT COUNT(*) as total_consultations FROM public.consultations;
