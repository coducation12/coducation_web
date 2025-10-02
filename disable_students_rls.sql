-- =============================================
-- 🔧 students 테이블 RLS 완전 비활성화
-- =============================================
-- students 테이블의 RLS를 비활성화하여 모든 사용자가 접근할 수 있도록 합니다.

-- =============================================
-- 1. students 테이블 RLS 비활성화
-- =============================================
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. 모든 정책 삭제
-- =============================================
DROP POLICY IF EXISTS "관리자는 모든 학생 조회 가능" ON public.students;
DROP POLICY IF EXISTS "관리자는 학생 정보 수정 가능" ON public.students;
DROP POLICY IF EXISTS "관리자는 학생 정보 삽입 가능" ON public.students;
DROP POLICY IF EXISTS "관리자는 모든 학생 삽입 가능" ON public.students;
DROP POLICY IF EXISTS "관리자는 모든 학생 삭제 가능" ON public.students;
DROP POLICY IF EXISTS "강사는 담당 학생만 조회 가능" ON public.students;
DROP POLICY IF EXISTS "학생은 자신의 정보만 조회 가능" ON public.students;
DROP POLICY IF EXISTS "학부모는 자녀 정보만 조회 가능" ON public.students;

-- =============================================
-- 3. 완료 메시지
-- =============================================
SELECT 'students 테이블이 완전히 열렸습니다!' as message;
