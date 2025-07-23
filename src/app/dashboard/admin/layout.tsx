import React from "react";
import { getAuthenticatedUser } from "@/lib/auth";
import { AdminSidebar } from "@/app/dashboard/admin/components/AdminSidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();
  if (!user) return <div>로그인이 필요합니다.</div>;

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-[#0a1837] to-[#0a1a2f]">
      <AdminSidebar />
      <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {children}
      </main>
    </div>
  );
} 