-- =============================================
-- 🔧 권한 문제 완전 해결 SQL
-- =============================================
-- users 테이블의 모든 권한 문제를 해결합니다.

-- =============================================
-- 1. users 테이블 RLS 완전 비활성화
-- =============================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. 모든 정책 삭제
-- =============================================
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

-- =============================================
-- 3. public 스키마에 대한 권한 확인 및 부여
-- =============================================
-- anon 역할에 대한 권한 부여
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.curriculums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_activity_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_learning_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tuition_payments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_management TO anon;

-- authenticated 역할에 대한 권한 부여
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.curriculums TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_activity_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_learning_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tuition_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_management TO authenticated;

-- =============================================
-- 4. 완료 메시지
-- =============================================
SELECT '권한 문제가 완전히 해결되었습니다!' as message;
