import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserCircle, BookOpen, Keyboard, Users } from "lucide-react";

const navItems = [
  { href: "/dashboard/parent", label: "대시보드", icon: <UserCircle className="w-5 h-5" /> },
  { href: "/dashboard/parent/curriculum", label: "학습하기", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/dashboard/parent/typing", label: "타자연습", icon: <Keyboard className="w-5 h-5" /> },
  { href: "/dashboard/community", label: "커뮤니티", icon: <Users className="w-5 h-5" /> },
];

export function ParentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-w-[180px] h-full bg-gradient-to-b from-[#0a1837] to-[#0a1a2f] border-r border-cyan-900/40 flex flex-col justify-between">
      <nav className="flex flex-col gap-2 p-4">
        <div className="text-xl font-bold text-cyan-100 mb-6">Coducation</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-cyan-100 hover:bg-cyan-900/20 transition-colors font-medium ${pathname === item.href ? "bg-cyan-900/30" : ""}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-cyan-900/20 text-cyan-200 text-xs flex items-center gap-2">
        <UserCircle className="w-4 h-4" />
        <span>로그인 정보</span>
      </div>
    </aside>
  );
} 