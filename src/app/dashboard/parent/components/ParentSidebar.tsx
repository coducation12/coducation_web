'use client';
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { UserCircle, BookOpen, Users, Menu, LogOut, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// TODO: 실제 데이터는 DB에서 가져오도록 구현
const mockStudents = [
  { id: "1", name: "김철수", grade: "초등 3학년" },
  { id: "2", name: "이영희", grade: "초등 5학년" },
  { id: "3", name: "박민수", grade: "초등 4학년" },
];

const navItems = [
  { href: "/dashboard/parent", label: "대시보드", icon: <UserCircle className="w-5 h-5" /> },
  { href: "/dashboard/parent/study", label: "학습 관리", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/dashboard/community", label: "커뮤니티", icon: <Users className="w-5 h-5" /> },
];

interface ParentSidebarProps {
  user: { name: string; role: string };
}

export function ParentSidebar({ user }: ParentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("1");

  const handleLogout = async () => {
    try {
      // 세션 쿠키 삭제
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // 메인화면으로 리다이렉트
      router.push("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // 에러가 발생해도 메인화면으로 이동
      router.push("/");
    }
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudent(studentId);
    // URL에 선택된 학생 ID를 쿼리 파라미터로 추가
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('studentId', studentId);
    router.push(currentUrl.pathname + currentUrl.search);
  };

  const SidebarContent = (
    <>
      <nav className="flex flex-col gap-4 p-4">
        <div className="text-xl font-bold text-cyan-100 mb-2 drop-shadow-[0_0_6px_#00fff7] text-center">Coducation</div>
        
        {/* 학생 선택 드롭다운 */}
        <div className="space-y-2">
          <label className="text-sm text-cyan-300 font-medium">학생 선택</label>
          <Select value={selectedStudent} onValueChange={handleStudentChange}>
            <SelectTrigger className="w-full bg-cyan-950/50 border-cyan-400/20 text-cyan-100">
              <SelectValue placeholder="학생을 선택하세요" />
            </SelectTrigger>
            <SelectContent className="bg-cyan-950 border-cyan-400/20">
              {mockStudents.map((student) => (
                <SelectItem 
                  key={student.id} 
                  value={student.id}
                  className="text-cyan-100 hover:bg-cyan-900/50"
                >
                  {student.name} ({student.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 네비게이션 메뉴 */}
        <div className="space-y-2">
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
        </div>
      </nav>
      
      <div className="p-4 border-t border-cyan-900/20 text-cyan-200 text-sm flex flex-col gap-4">
        <Link href="/dashboard/parent/profile" className="flex items-center gap-3 hover:underline cursor-pointer">
          <UserCircle className="w-5 h-5" />
          <span>{user.name} ({user.role})</span>
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
      <div className="md:hidden fixed top-0 left-0 w-full z-50 h-14 flex items-center px-4 border-b bg-gradient-to-b from-[#0a1837] to-[#0a1a2f]">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="w-6 h-6 text-cyan-100" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="p-0 w-full max-w-full bg-gradient-to-b from-[#0a1837] to-[#0a1a2f] border-b border-cyan-900/40">
            {SidebarContent}
          </SheetContent>
        </Sheet>
        <span className="text-xl font-bold text-cyan-100 ml-2 drop-shadow-[0_0_6px_#00fff7]">Coducation</span>
      </div>
      {/* 데스크톱: 기존 사이드바 */}
      <aside className="hidden md:flex w-56 min-w-[180px] h-full bg-gradient-to-b from-[#0a1837] to-[#0a1a2f] border-r border-cyan-900/40 flex-col justify-between">
        {SidebarContent}
      </aside>
      {/* 모바일 본문 여백 확보용 */}
      <div className="md:hidden" style={{ height: 56 }} />
    </>
  );
} 