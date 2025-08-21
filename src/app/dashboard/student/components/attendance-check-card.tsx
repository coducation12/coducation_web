'use client';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { StudentText, studentButtonStyles } from "./StudentThemeProvider";
import { cn } from "@/lib/utils";

export function AttendanceCheckCard({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAttendanceCheck = async () => {
    setLoading(true);
    setMsg('');
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // 기존 출석 기록 확인
      const { data: existing } = await supabase
        .from('student_activity_logs')
        .select('id')
        .eq('student_id', studentId)
        .eq('activity_type', 'attendance')
        .eq('date', today)
        .single();
      
      if (existing) {
        // 기존 기록이 있으면 attended를 true로 업데이트
        const { error } = await supabase
          .from('student_activity_logs')
          .update({ attended: true })
          .eq('id', existing.id);
        
        if (error) {
          console.error('출석 업데이트 실패:', error);
          setMsg('출석 처리 중 오류가 발생했습니다.');
          return;
        }
      } else {
        // 새로운 출석 기록 생성
        const { error } = await supabase
          .from('student_activity_logs')
          .insert({
            student_id: studentId,
            activity_type: 'attendance',
            date: today,
            attended: true
          });
        
        if (error) {
          console.error('출석 기록 생성 실패:', error);
          setMsg('출석 처리 중 오류가 발생했습니다.');
          return;
        }
      }
      
      setMsg('출석이 완료되었습니다!');
    } catch (error) {
      console.error('출석체크 오류:', error);
      setMsg('출석 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Button
        className={cn("w-full max-w-xs py-3 text-lg font-bold flex items-center justify-center gap-2", studentButtonStyles.primary)}
        onClick={handleAttendanceCheck}
        disabled={loading}
      >
        <CheckCircle className="w-5 h-5" /> 출석하기
      </Button>
      {msg && <StudentText variant="accent" className="mt-2" glow>{msg}</StudentText>}
    </div>
  );
} 