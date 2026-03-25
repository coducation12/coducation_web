import { getAuthenticatedUser } from "@/lib/auth";
import { TypingChart } from "@/app/dashboard/student/components/typing-chart";
import { LearningProgress } from "@/app/dashboard/student/components/learning-progress";
import { GoalsCard } from "@/app/dashboard/student/components/goals-card";
import { AttendanceCalendar } from "@/components/common/attendance-calendar";
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
            
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 w-full overflow-y-auto lg:overflow-hidden scrollbar-hide">
                {/* 왼쪽 컬럼: 타자 차트 + 완료된 학습 */}
                <div className="flex-none lg:flex-1 min-h-0 flex flex-col gap-6">
                    {/* 타자 기록 그래프 (상단 - 작게) */}
                    <DashboardCard className="student-card-container flex-none lg:flex-[1] h-[300px] lg:h-auto flex flex-col min-h-0 p-4">
                        <section className="student-card-content flex-1 flex flex-col min-h-0 overflow-hidden">
                            <TypingChart studentId={user.id} />
                        </section>
                    </DashboardCard>

                    {/* 완료된 학습 (하단 - 크게) */}
                    <DashboardCard className="student-card-container flex-none lg:flex-[2] h-[500px] lg:h-auto flex flex-col min-h-0 p-4">
                        <div className="student-card-content flex flex-col h-full min-h-0 overflow-hidden">
                            <section className="flex-1 min-h-0">
                                <CompletedLearning studentId={user.id} />
                            </section>
                        </div>
                    </DashboardCard>
                </div>

                {/* 오른쪽 컬럼: 캘린더 + To-Do List */}
                <div className="flex-none lg:flex-1 min-h-0 flex flex-col gap-6">
                    {/* 출석 및 캘린더 (상단) */}
                    <DashboardCard className="student-card-container flex-none lg:flex-1 h-[500px] lg:h-auto flex flex-col min-h-0 p-4">
                        <section className="student-card-content flex flex-col h-full min-h-0 overflow-hidden">
                            <AttendanceCalendar studentId={user.id} />
                        </section>
                    </DashboardCard>

                    {/* To-Do List (하단) */}
                    <DashboardCard className="student-card-container flex-none lg:flex-1 h-[400px] lg:h-auto flex flex-col min-h-0 p-4">
                        <section className="student-card-content h-full min-h-0 overflow-hidden">
                            <GoalsCard studentId={user.id} fixedInput />
                        </section>
                    </DashboardCard>
                </div>
            </div>
        </DashboardPageWrapper>
    );
}
