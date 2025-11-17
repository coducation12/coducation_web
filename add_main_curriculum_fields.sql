-- =============================================
-- 메인화면 커리큘럼 표시 필드 추가
-- =============================================
-- 이 스크립트는 curriculums 테이블에 메인화면 표시 여부와 순서를 관리하는 필드를 추가합니다.

-- curriculums 테이블에 show_on_main 필드 추가
ALTER TABLE curriculums 
ADD COLUMN IF NOT EXISTS show_on_main BOOLEAN DEFAULT false;

-- curriculums 테이블에 main_display_order 필드 추가
ALTER TABLE curriculums 
ADD COLUMN IF NOT EXISTS main_display_order INTEGER DEFAULT 0;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_curriculums_show_on_main ON curriculums(show_on_main, main_display_order) WHERE show_on_main = true;

-- 코멘트 추가
COMMENT ON COLUMN curriculums.show_on_main IS '메인화면에 표시할 커리큘럼 여부';
COMMENT ON COLUMN curriculums.main_display_order IS '메인화면에서의 표시 순서 (같은 레벨 내에서)';

