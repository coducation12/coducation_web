-- 학생 가입 요청 테이블 생성
CREATE TABLE IF NOT EXISTS public.student_signup_requests (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_year INTEGER,
    academy VARCHAR(50) NOT NULL DEFAULT 'coding-maker',
    assigned_teacher_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_academy_valid CHECK (academy IN ('coding-maker', 'gwangyang-coding')),
    CONSTRAINT chk_status_valid CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_student_signup_requests_status ON public.student_signup_requests(status);
CREATE INDEX IF NOT EXISTS idx_student_signup_requests_academy ON public.student_signup_requests(academy);
CREATE INDEX IF NOT EXISTS idx_student_signup_requests_teacher ON public.student_signup_requests(assigned_teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_signup_requests_requested_at ON public.student_signup_requests(requested_at);

-- RLS 정책 설정
ALTER TABLE public.student_signup_requests ENABLE ROW LEVEL SECURITY;

-- 관리자와 교사는 모든 가입 요청을 조회할 수 있음
CREATE POLICY "관리자와 교사는 가입 요청을 조회할 수 있음" ON public.student_signup_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR users.role = 'teacher')
        )
    );

-- 모든 사용자가 가입 요청을 등록할 수 있음
CREATE POLICY "모든 사용자가 가입 요청을 등록할 수 있음" ON public.student_signup_requests
    FOR INSERT WITH CHECK (true);

-- 관리자와 교사는 가입 요청을 수정할 수 있음 (승인/거부)
CREATE POLICY "관리자와 교사는 가입 요청을 수정할 수 있음" ON public.student_signup_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR users.role = 'teacher')
        )
    );

-- 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_student_signup_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_student_signup_requests_updated_at 
    BEFORE UPDATE ON public.student_signup_requests 
    FOR EACH ROW EXECUTE FUNCTION update_student_signup_requests_updated_at();
