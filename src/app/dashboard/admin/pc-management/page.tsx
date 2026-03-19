import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";
import { PCManagementClient } from "@/components/admin/pc/PCManagementClient";

export default async function AdminPCManagementPage() {
    const user = await getAuthenticatedUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <DashboardPageWrapper>
            <PCManagementClient
                currentUserId={user.id}
                currentUserRole={user.role}
                initialAcademy={user.academy || "코딩메이커"}
            />
        </DashboardPageWrapper>
    );
}
