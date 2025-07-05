'use client';

import { usePathname } from 'next/navigation';
import { PageBackground } from './page-background';

export function BackgroundWrapper() {
  const pathname = usePathname();
  
  // 메인 페이지(/)에서만 애니메이션 배경 사용
  const isMainPage = pathname === '/';
  const backgroundType = isMainPage ? 'animated' : 'static';

  return <PageBackground type={backgroundType} />;
} 