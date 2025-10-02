-- =============================================
-- 🔧 users 테이블 정책 간소화
-- =============================================
-- 무한 재귀 문제를 해결하기 위해 users 테이블 정책을 간소화합니다.

-- =============================================
-- 1. 모든 users 테이블 정책 삭제
-- =============================================
DROP POLICY IF EXISTS "Users: Only self can select" ON public.users;
DROP POLICY IF EXISTS "Users: Only self can update" ON public.users;
DROP POLICY IF EXISTS "Users: Only self can insert" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 조회 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 수정 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 삽입 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 삭제 가능" ON public.users;
DROP POLICY IF EXISTS "모든 사용자는 강사 정보 조회 가능" ON public.users;

-- =============================================
-- 2. 간단한 정책만 생성
-- =============================================

-- 모든 사용자는 자신의 정보 조회 가능
CREATE POLICY "사용자는 자신의 정보 조회 가능" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- 모든 사용자는 자신의 정보 수정 가능
CREATE POLICY "사용자는 자신의 정보 수정 가능" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 모든 사용자는 자신의 정보 삽입 가능
CREATE POLICY "사용자는 자신의 정보 삽입 가능" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 강사/관리자 정보는 공개 조회 가능 (메인화면용)
CREATE POLICY "강사 정보 공개 조회 가능" ON public.users
    FOR SELECT USING (role IN ('teacher', 'admin'));

-- =============================================
-- 3. 완료 메시지
-- =============================================
SELECT 'users 테이블 정책이 간소화되었습니다!' as message;
