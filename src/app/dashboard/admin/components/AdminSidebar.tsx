"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, Menu, LogOut, GraduationCap, User, CalendarDays, UserCheck, Settings, MessageSquare, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions";

const navItems = [
  { href: "/dashboard/admin", label: "대시보드", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/dashboard/admin/students", label: "학생관리", icon: <GraduationCap className="w-5 h-5" /> },
  { href: "/dashboard/admin/teachers", label: "강사관리", icon: <UserCheck className="w-5 h-5" /> },
  { href: "/dashboard/admin/timetable", label: "학원시간표", icon: <CalendarDays className="w-5 h-5" /> },
  { href: "/dashboard/admin/curriculum", label: "커리큘럼", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/dashboard/admin/consultations", label: "상담문의", icon: <MessageSquare className="w-5 h-5" /> },
  { href: "/dashboard/admin/community", label: "커뮤니티", icon: <Users className="w-5 h-5" /> },
  { href: "/dashboard/admin/content", label: "컨텐츠 관리", icon: <Settings className="w-5 h-5" /> },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success && result.redirect) {
        window.location.href = result.redirect;
      } else {
        router.push("/");
      }
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
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-cyan-100 hover:bg-cyan-900/20 transition-colors font-medium ${pathname === item.href ? "bg-cyan-900/30" : ""}`}
            onClick={() => setOpen(false)}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-cyan-900/20 text-cyan-200 text-sm flex flex-col gap-4">
        <Link href="/dashboard/admin/profile" className="flex items-center gap-3 hover:underline cursor-pointer">
          <User className="w-5 h-5" />
          <span>관리자</span>
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
            <div className="sr-only">
              <h2>메뉴</h2>
            </div>
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