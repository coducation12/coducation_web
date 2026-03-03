import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TuitionDashboard } from "@/components/admin/payments/TuitionDashboard";

export default async function TeacherPaymentsPage() {
    const user = await getAuthenticatedUser();

    if (!user) {
        redirect("/login");
    }

    // 강사 대시보드 (담당 학생 위주 필터링은 컴포넌트 내부 액션에서 처리됨)
    return (
        <div className="p-6 md:p-10 space-y-6 pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
            <TuitionDashboard
                currentUserId={user.id}
                currentUserRole={user.role}
            />
        </div>
    );
}
