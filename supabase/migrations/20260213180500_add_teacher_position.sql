-- teachers 테이블에 직위(position) 컬럼 추가
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS position TEXT;

-- 기존 bio 데이터가 있는 경우, 이를 기반으로 초기 직위 설정 (선택적)
-- 현재는 비워두거나 기본값을 설정할 수 있음
COMMENT ON COLUMN teachers.position IS '강사의 직위 또는 직책 (예: 선임강사, 실장 등)';
