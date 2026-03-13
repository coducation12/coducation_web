import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TuitionDashboard } from "@/components/admin/payments/TuitionDashboard";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";

export default async function AdminPaymentsPage() {
    const user = await getAuthenticatedUser();

    if (!user) {
        redirect("/login");
    }

    // 관리자 대시보드에서는 관리자 계정 정보를 넘겨줌
    return (
        <DashboardPageWrapper>
            <TuitionDashboard
                currentUserId={user.id}
                currentUserRole={user.role}
            />
        </DashboardPageWrapper>
    );
}
