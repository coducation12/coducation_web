import { getAuthenticatedUser } from "@/lib/auth";
import { getParentStudents } from "@/lib/actions";
import { TypingChart } from "@/app/dashboard/student/components/typing-chart";
import { LearningProgress } from "@/app/dashboard/student/components/learning-progress";
import { GoalsCard } from "@/app/dashboard/student/components/goals-card";
import { AttendanceCalendar } from "@/components/common/attendance-calendar";
import { DashboardCard } from "@/app/dashboard/student/components/DashboardCard";
import { CompletedLearning } from "@/app/dashboard/student/components/completed-learning";
import { StudentHeading } from "@/app/dashboard/student/components/StudentThemeProvider";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const user = await getAuthenticatedUser();
  const { studentId: selectedStudentId } = await searchParams;

  if (!user) {
    redirect("/login");
  }

  // 실제 자녀 목록 가져오기
  const result = await getParentStudents(user.id);
  
  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <DashboardPageWrapper className="w-full h-full flex-1 min-h-0 px-4 py-8 lg:px-12 flex flex-col items-center justify-center">
        <Users className="w-16 h-16 text-cyan-500/20 mb-4" />
        <StudentHeading size="h2" className="text-cyan-400/60 font-medium">등록된 자녀 정보가 없습니다.</StudentHeading>
        <p className="text-cyan-500/40 mt-2">학원에 자녀 등록 여부를 문의해주세요.</p>
      </DashboardPageWrapper>
    );
  }

  const students = result.data;
  const selectedStudent = students.find((s: any) => s.id === selectedStudentId) || students[0];
  const studentId = selectedStudent.id;

  return (
    <DashboardPageWrapper className="w-full h-full flex-1 min-h-0 px-4 py-4 lg:px-12 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <StudentHeading size="h1">{selectedStudent.name} 대시보드</StudentHeading>
        
        {/* 자녀 선택 드롭다운 (자녀가 2명 이상일 때만 표시하거나 항상 표시) */}
        {students.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-cyan-900/20 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/10 gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                자녀 변경
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-cyan-500/30 text-cyan-100">
              {students.map((s: any) => (
                <DropdownMenuItem key={s.id} asChild className="focus:bg-cyan-500/20 focus:text-cyan-100 cursor-pointer">
                  <Link href={`?studentId=${s.id}`}>
                    {s.name} ({s.grade})
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-w-0">
        {/* 왼쪽: 학습진행률+완료된학습 (세로로 긴 카드) */}
        <DashboardCard className="flex flex-col h-full min-w-0">
          <div className="flex flex-col h-full gap-4">
            <section className="flex-1 flex flex-col overflow-hidden">
              <LearningProgress studentId={studentId} vertical />
            </section>
            <section className="flex-1 flex flex-col overflow-hidden">
              <CompletedLearning studentId={studentId} />
            </section>
          </div>
        </DashboardCard>

        {/* 오른쪽: 2행 분할 구조 */}
        <div className="h-full flex flex-col gap-6">
          {/* 상단: 출석+캘린더(왼쪽) + 목표설정(오른쪽) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
            <DashboardCard className="flex flex-col min-w-[180px] h-full overflow-hidden">
              <section className="flex-1 overflow-hidden">
                <AttendanceCalendar studentId={studentId} />
              </section>
            </DashboardCard>
            <DashboardCard className="flex flex-col min-w-[180px] h-full overflow-hidden">
              <section className="flex-1 overflow-hidden">
                <GoalsCard studentId={studentId} readOnly />
              </section>
            </DashboardCard>
          </div>
          {/* 하단: 타자 기록 (상대적으로 작게) */}
          <DashboardCard className="flex flex-col min-w-[180px] h-[300px] overflow-hidden">
            <section className="flex-1 overflow-hidden">
              <TypingChart studentId={studentId} />
            </section>
          </DashboardCard>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
