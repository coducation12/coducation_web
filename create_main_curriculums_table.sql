-- =============================================
-- 메인화면 커리큘럼 전용 테이블 생성
-- =============================================
-- 기존 curriculums 테이블과 독립적으로 메인화면에 표시할 커리큘럼을 관리합니다.

-- 메인화면 커리큘럼 테이블 생성
CREATE TABLE IF NOT EXISTS public.main_curriculums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  level text NOT NULL CHECK (level IN ('기초', '중급', '고급')),
  image text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_main_curriculums_level_order ON public.main_curriculums(level, display_order);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_main_curriculums_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_main_curriculums_updated_at ON public.main_curriculums;
CREATE TRIGGER trigger_update_main_curriculums_updated_at
  BEFORE UPDATE ON public.main_curriculums
  FOR EACH ROW
  EXECUTE FUNCTION update_main_curriculums_updated_at();

-- RLS 활성화
ALTER TABLE public.main_curriculums ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정
-- 모든 사용자는 조회 가능
DROP POLICY IF EXISTS "모든 사용자는 메인 커리큘럼 조회 가능" ON public.main_curriculums;
CREATE POLICY "모든 사용자는 메인 커리큘럼 조회 가능" ON public.main_curriculums
  FOR SELECT USING (true);

-- 관리자만 추가/수정/삭제 가능
DROP POLICY IF EXISTS "관리자는 메인 커리큘럼 추가 가능" ON public.main_curriculums;
CREATE POLICY "관리자는 메인 커리큘럼 추가 가능" ON public.main_curriculums
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "관리자는 메인 커리큘럼 수정 가능" ON public.main_curriculums;
CREATE POLICY "관리자는 메인 커리큘럼 수정 가능" ON public.main_curriculums
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "관리자는 메인 커리큘럼 삭제 가능" ON public.main_curriculums;
CREATE POLICY "관리자는 메인 커리큘럼 삭제 가능" ON public.main_curriculums
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 코멘트 추가
COMMENT ON TABLE public.main_curriculums IS '메인화면에 표시할 커리큘럼 정보';
COMMENT ON COLUMN public.main_curriculums.level IS '커리큘럼 레벨: 기초, 중급, 고급';
COMMENT ON COLUMN public.main_curriculums.display_order IS '같은 레벨 내에서의 표시 순서';

