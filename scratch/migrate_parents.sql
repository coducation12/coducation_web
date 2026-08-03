-- 1. students 테이블에 parent_phone 컬럼 추가
ALTER TABLE public.students
ADD COLUMN parent_phone TEXT;

-- 2. 기존 parent_id를 사용하여 users 테이블에서 부모의 phone 번호를 가져와 parent_phone에 업데이트
UPDATE public.students s
SET parent_phone = (
  SELECT phone 
  FROM public.users u 
  WHERE u.id = s.parent_id
)
WHERE s.parent_id IS NOT NULL;

-- 3. students 테이블에서 parent_id 제거
ALTER TABLE public.students
DROP COLUMN parent_id;

-- 4. 부모와 연관된 커뮤니티 데이터 및 알림 로그 완전 삭제 (고립 계정 방지)
DELETE FROM public.community_posts
WHERE user_id IN (SELECT id FROM public.users WHERE role = 'parent');

DELETE FROM public.community_comments
WHERE user_id IN (SELECT id FROM public.users WHERE role = 'parent');


-- 5. 학부모 계정 완전 삭제
DELETE FROM public.users
WHERE role = 'parent';
