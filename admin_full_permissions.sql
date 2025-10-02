-- =============================================
-- 🔐 관리자 계정 전체 권한 부여 SQL
-- =============================================
-- 관리자 계정이 모든 테이블에 대해 완전한 CRUD 권한을 가지도록 설정합니다.

-- =============================================
-- 1. users 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 사용자 조회 가능
CREATE POLICY "관리자는 모든 사용자 조회 가능" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 사용자 수정 가능
CREATE POLICY "관리자는 모든 사용자 수정 가능" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 사용자 삽입 가능
CREATE POLICY "관리자는 모든 사용자 삽입 가능" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 사용자 삭제 가능
CREATE POLICY "관리자는 모든 사용자 삭제 가능" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 2. students 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 학생 삽입 가능
CREATE POLICY "관리자는 모든 학생 삽입 가능" ON public.students
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 학생 삭제 가능
CREATE POLICY "관리자는 모든 학생 삭제 가능" ON public.students
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 3. teachers 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 강사 삭제 가능
CREATE POLICY "관리자는 모든 강사 삭제 가능" ON public.teachers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 4. community_posts 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 게시글 수정 가능
CREATE POLICY "관리자는 모든 게시글 수정 가능" ON public.community_posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 게시글 삭제 가능
CREATE POLICY "관리자는 모든 게시글 삭제 가능" ON public.community_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 5. community_comments 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 댓글 수정 가능
CREATE POLICY "관리자는 모든 댓글 수정 가능" ON public.community_comments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 댓글 삭제 가능
CREATE POLICY "관리자는 모든 댓글 삭제 가능" ON public.community_comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 6. curriculums 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 커리큘럼 삭제 가능
CREATE POLICY "관리자는 모든 커리큘럼 삭제 가능" ON public.curriculums
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 7. consultations 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 상담문의 삭제 가능
CREATE POLICY "관리자는 모든 상담문의 삭제 가능" ON public.consultations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 8. student_activity_logs 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 활동 로그 수정 가능
CREATE POLICY "관리자는 모든 활동 로그 수정 가능" ON public.student_activity_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 활동 로그 삽입 가능
CREATE POLICY "관리자는 모든 활동 로그 삽입 가능" ON public.student_activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 활동 로그 삭제 가능
CREATE POLICY "관리자는 모든 활동 로그 삭제 가능" ON public.student_activity_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 9. student_learning_logs 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 학습 로그 수정 가능
CREATE POLICY "관리자는 모든 학습 로그 수정 가능" ON public.student_learning_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 학습 로그 삽입 가능
CREATE POLICY "관리자는 모든 학습 로그 삽입 가능" ON public.student_learning_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 학습 로그 삭제 가능
CREATE POLICY "관리자는 모든 학습 로그 삭제 가능" ON public.student_learning_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 10. tuition_payments 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 수강료 수정 가능
CREATE POLICY "관리자는 모든 수강료 수정 가능" ON public.tuition_payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 수강료 삽입 가능
CREATE POLICY "관리자는 모든 수강료 삽입 가능" ON public.tuition_payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 관리자는 모든 수강료 삭제 가능
CREATE POLICY "관리자는 모든 수강료 삭제 가능" ON public.tuition_payments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 11. content_management 테이블 관리자 권한 강화
-- =============================================

-- 관리자는 모든 콘텐츠 관리 가능 (이미 있음)
-- 추가 정책이 필요한 경우 여기에 추가

-- =============================================
-- 12. 완료 메시지
-- =============================================
SELECT '🔐 관리자 계정에 모든 수정 권한이 부여되었습니다!' as message;
