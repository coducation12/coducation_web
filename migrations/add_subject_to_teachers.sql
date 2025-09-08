-- teachers 테이블에 subject 컬럼 추가
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS subject text;

-- 기본값 설정 (기존 데이터가 있다면)
UPDATE teachers SET subject = '코딩 교육' WHERE subject IS NULL;
