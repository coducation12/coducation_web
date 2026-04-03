import { getAuthenticatedUser } from "@/lib/auth";
import { TypingChart } from "@/app/dashboard/student/components/typing-chart";
import { LearningProgress } from "@/app/dashboard/student/components/learning-progress";
import { GoalsCard } from "@/app/dashboard/student/components/goals-card";
import { AttendanceCalendar } from "@/components/common/attendance-calendar";
import { DashboardCard } from "@/app/dashboard/student/components/DashboardCard";
import { Trophy, Star, Zap } from "lucide-react";
import { Achievements } from "@/app/dashboard/student/components/achievements";
import { StudentHeading } from "@/app/dashboard/student/components/StudentThemeProvider";
import { DashboardPageWrapper } from "@/components/common/DashboardPageWrapper";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
    const user = await getAuthenticatedUser();

    if (!user) {
        return <div>사용자 정보를 불러올 수 없습니다.</div>;
    }

    // 학생 데이터 조회 (XP 및 레벨링용)
    const { data: student } = await supabaseAdmin
        .from('students')
        .select('total_xp')
        .eq('user_id', user.id)
        .single();

    const totalXp = student?.total_xp || 0;
    const level = Math.floor(totalXp / 1000) + 1;
    const xpIntoLevel = totalXp % 1000;
    const progressToNext = (xpIntoLevel / 1000) * 100;

    return (
        <DashboardPageWrapper className="student-dashboard-content w-full flex flex-col pt-14 lg:pt-2 pb-4 sm:pb-10 px-2 sm:px-4 md:px-6">
            {/* Header with XP and Level */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 sm:gap-4 mb-2 sm:mb-4 shrink-0">
                <StudentHeading size="h1" className="text-xl md:text-3xl font-black truncate m-0 !text-cyan-50">학생 대시보드</StudentHeading>
                
                <div className="w-full md:w-auto flex items-center gap-3 sm:gap-4 bg-slate-900/40 border border-cyan-500/10 p-2 md:p-3 rounded-2xl backdrop-blur-sm px-3 md:px-6 shadow-lg">
                    <div className="flex flex-col items-center justify-center -mt-0.5">
                        <div className="relative">
                            <Zap className="w-6 h-6 md:w-10 md:h-10 text-yellow-500 fill-yellow-500/10 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] md:text-xs font-black text-white mt-0.5">{level}</span>
                        </div>
                        <span className="text-[7px] md:text-[9px] font-black uppercase text-cyan-700 tracking-widest">Level</span>
                    </div>
                    
                    <div className="flex-1 md:w-48 space-y-1">
                        <div className="flex justify-between items-end">
                            <span className="text-[8px] md:text-[10px] font-black text-cyan-600 uppercase tracking-widest leading-none">Experience Points</span>
                            <span className="text-xs md:text-sm font-black text-cyan-200 italic leading-none">{totalXp.toLocaleString()} <span className="text-[9px] md:text-[10px] text-cyan-700 font-normal">XP</span></span>
                        </div>
                        <div className="h-1.5 md:h-2 w-full bg-slate-950/50 rounded-full overflow-hidden border border-cyan-500/10">
                            <div 
                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all duration-1000" 
                                style={{ width: `${progressToNext}%` }}
                            />
                        </div>
                    </div>
                </div>
            </header>
            
            {/* 그리드 시스템 - 3단 컬럼 구조 및 높이 균형 조정 */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full items-stretch min-h-0">
                
                {/* [Column 1] 학습 현황 및 업적 - 모바일 1순위 */}
                <div className="flex flex-col gap-4 sm:gap-8 order-1 h-full min-h-0">
                    <DashboardCard className="flex-1 p-4 sm:p-6 border-cyan-500/10 bg-slate-900/20 backdrop-blur-sm min-h-[400px] lg:min-h-[500px] flex flex-col overflow-hidden">
                         <LearningProgress studentId={user.id} vertical />
                    </DashboardCard>
                </div>

                {/* [Column 2] 포트폴리오 및 타자 기록 - 모바일 2순위 (이제 타자보다 포트폴리오 강조) */}
                <div className="flex flex-col gap-4 sm:gap-8 order-2 lg:order-2 h-full min-h-0">
                    <DashboardCard className="flex-1 p-4 sm:p-6 border-cyan-500/10 bg-slate-900/20 backdrop-blur-sm min-h-[400px] lg:min-h-[500px] flex flex-col overflow-hidden">
                        <Achievements studentId={user.id} />
                    </DashboardCard>
                    <DashboardCard className="p-4 sm:p-5 border-cyan-500/10 bg-slate-900/20 backdrop-blur-sm h-[280px] lg:h-[320px] overflow-hidden shrink-0">
                        <TypingChart studentId={user.id} />
                    </DashboardCard>
                </div>

                {/* [Column 3] 출석 및 할 일 - 모바일 3순위 (데스크톱 맨 오른쪽) */}
                <div className="flex flex-col gap-4 sm:gap-8 order-3 lg:order-3 md:col-span-2 lg:col-span-1 h-full min-h-0">
                    <DashboardCard className="p-4 sm:p-5 border-cyan-500/10 bg-slate-900/20 backdrop-blur-sm h-[380px] lg:h-[440px] overflow-hidden shrink-0">
                         <AttendanceCalendar studentId={user.id} />
                    </DashboardCard>
                    <DashboardCard className="p-4 sm:p-5 border-cyan-500/10 bg-slate-900/20 backdrop-blur-sm flex-1 min-h-[350px] lg:min-h-[430px] overflow-hidden">
                        <GoalsCard studentId={user.id} fixedInput />
                    </DashboardCard>
                </div>

            </div>
        </DashboardPageWrapper>
    );
}
