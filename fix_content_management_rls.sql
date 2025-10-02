-- =============================================
-- 🔧 content_management RLS 정책 수정
-- =============================================
-- content_management 테이블의 RLS 정책을 수정하여 관리자가 수정할 수 있도록 합니다.

-- =============================================
-- 1. 기존 정책 삭제
-- =============================================
DROP POLICY IF EXISTS "관리자는 콘텐츠 관리 가능" ON public.content_management;
DROP POLICY IF EXISTS "모든 사용자는 콘텐츠 조회 가능" ON public.content_management;

-- =============================================
-- 2. 새로운 정책 생성
-- =============================================

-- 모든 사용자는 콘텐츠 조회 가능 (메인페이지용)
CREATE POLICY "모든 사용자는 콘텐츠 조회 가능" ON public.content_management
    FOR SELECT USING (true);

-- 관리자는 콘텐츠 관리 가능 (특정 이메일 기반)
CREATE POLICY "관리자는 콘텐츠 관리 가능" ON public.content_management
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
SELECT 'content_management RLS 정책이 수정되었습니다!' as message;
