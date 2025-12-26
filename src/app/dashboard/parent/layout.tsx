import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ParentSidebar } from "./components/ParentSidebar";

export const dynamic = 'force-dynamic';

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "parent") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0a1837] via-[#0a1a2f] to-[#0a1837]">
      <ParentSidebar user={user} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
} 