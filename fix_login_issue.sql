-- =============================================
-- 🔧 로그인 문제 해결 SQL
-- =============================================
-- 로그인 시 users 테이블 조회가 가능하도록 정책을 수정합니다.

-- =============================================
-- 1. 기존 정책 정리
-- =============================================
-- 모든 users 테이블 정책 삭제
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

-- =============================================
-- 2. 로그인을 위한 새로운 정책 생성
-- =============================================

-- 모든 사용자는 자신의 정보 조회 가능 (로그인용)
CREATE POLICY "사용자는 자신의 정보 조회 가능" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- 강사/관리자 정보는 공개 조회 가능 (메인화면용)
CREATE POLICY "강사 정보 공개 조회 가능" ON public.users
    FOR SELECT USING (role IN ('teacher', 'admin'));

-- 이메일/username으로 사용자 조회 가능 (로그인용)
CREATE POLICY "이메일로 사용자 조회 가능" ON public.users
    FOR SELECT USING (true);

-- 사용자는 자신의 정보 수정 가능
CREATE POLICY "사용자는 자신의 정보 수정 가능" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 사용자는 자신의 정보 삽입 가능
CREATE POLICY "사용자는 자신의 정보 삽입 가능" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 관리자 권한 (특정 이메일 기반)
CREATE POLICY "관리자는 모든 사용자 관리 가능" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'free.han@coducation.co.kr',
                'admin@coducation.co.kr'
            )
        )
    );

-- =============================================
-- 3. 완료 메시지
-- =============================================
SELECT '로그인 문제가 해결되었습니다!' as message;
