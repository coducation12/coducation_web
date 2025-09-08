-- 상담 문의 테이블 생성
CREATE TABLE IF NOT EXISTS public.consultations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    academy VARCHAR(50) NOT NULL DEFAULT 'coding-maker',
    subject VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    privacy_consent BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_note TEXT,
    CONSTRAINT chk_academy_valid CHECK (academy IN ('coding-maker', 'gwangyang-coding'))
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.consultations(created_at);
CREATE INDEX IF NOT EXISTS idx_consultations_subject ON public.consultations(subject);
CREATE INDEX IF NOT EXISTS idx_consultations_academy ON public.consultations(academy);

-- RLS 정책 설정 (관리자만 조회 가능)
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 관리자 조회 정책
CREATE POLICY "관리자는 모든 상담 문의를 조회할 수 있음" ON public.consultations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 상담 문의 삽입 정책 (모든 사용자가 가능)
CREATE POLICY "모든 사용자가 상담 문의를 등록할 수 있음" ON public.consultations
    FOR INSERT WITH CHECK (true);

-- 관리자 업데이트 정책
CREATE POLICY "관리자는 상담 문의를 수정할 수 있음" ON public.consultations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_consultations_updated_at 
    BEFORE UPDATE ON public.consultations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
