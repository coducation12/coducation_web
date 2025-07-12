import { getAuthenticatedUser } from "@/lib/auth";
import { ParentSidebar } from "../parent/components/ParentSidebar";
import { TeacherSidebar } from "../teacher/components/TeacherSidebar";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return <div>사용자 정보를 불러올 수 없습니다.</div>;
  }

  if (user.role === "parent") {
    return (
      <div className="flex h-screen bg-gradient-to-br from-[#0a1837] via-[#0a1a2f] to-[#0a1837]">
        <ParentSidebar user={user} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  if (user.role === "teacher") {
    return (
      <div className="flex h-screen bg-gradient-to-br from-[#0a1837] via-[#0a1a2f] to-[#0a1837]">
        <TeacherSidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  // 다른 계정들은 기본 레이아웃 사용
  return <>{children}</>;
} 