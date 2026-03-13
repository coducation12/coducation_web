import { getAuthenticatedUser } from "@/lib/auth";
import { TypingChart } from "@/app/dashboard/student/components/typing-chart";
import { LearningProgress } from "@/app/dashboard/student/components/learning-progress";
import { GoalsCard } from "@/app/dashboard/student/components/goals-card";
import { AttendanceCalendar } from "@/components/common/attendance-calendar";
import { AttendanceCheckCard } from "@/app/dashboard/student/components/attendance-check-card";
import { DashboardCard } from "@/app/dashboard/student/components/DashboardCard";
import { Trophy } from "lucide-react";
import { CompletedLearning } from "@/app/dashboard/student/components/completed-learning";
import { StudentHeading } from "@/app/dashboard/student/components/StudentThemeProvider";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
    const user = await getAuthenticatedUser();

    if (!user) {
        return <div>사용자 정보를 불러올 수 없습니다.</div>;
    }

    return (
        <DashboardPageWrapper className="student-dashboard-content w-full h-screen overflow-hidden flex flex-col px-4 pt-16 lg:pt-6 pb-6 lg:px-12">
            <StudentHeading size="h1" className="mb-4 shrink-0">학생 대시보드</StudentHeading>
            
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4 w-full">
                {/* 1행 1열: 출석 및 캘린더 */}
                <DashboardCard className="student-card-container flex flex-col min-h-0">
                    <section className="student-card-content flex-1 flex flex-col overflow-hidden">
                        <AttendanceCheckCard studentId={user.id} />
                        <div className="flex-1 min-h-0">
                            <AttendanceCalendar studentId={user.id} />
                        </div>
                    </section>
                </DashboardCard>

                {/* 1행 2열: To-Do List */}
                <DashboardCard className="student-card-container flex flex-col min-h-0">
                    <section className="student-card-content flex-1 h-full min-h-0 overflow-hidden">
                        <GoalsCard studentId={user.id} fixedInput />
                    </section>
                </DashboardCard>

                {/* 2행 1열: 타자 기록 그래프 */}
                <DashboardCard className="student-card-container flex flex-col min-h-0">
                    <section className="student-card-content flex-1 flex flex-col min-h-0 overflow-hidden">
                        <TypingChart studentId={user.id} />
                    </section>
                </DashboardCard>

                {/* 2행 2열: 완료된 학습 (커리큘럼 숨김 포함) */}
                <DashboardCard className="student-card-container flex flex-col min-h-0">
                    <div className="student-card-content flex flex-col h-full min-h-0 overflow-hidden">
                        {/* <section className="mb-4">
                            <LearningProgress studentId={user.id} vertical />
                        </section> */}
                        <section className="flex-1 min-h-0">
                            <CompletedLearning studentId={user.id} />
                        </section>
                    </div>
                </DashboardCard>
            </div>
        </DashboardPageWrapper>
    );
}
