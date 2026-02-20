-- teachers 테이블에 label_color 컬럼 추가
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS label_color VARCHAR(20) DEFAULT '#00fff7';

-- 기존 데이터에 기본값 적용 (필요한 경우)
UPDATE teachers SET label_color = '#00fff7' WHERE label_color IS NULL;
