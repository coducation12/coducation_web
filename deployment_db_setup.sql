-- =============================================
-- 🚀 Coducation Web 배포용 DB 설정 스크립트
-- =============================================
-- 이 스크립트는 배포 환경에서 한번에 실행하여 모든 DB 설정을 완료합니다.

-- =============================================
-- 1. RLS (Row Level Security) 활성화
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_management ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. 외래 키 제약 조건 CASCADE 설정
-- =============================================
-- student_activity_logs 테이블
ALTER TABLE student_activity_logs 
DROP CONSTRAINT IF EXISTS student_activity_logs_new_student_id_fkey;

ALTER TABLE student_activity_logs 
ADD CONSTRAINT student_activity_logs_new_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- community_posts 테이블
ALTER TABLE community_posts 
DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;

ALTER TABLE community_posts 
ADD CONSTRAINT community_posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- community_comments 테이블
ALTER TABLE community_comments 
DROP CONSTRAINT IF EXISTS community_comments_user_id_fkey;

ALTER TABLE community_comments 
ADD CONSTRAINT community_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- students 테이블
ALTER TABLE students 
DROP CONSTRAINT IF EXISTS students_user_id_fkey;

ALTER TABLE students 
ADD CONSTRAINT students_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- teachers 테이블
ALTER TABLE teachers 
DROP CONSTRAINT IF EXISTS teachers_user_id_fkey;

ALTER TABLE teachers 
ADD CONSTRAINT teachers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- tuition_payments 테이블
ALTER TABLE tuition_payments 
DROP CONSTRAINT IF EXISTS tuition_payments_student_id_fkey;

ALTER TABLE tuition_payments 
ADD CONSTRAINT tuition_payments_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- student_learning_logs 테이블
ALTER TABLE student_learning_logs 
DROP CONSTRAINT IF EXISTS student_learning_logs_student_id_fkey;

ALTER TABLE student_learning_logs 
ADD CONSTRAINT student_learning_logs_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- curriculums 테이블
ALTER TABLE curriculums 
DROP CONSTRAINT IF EXISTS curriculums_created_by_fkey;

ALTER TABLE curriculums 
ADD CONSTRAINT curriculums_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- approval_logs 테이블
ALTER TABLE approval_logs 
DROP CONSTRAINT IF EXISTS approval_logs_processed_by_fkey;

ALTER TABLE approval_logs 
ADD CONSTRAINT approval_logs_processed_by_fkey 
FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================
-- 3. RLS 정책 설정
-- =============================================

-- users 테이블 정책
DROP POLICY IF EXISTS "Users: Only self can select" ON public.users;
CREATE POLICY "Users: Only self can select" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users: Only self can update" ON public.users;
CREATE POLICY "Users: Only self can update" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users: Only self can insert" ON public.users;
CREATE POLICY "Users: Only self can insert" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users: Teacher/Admin can select all" ON public.users;
CREATE POLICY "Users: Teacher/Admin can select all" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

DROP POLICY IF EXISTS "Users: Teacher/Admin can update all" ON public.users;
CREATE POLICY "Users: Teacher/Admin can update all" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

DROP POLICY IF EXISTS "Users: Teacher/Admin can insert all" ON public.users;
CREATE POLICY "Users: Teacher/Admin can insert all" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

DROP POLICY IF EXISTS "Admin can delete users" ON public.users;
CREATE POLICY "Admin can delete users" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- students 테이블 정책
DROP POLICY IF EXISTS "관리자는 모든 학생 조회 가능" ON public.students;
CREATE POLICY "관리자는 모든 학생 조회 가능" ON public.students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "강사는 담당 학생만 조회 가능" ON public.students;
CREATE POLICY "강사는 담당 학생만 조회 가능" ON public.students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
            AND students.assigned_teachers @> ARRAY[users.id::uuid]
        )
    );

DROP POLICY IF EXISTS "학생은 자신의 정보만 조회 가능" ON public.students;
CREATE POLICY "학생은 자신의 정보만 조회 가능" ON public.students
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "학부모는 자녀 정보만 조회 가능" ON public.students;
CREATE POLICY "학부모는 자녀 정보만 조회 가능" ON public.students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'parent'
            AND students.parent_id = users.id
        )
    );

