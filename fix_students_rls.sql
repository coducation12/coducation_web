-- =============================================
-- 🔧 students 테이블 RLS 정책 수정
-- =============================================
-- students 테이블의 RLS 정책을 수정하여 관리자와 강사가 학생 데이터를 조회할 수 있도록 합니다.

-- =============================================
-- 1. 기존 정책 삭제
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
-- 2. 새로운 정책 생성
-- =============================================

-- 모든 사용자는 학생 정보 조회 가능 (관리자/강사용)
CREATE POLICY "모든 사용자는 학생 정보 조회 가능" ON public.students
    FOR SELECT USING (true);

-- 관리자는 학생 정보 관리 가능 (특정 이메일 기반)
CREATE POLICY "관리자는 학생 정보 관리 가능" ON public.students
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
SELECT 'students 테이블 RLS 정책이 수정되었습니다!' as message;
