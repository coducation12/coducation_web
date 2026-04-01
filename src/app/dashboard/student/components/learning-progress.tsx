'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Book, 
  CheckCircle, 
  ShieldCheck, 
  Award as AwardIcon, 
  Star, 
  Cpu, 
  Code2, 
  Gamepad2, 
  Palette, 
  Terminal, 
  FileCode, 
  Cloud,
  ChevronRight,
  TrendingUp,
  History,
  Trophy
} from "lucide-react";
import { useState, useEffect } from "react";
import { StudentSectionTitle, StudentText, studentProgressStyles } from "./StudentThemeProvider";
import { cn } from "@/lib/utils";
import { getStudentProgress } from "@/lib/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LearningItem {
  id: string;
  curriculum_id?: string;
  title: string;
  category: string;
  percentage: number;
  status: 'ongoing' | 'completed';
  description?: string;
}

interface AttainedCert {
  id: string;
  organization: string;
  title: string;
  date: string;
}

interface AwardItem {
  id: string;
  title: string;
  organization: string;
  date: string;
}

// 과목별 아이콘 및 테마 맵
const CATEGORY_THEMES: Record<string, { icon: any; color: string; bg: string }> = {
  '스크래치': { icon: Gamepad2, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  '엔트리': { icon: Gamepad2, color: 'text-green-400', bg: 'bg-green-500/20' },
  '파이썬': { icon: Code2, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  'C언어': { icon: Terminal, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  'C++': { icon: FileCode, color: 'text-blue-500', bg: 'bg-blue-600/20' },
  '자바스크립트': { icon: Code2, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  '컴활': { icon: FileCode, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  'ITQ': { icon: FileCode, color: 'text-teal-400', bg: 'bg-teal-500/20' },
  '로봇': { icon: Cpu, color: 'text-red-400', bg: 'bg-red-500/20' },
  '드로잉': { icon: Palette, color: 'text-pink-400', bg: 'bg-pink-500/20' },
  '인공지능': { icon: Cloud, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  '기본': { icon: Book, color: 'text-slate-400', bg: 'bg-slate-500/20' }
};

const getTheme = (category: string) => {
  const key = Object.keys(CATEGORY_THEMES).find(k => category.includes(k)) || '기본';
  return CATEGORY_THEMES[key];
};

export function LearningProgress({ studentId, vertical }: { studentId: string, vertical?: boolean }) {
  const [progressList, setProgressList] = useState<LearningItem[]>([]);
  const [attained, setAttained] = useState<AttainedCert[]>([]);
  const [awards, setAwards] = useState<AwardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      const result = await getStudentProgress(studentId);
      
      if (!result.success) throw new Error(result.error);

      // 1. 학습 진도
      const progress = (result.data?.learning_progress as LearningItem[]) || [];
      setProgressList(progress);

      // 2. 업적 (자격증/수상)
      const records = result.data?.achievement_records || {};
      setAttained(records.attained || []);
      setAwards(records.awards || []);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ongoing = progressList.filter(p => p.status === 'ongoing');
  const completed = progressList.filter(p => p.status === 'completed');
  const allAchievementsCount = attained.length + awards.length;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-6">
        <div className="flex-1 animate-pulse space-y-4">
          <div className="h-4 w-24 bg-cyan-900/20 rounded"></div>
          <div className="h-32 bg-cyan-900/20 rounded-xl border border-cyan-500/10"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-8 min-h-0">
      {/* 1. 학습 진행중 */}
      <div className="flex-[1.2] flex flex-col min-h-0">
        <StudentSectionTitle className="mb-4 shrink-0" icon={<TrendingUp className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />}>
          학습 진행중
        </StudentSectionTitle>
        
        <div className="flex-1 overflow-y-auto scrollbar-simple-cyan pr-2 space-y-4">
          {ongoing.length === 0 ? (
            <div className="h-24 flex items-center justify-center border border-dashed border-cyan-500/10 rounded-2xl bg-cyan-950/5">
              <StudentText variant="muted" className="text-xs">진행 중인 학습이 없습니다.</StudentText>
            </div>
          ) : (
            ongoing.map((item) => {
              const theme = getTheme(item.category);
              const Icon = theme.icon;
              return (
                <div key={item.id} className="relative group overflow-hidden bg-[#0c1425]/40 border border-cyan-500/10 rounded-2xl p-4 backdrop-blur-md hover:border-cyan-500/30 transition-all duration-300">
                  {/* 배경 글로우 효과 */}
                  <div className={cn("absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500", theme.bg)}></div>
                  
                  <div className="flex items-center gap-5">
                    {/* 과목 아이콘/이미지 영역 */}
                    <div className={cn("w-14 h-14 shrink-0 rounded-xl flex items-center justify-center border border-white/5 shadow-[0_0_12px_rgba(0,0,0,0.2)] overflow-hidden transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", theme.bg)}>
                        <Icon className={cn("w-7 h-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]", theme.color)} />
                    </div>

                    {/* 내용 영역 */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <span className={cn("inline-block px-2 py-0.5 text-[8px] font-black rounded-lg border border-white/5 uppercase tracking-widest mb-1.5", theme.bg, theme.color)}>
                            {item.category}
                          </span>
                          <h3 className="text-[15px] font-black text-cyan-50 truncate group-hover:text-white transition-colors tracking-tight italic">
                            {item.title}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-cyan-100 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] italic">
                            {item.percentage}<span className="text-[10px] text-cyan-500 ml-0.5">%</span>
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={item.percentage} 
                        className={cn("h-1.5 w-full bg-cyan-950/40 rounded-full", studentProgressStyles)} 
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. 완료된 학습 */}
      <div className="flex-1 flex flex-col min-h-0">
        <StudentSectionTitle className="mb-4 shrink-0" icon={<History className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />}>
          완료된 학습
        </StudentSectionTitle>
        
        <div className="flex-1 overflow-y-auto scrollbar-simple-cyan pr-2 space-y-2">
          {completed.length === 0 ? (
            <div className="h-20 flex items-center justify-center border border-dashed border-cyan-500/10 rounded-xl bg-cyan-950/5">
               <StudentText variant="muted" className="text-xs">완료된 학습이 없습니다.</StudentText>
            </div>
          ) : (
            completed.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-950/20 border border-green-500/10 rounded-2xl group">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500/80" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-cyan-700 font-black uppercase block leading-none mb-1 truncate">{item.category}</span>
                    <h4 className="text-sm font-bold text-cyan-100 group-hover:text-white truncate italic">{item.title}</h4>
                  </div>
                </div>
                <div className="text-[9px] font-black text-green-500/30 uppercase tracking-[0.2em] shrink-0 border border-green-500/20 px-2 py-1 rounded-lg">
                  학습 완료
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. 자격증 및 수상내역 (테이블 레이아웃) */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/20 border border-yellow-500/10 rounded-2xl p-4 backdrop-blur-sm">
        <StudentSectionTitle className="mb-4 shrink-0" icon={<Trophy className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />}>
          자격증 및 수상내역
        </StudentSectionTitle>
        
        <div className="flex-1 overflow-y-auto scrollbar-simple-cyan pr-2">
          {allAchievementsCount === 0 ? (
            <div className="h-full flex items-center justify-center border border-dashed border-yellow-500/10 rounded-xl">
               <StudentText variant="muted" className="text-xs">아직 획득한 업적이 없습니다.</StudentText>
            </div>
          ) : (
            <Table>
              <TableHeader className="[&_tr]:border-yellow-500/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[12%] text-[9px] font-black uppercase text-yellow-500/50 p-2">상태</TableHead>
                  <TableHead className="text-[9px] font-black uppercase text-yellow-500/50 p-2">자격증 / 수상내역</TableHead>
                  <TableHead className="w-[80px] text-[9px] font-black uppercase text-yellow-500/50 p-2 text-right">취득일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 자격증 리스트 */}
                {attained.map((cert) => (
                  <TableRow key={cert.id} className="border-yellow-500/5 hover:bg-yellow-500/5">
                    <TableCell className="p-2">
                      <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                        <Star className="w-3 h-3 text-yellow-400" />
                      </div>
                    </TableCell>
                    <TableCell className="p-2 font-bold text-[11px] text-cyan-50 italic">{cert.title}</TableCell>
                    <TableCell className="p-2 text-[10px] text-cyan-600 font-mono text-right whitespace-nowrap">
                      {cert.date && cert.date.trim() !== "" ? cert.date : (
                        <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500/60 rounded border border-yellow-500/20 text-[8px] font-bold">취득 예정</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {/* 수상내역 리스트 */}
                {awards.map((award) => (
                  <TableRow key={award.id} className="border-orange-500/5 hover:bg-orange-500/5">
                    <TableCell className="p-2">
                      <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                        <AwardIcon className="w-3 h-3 text-orange-400" />
                      </div>
                    </TableCell>
                    <TableCell className="p-2 font-bold text-[11px] text-cyan-50 italic">{award.title}</TableCell>
                    <TableCell className="p-2 text-[10px] text-cyan-600 font-mono text-right whitespace-nowrap">
                      {award.date && award.date.trim() !== "" ? award.date : (
                        <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500/60 rounded border border-orange-500/20 text-[8px] font-bold">수여 예정</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}