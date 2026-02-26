'use client';
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Keyboard, Users, Menu, LogOut, GraduationCap, User, CalendarDays, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions";
import { getCurrentUserClient } from "@/lib/client-auth";

const navItems = [
  { href: "/dashboard/teacher", label: "대시보드", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/dashboard/teacher/students", label: "학생관리", icon: <GraduationCap className="w-5 h-5" /> },
  { href: "/dashboard/teacher/timetable", label: "학원시간표", icon: <CalendarDays className="w-5 h-5" /> },
  // TODO: 커리큘럼 페이지 완성 후 활성화 예정
  // { href: "/dashboard/teacher/curriculum", label: "커리큘럼", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/dashboard/teacher/consultations", label: "상담문의", icon: <MessageSquare className="w-5 h-5" /> },
  { href: "/dashboard/teacher/community", label: "커뮤니티", icon: <Users className="w-5 h-5" /> },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchUserInfo();
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      const { count, error } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (!error) {
        setPendingCount(count || 0);
      }
    } catch (error) {
      console.error("상담문의 건수 조회 실패:", error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const user = await getCurrentUserClient();
      console.log('Current user:', user);

      if (user && user.name) {
        setUserName(user.name);
        console.log('Set userName to:', user.name);
      } else {
        console.log('No user name found');
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // TODO: 배포 후 정상화 - Supabase Auth 로그아웃으로 복원 필요
      await logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
      router.push("/");
    }
  };

  const SidebarContent = (
    <>
      <nav className="flex flex-col gap-2 p-4">
        <div className="text-xl font-bold text-cyan-100 mb-6 drop-shadow-[0_0_6px_#00fff7] text-center">Coducation</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-cyan-100 hover:bg-cyan-900/20 transition-colors font-medium ${pathname === item.href ? "bg-cyan-900/30" : ""}`}
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {item.label}
            </div>
            {item.label === "상담문의" && pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-cyan-900/20 text-cyan-200 text-sm flex flex-col gap-4">
        <Link href="/dashboard/teacher/profile" className="flex items-center gap-3 hover:underline cursor-pointer">
          <User className="w-5 h-5" />
          <span>{userName ? `${userName}강사` : '강사님'}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-400 hover:underline"
        >
          <LogOut className="w-5 h-5" /> 로그아웃
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 모바일: 상단 고정 헤더 + Sheet */}
      <div className="lg:hidden fixed top-0 left-0 w-full z-50 h-14 flex items-center px-4 border-b bg-gradient-to-b from-[#0a1837] to-[#0a1a2f]">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="w-6 h-6 text-cyan-100" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="p-0 w-full max-w-full bg-gradient-to-b from-[#0a1837] to-[#0a1a2f] border-b border-cyan-900/40">
            <SheetHeader className="sr-only">
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            {SidebarContent}
          </SheetContent>
        </Sheet>
        <span className="text-xl font-bold text-cyan-100 ml-2 drop-shadow-[0_0_6px_#00fff7]">Coducation</span>
      </div>
      {/* 데스크톱: 기존 사이드바 */}
      <aside className="hidden lg:flex w-56 min-w-[180px] h-full bg-gradient-to-b from-[#0a1837] to-[#0a1a2f] border-r border-cyan-900/40 flex-col justify-between">
        {SidebarContent}
      </aside>
      {/* 모바일 본문 여백 확보용 */}
      <div className="lg:hidden" style={{ height: 56 }} />
    </>
  );
} 