'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/about', label: '사이트 소개' },
  { href: '/academy', label: '학원 안내' },
  { href: '/instructors', label: '강사 소개' },
  { href: '/curriculum', label: '과정 안내' },
  { href: '/reviews', label: '학습 후기' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl px-4">
        {/* 데스크톱: 한 줄에 모든 요소 배치 */}
        <div className="hidden lg:flex h-14 items-center w-full">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">Coducation</span>
          </Link>
          
          <nav className="flex items-center justify-center gap-6 text-sm flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <Button asChild className="flex-shrink-0">
            <Link href="/login">로그인</Link>
          </Button>
        </div>

        {/* 모바일/태블릿: 2줄로 배치 */}
        <div className="lg:hidden">
          {/* 첫 번째 줄: 로고(왼쪽) + 로그인(오른쪽) */}
          <div className="flex h-14 items-center justify-between w-full">
            <Link href="/" className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline text-base md:text-lg">Coducation</span>
            </Link>
            <Button asChild>
              <Link href="/login">로그인</Link>
            </Button>
          </div>
          {/* 두 번째 줄: 메뉴 - 가운데 정렬, 간격 넓힘 */}
          <nav className="flex items-center justify-center gap-4 md:gap-6 text-sm py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
