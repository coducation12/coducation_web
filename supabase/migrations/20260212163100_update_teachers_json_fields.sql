-- 자격증과 경력 필드를 JSONB로 변경
-- 기존 TEXT 데이터를 JSON 배열 형식으로 마이그레이션

-- certs 필드를 JSONB로 변경
ALTER TABLE teachers 
  ALTER COLUMN certs TYPE JSONB USING 
    CASE 
      WHEN certs IS NULL OR certs = '' THEN '[]'::jsonb
      ELSE jsonb_build_array(
        jsonb_build_object(
          'name', certs,
          'issuer', '',
          'date', ''
        )
      )
    END;

-- career 필드를 JSONB로 변경
ALTER TABLE teachers 
  ALTER COLUMN career TYPE JSONB USING 
    CASE 
      WHEN career IS NULL OR career = '' THEN '[]'::jsonb
      ELSE jsonb_build_array(
        jsonb_build_object(
          'company', career,
          'position', '',
          'period', ''
        )
      )
    END;

-- 기본값 설정
ALTER TABLE teachers 
  ALTER COLUMN certs SET DEFAULT '[]'::jsonb;

ALTER TABLE teachers 
  ALTER COLUMN career SET DEFAULT '[]'::jsonb;

-- 코멘트 추가
COMMENT ON COLUMN teachers.certs IS 'JSON array of certificates: [{ name, issuer, date }]';
COMMENT ON COLUMN teachers.career IS 'JSON array of career history: [{ company, position, period }]';