DROP POLICY IF EXISTS "관리자는 학생 정보 수정 가능" ON public.students;
CREATE POLICY "관리자는 학생 정보 수정 가능" ON public.students
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "관리자는 학생 정보 삽입 가능" ON public.students;
CREATE POLICY "관리자는 학생 정보 삽입 가능" ON public.students
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- teachers 테이블 정책
DROP POLICY IF EXISTS "관리자는 모든 강사 조회 가능" ON public.teachers;
CREATE POLICY "관리자는 모든 강사 조회 가능" ON public.teachers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "강사는 자신의 정보만 조회 가능" ON public.teachers;
CREATE POLICY "강사는 자신의 정보만 조회 가능" ON public.teachers
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "관리자는 강사 정보 수정 가능" ON public.teachers;
CREATE POLICY "관리자는 강사 정보 수정 가능" ON public.teachers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "관리자는 강사 정보 삽입 가능" ON public.teachers;
CREATE POLICY "관리자는 강사 정보 삽입 가능" ON public.teachers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- community_posts 테이블 정책
DROP POLICY IF EXISTS "모든 사용자는 게시글 조회 가능" ON public.community_posts;
CREATE POLICY "모든 사용자는 게시글 조회 가능" ON public.community_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "인증된 사용자는 게시글 작성 가능" ON public.community_posts;
CREATE POLICY "인증된 사용자는 게시글 작성 가능" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "작성자는 자신의 게시글 수정 가능" ON public.community_posts;
CREATE POLICY "작성자는 자신의 게시글 수정 가능" ON public.community_posts
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "작성자는 자신의 게시글 삭제 가능" ON public.community_posts;
CREATE POLICY "작성자는 자신의 게시글 삭제 가능" ON public.community_posts
    FOR DELETE USING (user_id = auth.uid());

-- community_comments 테이블 정책
DROP POLICY IF EXISTS "모든 사용자는 댓글 조회 가능" ON public.community_comments;
CREATE POLICY "모든 사용자는 댓글 조회 가능" ON public.community_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "인증된 사용자는 댓글 작성 가능" ON public.community_comments;
CREATE POLICY "인증된 사용자는 댓글 작성 가능" ON public.community_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "작성자는 자신의 댓글 수정 가능" ON public.community_comments;
CREATE POLICY "작성자는 자신의 댓글 수정 가능" ON public.community_comments
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "작성자는 자신의 댓글 삭제 가능" ON public.community_comments;
CREATE POLICY "작성자는 자신의 댓글 삭제 가능" ON public.community_comments
    FOR DELETE USING (user_id = auth.uid());

-- curriculums 테이블 정책
DROP POLICY IF EXISTS "모든 사용자는 커리큘럼 조회 가능" ON public.curriculums;
CREATE POLICY "모든 사용자는 커리큘럼 조회 가능" ON public.curriculums
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "강사와 관리자는 커리큘럼 작성 가능" ON public.curriculums;
CREATE POLICY "강사와 관리자는 커리큘럼 작성 가능" ON public.curriculums
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('teacher', 'admin')
        )
    );

DROP POLICY IF EXISTS "작성자와 관리자는 커리큘럼 수정 가능" ON public.curriculums;
CREATE POLICY "작성자와 관리자는 커리큘럼 수정 가능" ON public.curriculums
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "작성자와 관리자는 커리큘럼 삭제 가능" ON public.curriculums;
CREATE POLICY "작성자와 관리자는 커리큘럼 삭제 가능" ON public.curriculums
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- consultations 테이블 정책
DROP POLICY IF EXISTS "관리자와 강사는 상담문의 조회 가능" ON public.consultations;
CREATE POLICY "관리자와 강사는 상담문의 조회 가능" ON public.consultations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'teacher')
        )
    );

DROP POLICY IF EXISTS "인증된 사용자는 상담문의 작성 가능" ON public.consultations;
CREATE POLICY "인증된 사용자는 상담문의 작성 가능" ON public.consultations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "관리자와 강사는 상담문의 수정 가능" ON public.consultations;
CREATE POLICY "관리자와 강사는 상담문의 수정 가능" ON public.consultations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'teacher')
        )
    );

-- student_activity_logs 테이블 정책
DROP POLICY IF EXISTS "관리자는 모든 활동 로그 조회 가능" ON public.student_activity_logs;
CREATE POLICY "관리자는 모든 활동 로그 조회 가능" ON public.student_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "강사는 담당 학생 활동 로그 조회 가능" ON public.student_activity_logs;
CREATE POLICY "강사는 담당 학생 활동 로그 조회 가능" ON public.student_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
            AND EXISTS (
                SELECT 1 FROM public.students 
                WHERE students.user_id = student_activity_logs.student_id
                AND students.assigned_teachers @> ARRAY[users.id::uuid]
            )
        )
    );

DROP POLICY IF EXISTS "학생은 자신의 활동 로그 조회 가능" ON public.student_activity_logs;
CREATE POLICY "학생은 자신의 활동 로그 조회 가능" ON public.student_activity_logs
    FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "학부모는 자녀 활동 로그 조회 가능" ON public.student_activity_logs;
CREATE POLICY "학부모는 자녀 활동 로그 조회 가능" ON public.student_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'parent'
            AND EXISTS (
                SELECT 1 FROM public.students 
                WHERE students.user_id = student_activity_logs.student_id
                AND students.parent_id = users.id
            )
        )
    );

-- student_learning_logs 테이블 정책
DROP POLICY IF EXISTS "관리자는 모든 학습 로그 조회 가능" ON public.student_learning_logs;
CREATE POLICY "관리자는 모든 학습 로그 조회 가능" ON public.student_learning_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "강사는 담당 학생 학습 로그 조회 가능" ON public.student_learning_logs;
CREATE POLICY "강사는 담당 학생 학습 로그 조회 가능" ON public.student_learning_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
            AND EXISTS (
                SELECT 1 FROM public.students 
                WHERE students.user_id = student_learning_logs.student_id
                AND students.assigned_teachers @> ARRAY[users.id::uuid]
            )
        )
    );

