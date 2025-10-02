-- =============================================
-- 🔧 무한 재귀 오류 해결 SQL
-- =============================================
-- users 테이블의 RLS 정책에서 무한 재귀 문제를 해결합니다.

-- =============================================
-- 1. 기존 문제가 있는 정책들 삭제
-- =============================================
DROP POLICY IF EXISTS "관리자는 모든 사용자 조회 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 수정 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 삽입 가능" ON public.users;
DROP POLICY IF EXISTS "관리자는 모든 사용자 삭제 가능" ON public.users;

-- =============================================
-- 2. 무한 재귀 없는 새로운 정책 생성
-- =============================================

-- 관리자는 모든 사용자 조회 가능 (auth.uid() 직접 사용)
CREATE POLICY "관리자는 모든 사용자 조회 가능" ON public.users
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'free.han@coducation.co.kr',
                'admin@coducation.co.kr'
            )
        )
    );

-- 관리자는 모든 사용자 수정 가능
CREATE POLICY "관리자는 모든 사용자 수정 가능" ON public.users
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'free.han@coducation.co.kr',
                'admin@coducation.co.kr'
            )
        )
    );

-- 관리자는 모든 사용자 삽입 가능
CREATE POLICY "관리자는 모든 사용자 삽입 가능" ON public.users
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'free.han@coducation.co.kr',
                'admin@coducation.co.kr'
            )
        )
    );

-- 관리자는 모든 사용자 삭제 가능
CREATE POLICY "관리자는 모든 사용자 삭제 가능" ON public.users
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND
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
SELECT '무한 재귀 오류가 해결되었습니다!' as message;
