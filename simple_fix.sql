-- =============================================
-- 🔧 간단한 권한 문제 해결
-- =============================================

-- 1. users 테이블 RLS 비활성화
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. 모든 정책 삭제
DROP POLICY IF EXISTS "Users: Only self can select" ON public.users;
DROP POLICY IF EXISTS "Users: Only self can update" ON public.users;
DROP POLICY IF EXISTS "Users: Only self can insert" ON public.users;
DROP POLICY IF EXISTS "사용자는 자신의 정보 조회 가능" ON public.users;
DROP POLICY IF EXISTS "사용자는 자신의 정보 수정 가능" ON public.users;
DROP POLICY IF EXISTS "사용자는 자신의 정보 삽입 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 조회 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 수정 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 삽입 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 삭제 가능" ON public.users;
DROP POLICY IF EXISTS "모든 사용자는 강사 정보 조회 가능" ON public.users;
DROP POLICY IF EXISTS "강사 정보 공개 조회 가능" ON public.users;
DROP POLICY IF EXISTS "이메일로 사용자 조회 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 관리 가능" ON public.users;

-- 3. 완료 메시지
SELECT 'users 테이블이 완전히 열렸습니다!' as message;
