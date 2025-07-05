'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Code2,
  Home,
  BookUser,
  GraduationCap,
  Settings,
  User as UserIcon,
  BarChart3,
  LogOut,
  PanelLeft,
  Keyboard,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import type { User } from '@/types';
import React from 'react';
import { logout } from '@/lib/actions';

const studentNav = [
  { href: '/dashboard/student', label: '대시보드', icon: Home },
  { href: '/dashboard/student/today', label: '오늘의 학습', icon: Calendar },
  { href: '/dashboard/student/typing', label: '타자 연습', icon: Keyboard },
  { href: '/dashboard/community', label: '커뮤니티', icon: MessageSquare },
];

const parentNav = [
  { href: '/dashboard/parent', label: '자녀 학습 현황', icon: Home },
  { href: '/dashboard/community', label: '커뮤니티', icon: MessageSquare },
];

const teacherNav = [
  { href: '/dashboard/teacher', label: '담당 학생 관리', icon: Home },
  { href: '/dashboard/teacher/curriculum', label: '커리큘럼 관리', icon: GraduationCap },
  { href: '/dashboard/community', label: '커뮤니티', icon: MessageSquare },
];

const adminNav = [
  { href: '/dashboard/admin', label: '통계', icon: BarChart3 },
  { href: '/dashboard/admin/users', label: '사용자 관리', icon: UserIcon },
  { href: '/dashboard/admin/curriculum', label: '커리큘럼 관리', icon: GraduationCap },
  { href: '/dashboard/community', label: '커뮤니티', icon: MessageSquare },
];

const navItemsByRole = {
  student: studentNav,
  parent: parentNav,
  teacher: teacherNav,
  admin: adminNav,
};

function NavContent({ user, onLinkClick }: { user: User, onLinkClick?: () => void }) {
  const pathname = usePathname();
  const navItems = navItemsByRole[user.role];

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
          <Code2 className="h-6 w-6 text-primary" />
          <span>Coducation</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems && navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                { 'bg-muted text-primary': pathname === item.href }
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground">
          <UserIcon className="h-4 w-4" />
          <span>{user.name} ({user.role})</span>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </form>
      </div>
    </div>
  );
}


export function DashboardSidebar({ user }: { user: User }) {
  const isMobile = useIsMobile();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  return (
    <>
      {isMobile ? (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 w-full">
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
               <NavContent user={user} onLinkClick={() => setMobileSheetOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 font-semibold font-headline">
            <Code2 className="h-6 w-6 text-primary" />
            <span>Coducation Dashboard</span>
          </div>
        </header>
      ) : (
        <div className="hidden border-r bg-muted/40 md:block w-[220px] lg:w-[280px]">
          <NavContent user={user} />
        </div>
      )}
    </>
  );
}
