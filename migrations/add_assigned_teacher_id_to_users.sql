-- users 테이블에 assigned_teacher_id 컬럼 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS assigned_teacher_id UUID REFERENCES public.users(id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_assigned_teacher_id ON public.users(assigned_teacher_id);
