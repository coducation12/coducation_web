-- =============================================
-- 🔧 콘텐츠 관리 테이블 링크 기능 추가
-- =============================================
-- 학원안내 하단 카드에 링크 기능을 추가하기 위해 DB를 수정합니다.

-- =============================================
-- 1. 불필요한 컬럼 삭제
-- =============================================
-- about 관련 컬럼들 삭제 (사용되지 않음)
ALTER TABLE public.content_management DROP COLUMN IF EXISTS about_title;
ALTER TABLE public.content_management DROP COLUMN IF EXISTS about_subtitle;
ALTER TABLE public.content_management DROP COLUMN IF EXISTS about_mission;
ALTER TABLE public.content_management DROP COLUMN IF EXISTS about_vision;
ALTER TABLE public.content_management DROP COLUMN IF EXISTS about_image;

-- =============================================
-- 2. 링크 관련 컬럼 추가
-- =============================================
-- 첫 번째 카드 링크
ALTER TABLE public.content_management ADD COLUMN IF NOT EXISTS featured_card_1_link TEXT DEFAULT '';

-- 두 번째 카드 링크
ALTER TABLE public.content_management ADD COLUMN IF NOT EXISTS featured_card_2_link TEXT DEFAULT '';

-- =============================================
-- 3. 기존 데이터에 기본 링크 설정
-- =============================================
UPDATE public.content_management 
SET 
  featured_card_1_link = 'https://maps.google.com/?q=전남+광양시+중마동',
  featured_card_2_link = 'https://maps.google.com/?q=전남+광양시+창덕동'
WHERE featured_card_1_link = '' OR featured_card_1_link IS NULL;

-- =============================================
-- 4. 완료 메시지
-- =============================================
SELECT '콘텐츠 관리 테이블이 링크 기능으로 업데이트되었습니다!' as message;
