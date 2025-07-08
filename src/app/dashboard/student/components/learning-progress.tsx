'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Book, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Curriculum {
  id: string;
  title: string;
  description: string;
  checklist: string[];
}

interface LearningProgress {
  curriculum: Curriculum;
  completedSteps: number;
  totalSteps: number;
  progress: number;
}

export function LearningProgress({ studentId, vertical }: { studentId: string, vertical?: boolean }) {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLearningProgress();
  }, [studentId]);

  const fetchLearningProgress = async () => {
    try {
      // 현재 학생의 커리큘럼 조회
      const { data: studentData } = await supabase
        .from('students')
        .select('current_curriculum_id')
        .eq('user_id', studentId)
        .single();

      if (!studentData?.current_curriculum_id) {
        setIsLoading(false);
        return;
      }

      // 커리큘럼 정보 조회
      const { data: curriculumData } = await supabase
        .from('curriculums')
        .select('*')
        .eq('id', studentData.current_curriculum_id)
        .single();

      if (!curriculumData) {
        setIsLoading(false);
        return;
      }

      // 완료된 학습 단계 조회
      const { data: completedLogs } = await supabase
        .from('student_activity_logs')
        .select('curriculum_id, memo')
        .eq('student_id', studentId)
        .eq('curriculum_id', studentData.current_curriculum_id)
        .not('memo', 'is', null);

      const totalSteps = curriculumData.checklist?.length || 0;
      const completedSteps = completedLogs?.length || 0;
      const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      setProgress({
        curriculum: curriculumData,
        completedSteps,
        totalSteps,
        progress: progressPercent
      });
    } catch (error) {
      console.error('학습 진행률 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-2 font-headline text-lg font-bold mb-2">
          <Book className="w-5 h-5" />
          학습 진행률
        </div>
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div>
        <div className="flex items-center gap-2 font-headline text-lg font-bold mb-2">
          <Book className="w-5 h-5" />
          학습 진행률
        </div>
        <div className="text-muted-foreground">진행 중인 커리큘럼이 없습니다.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 font-headline text-lg font-bold mb-2">
        <Book className="w-5 h-5" />
        학습 진행률
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">{progress.curriculum.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {progress.curriculum.description}
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>진행률</span>
            <span>{Math.round(progress.progress)}%</span>
          </div>
          <Progress value={progress.progress} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.completedSteps}단계 완료</span>
            <span>총 {progress.totalSteps}단계</span>
          </div>
        </div>
        {progress.curriculum.checklist && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">학습 단계</h4>
            <div className="space-y-1">
              {progress.curriculum.checklist.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className={index < progress.completedSteps ? "w-4 h-4 text-green-500" : "w-4 h-4 text-gray-500"} />
                  <span className={index < progress.completedSteps ? "line-through text-muted-foreground" : ""}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 