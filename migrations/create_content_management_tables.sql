-- 컨텐츠 관리를 위한 테이블들 생성

-- About 섹션 테이블
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  mission TEXT NOT NULL,
  vision TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academy 섹션 테이블 
CREATE TABLE IF NOT EXISTS academy_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academy 특징 카드 테이블
CREATE TABLE IF NOT EXISTS academy_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academy_content(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_type TEXT NOT NULL, -- 'map-pin', 'book-open', 'users'
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academy 슬라이드 테이블
CREATE TABLE IF NOT EXISTS academy_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES academy_content(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정 (관리자만 수정 가능)
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_slides ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can view about content" ON about_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view academy content" ON academy_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view academy features" ON academy_features FOR SELECT USING (true);
CREATE POLICY "Anyone can view academy slides" ON academy_slides FOR SELECT USING (true);

-- 관리자만 수정 가능 (실제로는 auth.uid()와 users 테이블을 조인해야 하지만, 현재는 쿠키 기반이므로 임시로 모두 허용)
CREATE POLICY "Admin can modify about content" ON about_content FOR ALL USING (true);
CREATE POLICY "Admin can modify academy content" ON academy_content FOR ALL USING (true);
CREATE POLICY "Admin can modify academy features" ON academy_features FOR ALL USING (true);
CREATE POLICY "Admin can modify academy slides" ON academy_slides FOR ALL USING (true);

-- 기본 데이터 삽입
INSERT INTO about_content (title, subtitle, mission, vision, image_url) VALUES 
('About Coducation', 
 '우리는 코딩 교육을 통해 아이들이 미래의 창의적인 인재로 성장할 수 있도록 돕습니다.',
 'Coducation은 단순한 코딩 기술 교육을 넘어, 논리적 사고력, 문제 해결 능력, 창의력을 함양하는 것을 목표로 합니다. 학생 개개인의 잠재력을 최대로 이끌어내어 미래 사회가 요구하는 핵심 인재를 양성합니다.',
 '우리는 모든 학생이 코딩을 통해 자신의 아이디어를 현실로 만들 수 있는 세상을 꿈꿉니다. 지역 사회와 함께 성장하며, 최고의 코딩 교육 허브가 되는 것이 우리의 비전입니다.',
 'https://placehold.co/600x400.png')
ON CONFLICT DO NOTHING;

INSERT INTO academy_content (title, subtitle) VALUES 
('코딩메이커 학원 안내', '창의력과 기술이 만나는 곳, 코딩메이커 학원에 오신 것을 환영합니다.')
ON CONFLICT DO NOTHING;

-- Academy ID를 동적으로 가져와서 관련 데이터 삽입
DO $$
DECLARE
    academy_uuid UUID;
BEGIN
    -- Academy ID 가져오기
    SELECT id INTO academy_uuid FROM academy_content LIMIT 1;
    
    -- Academy 특징 데이터 삽입
    INSERT INTO academy_features (academy_id, title, description, icon_type, order_index) VALUES
    (academy_uuid, '최적의 학습 환경', '전남 광양에 위치한 저희 학원은 학생들이 코딩에만 집중할 수 있도록 쾌적하고 현대적인 학습 공간을 제공합니다.', 'map-pin', 1),
    (academy_uuid, '체계적인 교육 철학', '프로젝트 기반 학습(PBL)을 통해 학생들이 실제 문제를 해결하며 배우는 실용적인 교육을 추구합니다.', 'book-open', 2),
    (academy_uuid, '소수 정예 맞춤 수업', '소수 정예로 클래스를 운영하여 강사가 학생 한 명 한 명에게 집중하고, 맞춤형 피드백을 제공합니다.', 'users', 3)
    ON CONFLICT DO NOTHING;
    
    -- Academy 슬라이드 데이터 삽입  
    INSERT INTO academy_slides (academy_id, title, description, image_url, order_index) VALUES
    (academy_uuid, '최첨단 학습 환경', '학생들이 창의력을 마음껏 발휘할 수 있는 현대적이고 영감을 주는 공간을 제공합니다.', 'https://placehold.co/600x400.png', 1),
    (academy_uuid, '개인별 맞춤 지도', '소수 정예 수업으로 강사가 학생 한 명 한 명에게 집중하여 잠재력을 최대로 이끌어냅니다.', 'https://placehold.co/600x400.png', 2),
    (academy_uuid, '실전 프로젝트 중심', '실제 문제를 해결하는 프로젝트를 통해 코딩 실력과 문제 해결 능력을 동시에 기릅니다.', 'https://placehold.co/600x400.png', 3)
    ON CONFLICT DO NOTHING;
END $$;
