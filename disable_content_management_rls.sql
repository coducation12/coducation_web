-- =============================================
-- 🔧 content_management RLS 완전 비활성화
-- =============================================
-- content_management 테이블의 RLS를 비활성화하여 모든 사용자가 접근할 수 있도록 합니다.

-- =============================================
-- 1. content_management 테이블 RLS 비활성화
-- =============================================
ALTER TABLE public.content_management DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. 모든 정책 삭제
-- =============================================
DROP POLICY IF EXISTS "관리자는 콘텐츠 관리 가능" ON public.content_management;
DROP POLICY IF EXISTS "모든 사용자는 콘텐츠 조회 가능" ON public.content_management;

-- =============================================
-- 3. 완료 메시지
-- =============================================
SELECT 'content_management 테이블이 완전히 열렸습니다!' as message;
