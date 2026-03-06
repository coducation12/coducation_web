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

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
    const user = await getAuthenticatedUser();

    if (!user) {
        return <div>사용자 정보를 불러올 수 없습니다.</div>;
    }

    return (
        <div className="student-dashboard-content w-full overflow-y-auto scrollbar-hide flex-1 px-4 py-4 lg:px-12 lg:py-10 box-border pt-16 lg:pt-2 flex flex-col pb-10">
            <StudentHeading size="h1" className="mb-6">학생 대시보드</StudentHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {/* 왼쪽: 학습진행률+완료된학습 (세로로 긴 카드) */}
                <DashboardCard className="student-card-container">
                    <div className="student-card-content flex flex-col gap-4">
                        <section className="flex-1 flex flex-col min-h-0">
                            <LearningProgress studentId={user.id} vertical />
                        </section>
                        <section className="flex-1 flex flex-col min-h-0">
                            <CompletedLearning studentId={user.id} />
                        </section>
                    </div>
                </DashboardCard>
                {/* 오른쪽: 2행 2열 구조 */}
                <div className="md:h-full grid grid-cols-1 md:grid-rows-2 gap-6">
                    {/* 상단: 출석+캘린더(왼쪽) + 목표설정(오른쪽) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:h-full">
                        <DashboardCard className="student-card-container min-w-[180px] flex flex-col">
                            <section>
                                <AttendanceCheckCard studentId={user.id} />
                                <AttendanceCalendar studentId={user.id} />
                            </section>
                        </DashboardCard>
                        <DashboardCard className="student-card-container min-w-[180px] flex flex-col">
                            <section className="student-card-content flex-1">
                                <GoalsCard studentId={user.id} fixedInput />
                            </section>
                        </DashboardCard>
                    </div>
                    {/* 하단: 타자 기록(오른쪽 전체) */}
                    <DashboardCard className="student-card-container min-w-[180px] flex flex-col">
                        <section className="student-card-content flex-1 min-h-[300px] md:min-h-0">
                            <TypingChart studentId={user.id} />
                        </section>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
}
