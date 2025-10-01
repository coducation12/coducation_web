
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/#home', label: '홈', id: 'home' },
  { href: '/#academy', label: '학원안내', id: 'academy' },
  { href: '/#instructors', label: '강사진', id: 'instructors' },
  { href: '/#curriculum', label: '커리큘럼', id: 'curriculum' },
];

export function Header() {
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState('');

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    if (pathname !== '/') {
      // 다른 페이지에서는 일반 링크로 이동
      return;
    }

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerHeight = 56; // 헤더 높이 (h-14 = 3.5rem = 56px)
      const targetPosition = targetElement.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const updateActiveLink = useCallback(() => {
    if (pathname !== '/') {
        setActiveLink('');
        return;
    }

    const scrollPosition = window.scrollY + 100; // 헤더 높이 + 여유 공간
    const sections = navLinks.map(link => ({
      id: link.id,
      element: document.getElementById(link.id)
    })).filter(section => section.element);

      let currentActiveLink = '';
    
    // 현재 스크롤 위치가 어느 섹션에 있는지 확인
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section.element) {
        const sectionTop = section.element.offsetTop;
        const sectionBottom = sectionTop + section.element.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentActiveLink = `/#${section.id}`;
          break;
        }
      }
    }

    // 맨 위에 있을 때는 home을 활성화
    if (!currentActiveLink && scrollPosition < 200) {
        currentActiveLink = '/#home';
      }

      setActiveLink(currentActiveLink);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/') {
      setActiveLink('');
      return;
    }

    // 초기 활성 링크 설정
    updateActiveLink();

    // 스크롤 이벤트 리스너 추가 (throttling 적용)
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname, updateActiveLink]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="relative h-8 w-8 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Coducation Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="hidden font-bold font-headline sm:inline-block">
            Coducation
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-base lg:gap-8 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.id)}
              className={cn(
                'relative py-2 transition-colors hover:text-foreground/80 cursor-pointer',
                pathname === '/' && activeLink === link.href
                  ? 'text-foreground active-nav-link'
                  : 'text-foreground/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end space-x-2">
          <Button asChild>
            <Link href="/login">로그인</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
