
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { getCurrentUserClient } from '@/lib/client-auth';
import { User } from '@/types';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/#home', label: '홈', id: 'home' },
  { href: '/#academy', label: '학원안내', id: 'academy' },
  { href: '/#student-works', label: '학생작품', id: 'student-works' },
  { href: '/#instructors', label: '강사진', id: 'instructors' },
  { href: '/#curriculum', label: '커리큘럼', id: 'curriculum' },
];

export function Header() {
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 현재 사용자 로드
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUserClient();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user in header:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadUser();
  }, []);

  // 역할에 따른 대시보드 경로 및 버튼 정보 계산
  const authButton = useMemo(() => {
    if (isAuthLoading) return { label: '...', href: '/login' };
    
    if (!user) return { label: '로그인', href: '/login' };

    const rolePathMap: Record<string, string> = {
      admin: '/dashboard/admin',
      teacher: '/dashboard/teacher',
      student: '/dashboard/student',
      parent: '/dashboard/parent'
    };

    return {
      label: '대시보드',
      href: rolePathMap[user.role] || '/dashboard'
    };
  }, [user, isAuthLoading]);

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
        <Link href="/" className="mr-4 md:mr-6 flex items-center">
          <div className="relative h-5 w-32 md:h-7 md:w-44 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Coducation Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-3 text-sm sm:gap-4 sm:text-base lg:gap-6 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.id)}
              className={cn(
                'relative py-2 whitespace-nowrap transition-colors hover:text-foreground/80 cursor-pointer',
                pathname === '/' && activeLink === link.href
                  ? 'text-foreground active-nav-link'
                  : 'text-foreground/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end space-x-2 ml-auto md:ml-0">
          <Button asChild className="bg-sky-500 hover:bg-sky-600 font-bold transition-all duration-300">
            <Link href={authButton.href}>{authButton.label}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
