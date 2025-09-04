'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StudentText, studentButtonStyles } from '../../app/dashboard/student/components/StudentThemeProvider';
import { cn } from '@/lib/utils';

interface AttendanceData {
  date: string;
  attended: boolean;
}

interface AttendanceCalendarProps {
  studentId: string;
}

export function AttendanceCalendar({ studentId }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [currentDate, studentId]);

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('student_activity_logs')
        .select('date, attended, activity_type')
        .eq('student_id', studentId)  // 특정 학생의 출석 데이터만 조회
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .eq('attended', true);

      if (error) throw error;

      const attendanceMap = new Map();
      (data || []).forEach(item => {
        attendanceMap.set(item.date, true);
      });

      setAttendanceData(Array.from(attendanceMap.entries()).map(([date, attended]) => ({
        date,
        attended: !!attended
      })));
    } catch (error) {
      console.error('출석 데이터 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const isAttended = (day: number) => {
    // 한국 시간 기준으로 날짜 생성 (UTC 변환 방지)
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return attendanceData.some(data => data.date === dateStr && data.attended);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <button
          onClick={prevMonth}
          className={cn("p-1 hover:bg-cyan-400/10 rounded transition-colors", studentButtonStyles.ghost)}
        >
          <ChevronLeft className="w-4 h-4 text-cyan-100" />
        </button>
        <StudentText variant="secondary" className="font-semibold">
          {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
        </StudentText>
        <button
          onClick={nextMonth}
          className={cn("p-1 hover:bg-cyan-400/10 rounded transition-colors", studentButtonStyles.ghost)}
        >
          <ChevronRight className="w-4 h-4 text-cyan-100" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={cn(
                "text-center text-sm font-medium py-1",
                index === 0 ? "text-red-400" : index === 6 ? "text-blue-400" : "text-cyan-200"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7 gap-1 flex-1 min-h-0">
          {/* 빈 칸들 */}
          {Array.from({ length: startingDayOfWeek }, (_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {/* 날짜들 */}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const attended = isAttended(day);
            const today = isToday(day);
            
            return (
              <div
                key={day}
                className={cn(
                  "aspect-square flex items-center justify-center text-base font-medium cursor-pointer transition-all duration-200 hover:bg-cyan-400/10",
                  today && "ring-2 ring-cyan-400 ring-offset-1 ring-offset-transparent",
                  attended && "bg-green-500/20 text-green-300",
                  !attended && today && "text-cyan-300",
                  !attended && !today && "text-cyan-400/60"
                )}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="mt-4 flex items-center justify-center gap-4 text-sm flex-shrink-0">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500/20 border border-green-500/40" />
            <StudentText variant="muted">출석</StudentText>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 ring-2 ring-cyan-400 ring-offset-1 ring-offset-transparent" />
            <StudentText variant="muted">오늘</StudentText>
          </div>
        </div>
      </div>
    </div>
  );
} 