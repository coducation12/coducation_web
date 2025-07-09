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
    const { data: existing } = await supabase
      .from('student_activity_logs')
      .select('id')
      .eq('student_id', studentId)
      .eq('date', today)
      .single();
    if (existing) {
      await supabase
        .from('student_activity_logs')
        .update({ attended: true })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('student_activity_logs')
        .insert({
          student_id: studentId,
          date: today,
          attended: true,
          typing_score: 0,
          typing_speed: 0
        });
    }
    setLoading(false);
    setMsg('출석이 완료되었습니다!');
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