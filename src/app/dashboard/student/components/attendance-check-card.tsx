'use client';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { StudentText, studentButtonStyles } from "./StudentThemeProvider";
import { cn } from "@/lib/utils";

export function AttendanceCheckCard({ studentId }: { studentId: string }) {
  const router = useRouter();

  const handleAttendanceCheck = () => {
    // 타자연습 페이지로 바로 이동
    router.push('/dashboard/student/typing');
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Button
        className={cn("w-full max-w-xs py-3 text-lg font-bold flex items-center justify-center gap-2", studentButtonStyles.primary)}
        onClick={handleAttendanceCheck}
      >
        <CheckCircle className="w-5 h-5" /> 출석하기
      </Button>
    </div>
  );
} 