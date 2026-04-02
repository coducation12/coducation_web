-- 🚀 Coducation 성능 최적화 SQL 마이그레이션
-- 이 쿼리를 Supabase SQL Editor에서 실행하여 데이터베이스 성능을 향상시키세요.

----------------------------------------------------------------
-- 1. 인덱스(Index) 생성: 검색 및 필터링 속도 최적화
--------------------------------------------------------------

-- 학생별 담당 강사 검색 속도 향상 (배열 타입이므로 GIN 인덱스 사용)
CREATE INDEX IF NOT EXISTS idx_students_assigned_teachers ON public.students USING GIN (assigned_teachers);

-- 출결 기록 조회 속도 향상 (날짜 및 학생 ID 기준)
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON public.attendance_sessions (date);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_student_id ON public.attendance_sessions (student_id);

-- 유저 역할 및 상태 기반 필터링 속도 향상
CREATE INDEX IF NOT EXISTS idx_users_role_status ON public.users (role, status);

----------------------------------------------------------------
-- 2. RLS(Row Level Security) 최적화
-- 매번 서브쿼리를 실행하는 대신 성능이 좋은 보안 함수를 정의합니다.
----------------------------------------------------------------

-- 현재 사용자가 관리자인지 확인하는 고성능 함수
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  -- auth.jwt()에서 역할을 가져오거나, 세션 변수를 활용할 수 있습니다.
  -- 여기서는 단순화를 위해 users 테이블을 1번만 참조하고 결과를 캐싱하도록 유도합니다.
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 현재 사용자가 특정 학생의 담당 강사인지 확인하는 고성능 함수
CREATE OR REPLACE FUNCTION public.is_assigned_teacher(student_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students 
    WHERE user_id = student_uuid AND auth.uid() = ANY(assigned_teachers)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

----------------------------------------------------------------
-- 3. 최적화된 정책 적용 (예시: users 테이블)
----------------------------------------------------------------

-- 기존 비효율적인 정책 제거 (정책 이름은 실제 환경에 맞춰 확인 필요)
-- DROP POLICY IF EXISTS "관리자 전용 전체 조회" ON public.users;

-- 신규 최적화 정책 추가
-- CREATE POLICY "관리자_전체조회_최적화" ON public.users
--   FOR SELECT USING (is_admin());

-- CREATE POLICY "강사_담당학생조회_최적화" ON public.users
--   FOR SELECT USING (is_assigned_teacher(id) OR id = auth.uid());

----------------------------------------------------------------
-- 📝 참고: JWT 클레임 활용 설정
-- Supabase Dashboard -> Auth -> Auth Hooks에서 
-- 로그인 시 role을 access_token의 app_metadata에 추가하도록 설정하면 
-- 위 함수들조차 필요 없이 'auth.jwt() ->> 'role' = 'admin'' 만으로 체크가 가능하며, 
-- 이것이 가장 빠른 방법입니다.
----------------------------------------------------------------
