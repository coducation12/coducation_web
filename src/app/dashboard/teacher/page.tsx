import { getAuthenticatedUser } from "@/lib/auth";
import { AttendanceScheduler } from "./components/AttendanceScheduler";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";

export const dynamic = 'force-dynamic';

export default async function TeacherDashboardPage() {
    const user = await getAuthenticatedUser();

    return (
        <DashboardPageWrapper>
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7] pr-2">강사 대시보드</h1>
            </div>
            <AttendanceScheduler teacherId={user?.id || ''} />

            {/* 학생 목록 카드 전체 삭제 */}
        </DashboardPageWrapper>
    );
}
