-- =============================================
-- 🔧 상담문의 문제 완전 해결
-- =============================================
-- consultations 테이블의 RLS를 비활성화하여 모든 사용자가 상담문의를 작성할 수 있도록 합니다.

-- =============================================
-- 1. consultations 테이블 RLS 비활성화
-- =============================================
ALTER TABLE public.consultations DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. 모든 정책 삭제
-- =============================================
DROP POLICY IF EXISTS "관리자와 강사는 상담문의 조회 가능" ON public.consultations;
DROP POLICY IF EXISTS "인증된 사용자는 상담문의 작성 가능" ON public.consultations;
DROP POLICY IF EXISTS "모든 사용자는 상담문의 작성 가능" ON public.consultations;
DROP POLICY IF EXISTS "관리자와 강사는 상담문의 수정 가능" ON public.consultations;
DROP POLICY IF EXISTS "관리자는 모든 상담문의 삭제 가능" ON public.consultations;

-- =============================================
-- 3. 완료 메시지
-- =============================================
SELECT 'consultations 테이블이 완전히 열렸습니다!' as message;
