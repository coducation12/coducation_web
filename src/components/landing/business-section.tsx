'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { getContent } from '@/lib/actions';
import { Layout, Smartphone, Box, Film } from 'lucide-react';

const businessIcons: Record<string, React.ReactNode> = {
  web: <Layout className="h-6 w-6 text-[#00fff7] drop-shadow-[0_0_8px_rgba(0,255,247,0.5)]" />,
  app: <Smartphone className="h-6 w-6 text-[#22c55e] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />,
  '3d': <Box className="h-6 w-6 text-[#f97316] drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />,
  animation: <Film className="h-6 w-6 text-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />,
};

const defaultBusinessAreas = [
  {
    id: 'web',
    title: '웹페이지 제작',
    description: '최신 트렌드를 반영한 반응형 웹사이트 및 최적화된 프론트엔드 개발 서비스를 제공합니다.',
    image: '/images/business/web_development.png'
  },
  {
    id: 'app',
    title: '모바일 앱 제작',
    description: 'iOS 및 Android 환경을 모두 지원하는 하이브리드/네이티브 애플리케이션을 제작합니다.',
    image: '/images/business/app_development.png'
  },
  {
    id: '3d',
    title: '3D 모델링 제작',
    description: '현실감 넘치는 그래픽 하이라이트와 정교한 미래지향적 3D 공간/제품 모델링을 설계합니다.',
    image: '/images/business/three_d_modeling.png'
  },
  {
    id: 'animation',
    title: '애니메이션 제작',
    description: '시선을 사로잡는 모션 그래픽스 및 몰입감 넘치는 역동적인 키프레임 애니메이션을 제작합니다.',
    image: '/images/business/animation_production.png'
  }
];

interface BusinessSectionProps {
  initialBusinessAreas?: any[];
}

export function BusinessSection({ initialBusinessAreas }: BusinessSectionProps) {
  const [businessAreas, setBusinessAreas] = React.useState<any[]>(initialBusinessAreas || defaultBusinessAreas);

  React.useEffect(() => {
    const loadContent = async () => {
      const contentResult = await getContent();
      if (contentResult.success && contentResult.data?.business_areas) {
        setBusinessAreas(contentResult.data.business_areas);
      }
    };
    loadContent();
  }, []);

  return (
    <section id="business-areas" className="container w-full py-16 md:py-32 lg:py-40 border-t border-cyan-500/10">
      <div className="flex flex-col items-center text-center space-y-3 md:space-y-4 mb-12 md:mb-20 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter font-headline text-cyan-100 drop-shadow-[0_0_15px_rgba(0,255,247,0.3)]">
          전문 사업 영역
        </h2>
        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground">
          Coducation은 IT 전문 교육을 넘어 기업 및 브랜드를 위한 최고의 기술 개발 파트너로서 다양한 사업을 영위하고 있습니다.
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto px-4">
        {businessAreas.map((area: any) => (
          <Card 
            key={area.id}
            className="cyber-card overflow-hidden group hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 bg-cyan-950/20 backdrop-blur-sm border-cyan-500/20 shadow-[0_0_30px_rgba(0,0,0,0.6)] flex flex-col h-full"
          >
            {/* 상단: 이미지 영역 (크고 선명하게 노출) */}
            <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden border-b border-cyan-500/20">
              <Image 
                src={area.image || 'https://placehold.co/400x300.png'} 
                alt={area.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* 하단: 텍스트 및 상세 설명 */}
            <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  {businessIcons[area.id] || <Layout className="h-6 w-6 text-[#00fff7]" />}
                  <h3 className="text-lg sm:text-xl font-bold text-cyan-100 font-headline tracking-wide group-hover:text-primary transition-colors">
                    {area.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {area.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
