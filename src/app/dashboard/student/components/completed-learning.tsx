'use client';
import { CheckCircle, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StudentSectionTitle, StudentText } from "./StudentThemeProvider";
import { cn } from "@/lib/utils";

interface PortfolioResult {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  date: string;
}

interface LearningItem {
  id: string;
  title: string;
  category: string;
  status: 'ongoing' | 'completed';
  results?: PortfolioResult[];
}

import { getStudentProgress } from "@/lib/actions";

export function CompletedLearning({ studentId }: { studentId: string }) {
  const [portfolio, setPortfolio] = useState<PortfolioResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompleted();
  }, [studentId]);

  async function fetchCompleted() {
    setIsLoading(true);
    try {
      const result = await getStudentProgress(studentId);
      
      if (!result.success) throw new Error(result.error);

      const progress = (result.data?.learning_progress as LearningItem[]) || [];
      
      // 모든 완료된 항목에서 결과물(Portfolio Results)만 추출
      const allResults: PortfolioResult[] = [];
      progress.forEach(item => {
        if (item.results && item.results.length > 0) {
          allResults.push(...item.results);
        }
      });

      // 날짜 역순 정렬
      allResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setPortfolio(allResults);
    } catch (e) {
      console.error('포트폴리오 조회 실패:', e);
      setPortfolio([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <StudentSectionTitle icon={<CheckCircle className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />}>
        포트폴리오 갤러리
      </StudentSectionTitle>
      
      <div className="flex-1 overflow-auto pr-1 custom-scrollbar">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-cyan-900/10 rounded-xl animate-pulse border border-cyan-500/5"></div>
            ))}
          </div>
        ) : portfolio.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 border border-dashed border-cyan-500/20 rounded-2xl bg-cyan-950/5">
            <StudentText variant="muted">아직 등록된 결과물이 없습니다.</StudentText>
            <StudentText variant="secondary" className="text-xs mt-1">학습을 완료하고 멋진 작품을 남겨보세요!</StudentText>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.map((item) => (
              <div 
                key={item.id} 
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-cyan-950/20">
                    <ImageIcon className="w-8 h-8 text-cyan-800" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-cyan-400 font-bold tracking-tighter opacity-70 mb-0.5">{item.date}</span>
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-200 transition-colors">{item.title}</h4>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-cyan-500/20 rounded-full hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 transition-all">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 