DROP POLICY IF EXISTS "학생은 자신의 학습 로그 조회 가능" ON public.student_learning_logs;
CREATE POLICY "학생은 자신의 학습 로그 조회 가능" ON public.student_learning_logs
    FOR SELECT USING (student_id = auth.uid());

-- tuition_payments 테이블 정책
DROP POLICY IF EXISTS "관리자는 모든 수강료 조회 가능" ON public.tuition_payments;
CREATE POLICY "관리자는 모든 수강료 조회 가능" ON public.tuition_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "학부모는 자녀 수강료 조회 가능" ON public.tuition_payments;
CREATE POLICY "학부모는 자녀 수강료 조회 가능" ON public.tuition_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'parent'
            AND EXISTS (
                SELECT 1 FROM public.students 
                WHERE students.user_id = tuition_payments.student_id
                AND students.parent_id = users.id
            )
        )
    );

-- content_management 테이블 정책
DROP POLICY IF EXISTS "관리자는 콘텐츠 관리 가능" ON public.content_management;
CREATE POLICY "관리자는 콘텐츠 관리 가능" ON public.content_management
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 4. 기존 정책 정리 (중복 제거)
-- =============================================
-- 기존에 있던 정책들을 정리합니다.
DROP POLICY IF EXISTS "Users: Only self can select" ON public.users;
DROP POLICY IF EXISTS "Users: Only self can update" ON public.users;
DROP POLICY IF EXISTS "Users: Only self can insert" ON public.users;
DROP POLICY IF EXISTS "Users: Teacher/Admin can select all" ON public.users;
DROP POLICY IF EXISTS "Users: Teacher/Admin can update all" ON public.users;
DROP POLICY IF EXISTS "Users: Teacher/Admin can insert all" ON public.users;
DROP POLICY IF EXISTS "Admin can delete users" ON public.users;

-- =============================================
-- 5. 공개 조회 정책 추가 (메인화면 강사진 표시용)
-- =============================================

-- 강사진 공개 조회를 위한 정책 추가
CREATE POLICY "모든 사용자는 강사 정보 조회 가능" ON public.users
    FOR SELECT USING (role IN ('teacher', 'admin'));

CREATE POLICY "모든 사용자는 강사 상세 정보 조회 가능" ON public.teachers
    FOR SELECT USING (true);

-- =============================================
-- 6. 관리자 계정 전체 권한 부여
-- =============================================

-- users 테이블 관리자 권한 강화
CREATE POLICY "관리자는 모든 사용자 조회 가능" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 사용자 수정 가능" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 사용자 삽입 가능" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 사용자 삭제 가능" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- students 테이블 관리자 권한 강화
CREATE POLICY "관리자는 모든 학생 삽입 가능" ON public.students
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 학생 삭제 가능" ON public.students
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- teachers 테이블 관리자 권한 강화
CREATE POLICY "관리자는 모든 강사 삭제 가능" ON public.teachers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- community_posts 테이블 관리자 권한 강화
CREATE POLICY "관리자는 모든 게시글 수정 가능" ON public.community_posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 게시글 삭제 가능" ON public.community_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- community_comments 테이블 관리자 권한 강화
CREATE POLICY "관리자는 모든 댓글 수정 가능" ON public.community_comments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 댓글 삭제 가능" ON public.community_comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- curriculums 테이블 관리자 권한 강화
CREATE POLICY "관리자는 모든 커리큘럼 삭제 가능" ON public.curriculums
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- consultations 테이블 관리자 권한 강화
CREATE POLICY "관리자는 모든 상담문의 삭제 가능" ON public.consultations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- student_activity_logs 테이블 관리자 권한 강화
CREATE POLICY "관리자는 모든 활동 로그 수정 가능" ON public.student_activity_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 활동 로그 삽입 가능" ON public.student_activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 활동 로그 삭제 가능" ON public.student_activity_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- student_learning_logs 테이블 관리자 권한 강화
CREATE POLICY "관리자는 모든 학습 로그 수정 가능" ON public.student_learning_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 학습 로그 삽입 가능" ON public.student_learning_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 학습 로그 삭제 가능" ON public.student_learning_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- tuition_payments 테이블 관리자 권한 강화
CREATE POLICY "관리자는 모든 수강료 수정 가능" ON public.tuition_payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 수강료 삽입 가능" ON public.tuition_payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "관리자는 모든 수강료 삭제 가능" ON public.tuition_payments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 7. 완료 메시지
-- =============================================
-- 이 스크립트가 성공적으로 실행되면 다음이 완료됩니다:
-- ✅ 모든 테이블에 RLS 활성화
-- ✅ 외래 키 제약 조건 CASCADE 설정
-- ✅ 각 테이블별 적절한 RLS 정책 설정
-- ✅ 보안 취약점 해결
-- ✅ 메인화면 강사진 표시 문제 해결
-- ✅ 관리자 계정 전체 권한 부여

SELECT '🚀 Coducation Web DB 설정이 완료되었습니다!' as message;

