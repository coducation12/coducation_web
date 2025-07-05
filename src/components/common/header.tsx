
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/#home', label: 'Home', id: 'home' },
  { href: '/#about', label: 'About', id: 'about' },
  { href: '/#academy', label: 'Academy', id: 'academy' },
  { href: '/#instructors', label: 'Instructors', id: 'instructors' },
  { href: '/#curriculum', label: 'Curriculum', id: 'curriculum' },
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

  useEffect(() => {
    if (pathname !== '/') {
        setActiveLink('');
        return;
    }

    const handleScroll = () => {
      const sections = navLinks.map(link => document.getElementById(link.id));
      const scrollPosition = window.scrollY + 150; 

      let currentActiveLink = '';
      for (const section of sections) {
        if (section && scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
          currentActiveLink = `/#${section.id}`;
          break;
        }
      }
      // If no section is active, check if we are at the top
      if (!currentActiveLink && window.scrollY < 150) {
        currentActiveLink = '/#home';
      }

      setActiveLink(currentActiveLink);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Code2 className="h-6 w-6 text-primary" />
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
