import React from "react";

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-[#0a1837] to-[#0a1a2f]">
      {/* 각 계정별 Sidebar는 하위 레이아웃에서 import */}
      <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
