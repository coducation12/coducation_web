import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "./components/TeacherSidebar";

export const dynamic = 'force-dynamic';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0a1837] via-[#0a1a2f] to-[#0a1837]">
      <TeacherSidebar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
} 