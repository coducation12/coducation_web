import { getAuthenticatedUser } from "@/lib/auth";
import { TypingChart } from "@/app/dashboard/student/components/typing-chart";
import { LearningProgress } from "@/app/dashboard/student/components/learning-progress";
import { GoalsCard } from "@/app/dashboard/student/components/goals-card";
import { AttendanceCalendar } from "@/components/common/attendance-calendar";
import { AttendanceCheckCard } from "@/app/dashboard/student/components/attendance-check-card";
import { DashboardCard } from "@/app/dashboard/student/components/DashboardCard";
import { CompletedLearning } from "@/app/dashboard/student/components/completed-learning";
import { StudentHeading } from "@/app/dashboard/student/components/StudentThemeProvider";

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: { studentId?: string };
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return <div>사용자 정보를 불러올 수 없습니다.</div>;
  }

  // 선택된 학생 ID (기본값: 첫 번째 학생)
  const studentId = searchParams.studentId || "1";

  // TODO: 실제 데이터는 DB에서 가져오도록 구현
  const mockStudents = [
    { id: "1", name: "김철수", grade: "초등 3학년" },
    { id: "2", name: "이영희", grade: "초등 5학년" },
    { id: "3", name: "박민수", grade: "초등 4학년" },
  ];

  const selectedStudent = mockStudents.find(s => s.id === studentId) || mockStudents[0];

  return (
    <div className="w-full h-full flex-1 min-h-0 px-4 py-4 md:px-12 md:py-10 box-border pt-14 md:pt-8 flex flex-col">
      <StudentHeading size="h1" className="mb-6">{selectedStudent.name} 대시보드</StudentHeading>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-w-0">
        {/* 왼쪽: 학습진행률+완료된학습 (세로로 긴 카드) */}
        <DashboardCard className="flex flex-col h-full min-w-0">
          <div className="flex flex-col h-full gap-4">
            <section className="flex-1 flex flex-col">
              <LearningProgress studentId={studentId} vertical />
            </section>
            <section className="flex-1 flex flex-col">
              <CompletedLearning studentId={studentId} />
            </section>
          </div>
        </DashboardCard>
        {/* 오른쪽: 2행 2열 구조 */}
        <div className="h-full grid grid-rows-2 gap-6">
          {/* 상단: 출석+캘린더(왼쪽) + 목표설정(오른쪽) */}
          <div className="grid grid-cols-2 gap-6 h-full">
            <DashboardCard className="flex flex-col min-w-[180px] h-full">
              <section className="flex-1">
                <AttendanceCalendar />
              </section>
            </DashboardCard>
            <DashboardCard className="flex flex-col min-w-[180px] h-full">
              <section className="flex-1">
                <GoalsCard studentId={studentId} readOnly />
              </section>
            </DashboardCard>
          </div>
          {/* 하단: 타자 기록(오른쪽 전체) */}
          <DashboardCard className="flex flex-col min-w-[180px] h-full">
            <section className="flex-1">
              <TypingChart studentId={studentId} />
            </section>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
