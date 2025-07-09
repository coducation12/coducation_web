'use client';

import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StudentSectionTitle, StudentText } from "./StudentThemeProvider";

interface CompletedLearningProps {
  studentId: string;
}

interface CompletedCurriculum {
  id: string;
  title: string;
  completed_at: string;
}

export function CompletedLearning({ studentId }: CompletedLearningProps) {
  const [completed, setCompleted] = useState<CompletedCurriculum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompleted();
    // eslint-disable-next-line
  }, [studentId]);

  async function fetchCompleted() {
    setIsLoading(true);
    try {
      // 완료된 커리큘럼 로그 조회 (예시: memo에 COMPLETED 포함)
      const { data, error } = await supabase
        .from('student_activity_logs')
        .select('curriculum_id, memo, created_at')
        .eq('student_id', studentId)
        .like('memo', '%COMPLETED%')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      // 커리큘럼 정보 join (간단화: title만 표시)
      const curriculumIds = (data || []).map((d: any) => d.curriculum_id);
      let titles: Record<string, string> = {};
      if (curriculumIds.length > 0) {
        const { data: curriculums } = await supabase
          .from('curriculums')
          .select('id, title')
          .in('id', curriculumIds);
        (curriculums || []).forEach((c: any) => {
          titles[c.id] = c.title;
        });
      }
      setCompleted(
        (data || []).map((d: any) => ({
          id: d.curriculum_id,
          title: titles[d.curriculum_id] || '알 수 없음',
          completed_at: d.created_at,
        }))
      );
    } catch (e) {
      setCompleted([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <StudentSectionTitle icon={<CheckCircle className="w-5 h-5 text-green-400 drop-shadow-[0_0_6px_#00ff00]" />}>
        완료된 학습
      </StudentSectionTitle>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <StudentText variant="muted">로딩 중...</StudentText>
        ) : completed.length === 0 ? (
          <StudentText variant="muted">아직 완료된 학습이 없습니다.</StudentText>
        ) : (
          <ul className="space-y-2">
            {completed.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400 drop-shadow-[0_0_6px_#00ff00]" />
                <span className="text-cyan-100">{c.title}</span>
                <span className="ml-auto text-xs text-cyan-400">{c.completed_at.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 