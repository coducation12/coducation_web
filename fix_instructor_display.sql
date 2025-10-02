-- =============================================
-- 🔧 강사진 표시 문제 해결을 위한 RLS 정책 추가
-- =============================================
-- 메인화면에서 강사진이 표시되지 않는 문제를 해결합니다.

-- 1. users 테이블에 공개 조회 정책 추가
CREATE POLICY "모든 사용자는 강사 정보 조회 가능" ON public.users
    FOR SELECT USING (role IN ('teacher', 'admin'));

-- 2. teachers 테이블에 공개 조회 정책 추가  
CREATE POLICY "모든 사용자는 강사 상세 정보 조회 가능" ON public.teachers
    FOR SELECT USING (true);

-- 3. 완료 메시지
SELECT '강사진 표시 문제가 해결되었습니다!' as message;
