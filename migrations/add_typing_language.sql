-- 타자연습 기록 테이블 최적화
-- 실행 방법: Supabase 대시보드에서 SQL Editor를 통해 실행하거나 CLI로 적용

-- 1. 불필요한 칼럼 삭제
ALTER TABLE student_activity_logs 
DROP COLUMN IF EXISTS typing_exercise_id,
DROP COLUMN IF EXISTS curriculum_id;

-- 2. 한글/영어 구분을 위한 칼럼 추가
ALTER TABLE student_activity_logs 
ADD COLUMN typing_language text CHECK (typing_language IN ('korean', 'english'));

-- 기존 데이터에 대해서는 기본값을 korean으로 설정 (필요시)
-- UPDATE student_activity_logs 
-- SET typing_language = 'korean' 
-- WHERE activity_type = 'typing' AND typing_language IS NULL;
