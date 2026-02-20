import React from "react";
import { getAuthenticatedUser } from "@/lib/auth";
import { StudentSidebar } from "@/app/dashboard/student/components/StudentSidebar";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-[#0a1837] to-[#0a1a2f] student-page">
      <StudentSidebar user={{ name: user.name, role: user.role, profile_image_url: user.profile_image_url }} />
      <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {children}
      </main>
    </div>
  );
} 