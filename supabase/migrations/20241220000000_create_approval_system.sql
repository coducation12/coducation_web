-- 새로운 승인 시스템을 위한 테이블 생성
-- 학생 가입 요청 전용 테이블 생성
CREATE TABLE student_signup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    academy TEXT NOT NULL CHECK (academy IN ('coding-maker', 'gwangyang-coding')),
    assigned_teacher_id UUID REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 승인/거부 이력 추적 테이블
CREATE TABLE approval_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES student_signup_requests(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
    processed_by UUID NOT NULL REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_student_signup_requests_status ON student_signup_requests(status);
CREATE INDEX idx_student_signup_requests_student_id ON student_signup_requests(student_id);
CREATE INDEX idx_student_signup_requests_teacher_id ON student_signup_requests(assigned_teacher_id);
CREATE INDEX idx_approval_logs_request_id ON approval_logs(request_id);

-- RLS 활성화
ALTER TABLE student_signup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성

-- student_signup_requests 테이블 정책
-- 관리자는 모든 요청을 볼 수 있음
CREATE POLICY "관리자는 모든 가입 요청 조회 가능" ON student_signup_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 강사는 담당 학생의 요청만 볼 수 있음
CREATE POLICY "강사는 담당 학생 요청만 조회 가능" ON student_signup_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
            AND student_signup_requests.assigned_teacher_id = users.id
        )
    );

-- 관리자와 강사는 요청을 승인/거부할 수 있음
CREATE POLICY "관리자와 강사는 요청 처리 가능" ON student_signup_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'teacher')
        )
    );

-- approval_logs 테이블 정책
-- 관리자는 모든 로그를 볼 수 있음
CREATE POLICY "관리자는 모든 승인 로그 조회 가능" ON approval_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 강사는 자신이 처리한 로그만 볼 수 있음
CREATE POLICY "강사는 자신의 승인 로그만 조회 가능" ON approval_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'teacher'
            AND approval_logs.processed_by = users.id
        )
    );

-- 관리자와 강사는 로그를 생성할 수 있음
CREATE POLICY "관리자와 강사는 승인 로그 생성 가능" ON approval_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'teacher')
        )
    );

-- 기존 updated_at 트리거 제거 (DB에 해당 컬럼이 없으므로)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

