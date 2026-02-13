-- 강사(teachers) 테이블에 대한 RLS 정책 수정

-- 1. RLS 활성화 (이미 되어 있을 수 있음)
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "강사는 자신의 정보를 조회할 수 있음" ON teachers;
DROP POLICY IF EXISTS "강사는 자신의 정보를 추가할 수 있음" ON teachers;
DROP POLICY IF EXISTS "강사는 자신의 정보를 수정할 수 있음" ON teachers;
DROP POLICY IF EXISTS "관리자는 모든 강사 정보를 조회할 수 있음" ON teachers;

-- 3. 새로운 정책 생성

-- 강사 본인 정책
CREATE POLICY "강사는 자신의 정보를 조회할 수 있음" ON teachers
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "강사는 자신의 정보를 추가할 수 있음" ON teachers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "강사는 자신의 정보를 수정할 수 있음" ON teachers
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 관리자 정책
CREATE POLICY "관리자는 모든 강사 정보를 조회할 수 있음" ON teachers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 4. users 테이블에 대한 정책 확인 및 추가 (필요시)
-- profile-client.tsx에서 users 테이블의 phone, academy, profile_image_url도 업데이트하므로
-- 해당 필드에 대한 수정 권한이 필요함

DROP POLICY IF EXISTS "사용자는 자신의 기본 정보를 수정할 수 있음" ON users;

CREATE POLICY "사용자는 자신의 기본 정보를 수정할 수 있음" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
