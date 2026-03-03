import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TuitionDashboard } from "@/components/admin/payments/TuitionDashboard";

export default async function AdminPaymentsPage() {
    const user = await getAuthenticatedUser();

    if (!user) {
        redirect("/login");
    }

    // 관리자 대시보드에서는 관리자 계정 정보를 넘겨줌
    return (
        <div className="p-6 md:p-10 space-y-6 pt-16 lg:pt-2 h-screen overflow-y-auto scrollbar-hide">
            <TuitionDashboard
                currentUserId={user.id}
                currentUserRole={user.role}
            />
        </div>
    );
}
