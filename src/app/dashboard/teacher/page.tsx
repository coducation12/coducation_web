import { getAuthenticatedUser } from "@/lib/auth";
import { AttendanceScheduler } from "./components/AttendanceScheduler";

export const dynamic = 'force-dynamic';

export default async function TeacherDashboardPage() {
    const user = await getAuthenticatedUser();

    return (
        <div className="p-6 space-y-6 pt-16 lg:pt-2">
            <div>
                <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">강사 대시보드</h1>
            </div>
            <AttendanceScheduler teacherId={user?.id || ''} />

            {/* 학생 목록 카드 전체 삭제 */}
        </div>
    );
}
