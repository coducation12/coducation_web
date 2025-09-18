-- pending 상태의 학생들을 active로 변경
UPDATE users 
SET status = 'active' 
WHERE status = 'pending' AND role = 'student';
