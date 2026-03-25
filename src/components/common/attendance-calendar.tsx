'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StudentText, studentButtonStyles } from '../../app/dashboard/student/components/StudentThemeProvider';
import { cn } from '@/lib/utils';
import { getMonthlyAttendance } from '@/lib/actions';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'unregistered';
  session_type: 'regular' | 'makeup';
  memo?: string;
}

interface AttendanceCalendarProps {
  studentId: string;
}

export function AttendanceCalendar({ studentId }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [currentDate, studentId]);

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
      
      const result = await getMonthlyAttendance(studentId, startDateStr, endDateStr);
      
      if (result.success && result.data) {
        const recordMap: Record<string, AttendanceRecord[]> = {};
        result.data.forEach((item: any) => {
          if (!recordMap[item.date]) recordMap[item.date] = [];
          recordMap[item.date].push(item);
        });
        setAttendanceRecords(recordMap);
      } else {
        console.error('출석 데이터 조회 실패:', result.error);
        setAttendanceRecords({});
      }
    } catch (error) {
      console.error('출석 데이터 조회 실패:', error);
      setAttendanceRecords({});
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

  const getDayRecords = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendanceRecords[dateStr] || [];
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-2 flex-shrink-0 px-2">
        <button
          onClick={prevMonth}
          className={cn("p-1 hover:bg-cyan-400/10 rounded transition-colors", studentButtonStyles.ghost)}
        >
          <ChevronLeft className="w-4 h-4 text-cyan-100" />
        </button>
        <StudentText variant="secondary" className="font-bold text-xl drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
          {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
        </StudentText>
        <button
          onClick={nextMonth}
          className={cn("p-1 hover:bg-cyan-400/10 rounded transition-colors", studentButtonStyles.ghost)}
        >
          <ChevronRight className="w-4 h-4 text-cyan-100" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 px-1">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-1 flex-shrink-0">
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs sm:text-sm font-black tracking-widest py-1.5",
                index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-cyan-500/80"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 border border-cyan-500/10 rounded-lg overflow-hidden bg-cyan-950/20">
          {/* 빈 칸들 */}
          {Array.from({ length: startingDayOfWeek }, (_, index) => (
            <div key={`empty-${index}`} className="aspect-square bg-cyan-950/10" />
          ))}
          
          {/* 날짜들 */}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const records = getDayRecords(day);
            const today = isToday(day);
            
            // 상태 우선순위: makeup > present > absent > unregistered
            let mainStatus = 'none';
            if (records.some(r => r.session_type === 'makeup')) mainStatus = 'makeup';
            else if (records.some(r => r.status === 'present')) mainStatus = 'present';
            else if (records.some(r => r.status === 'absent')) mainStatus = 'absent';
            else if (records.length > 0) mainStatus = 'unregistered';

            return (
              <div
                key={day}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center relative cursor-default border border-cyan-500/5",
                  today && "ring-1 ring-inset ring-cyan-400/50 bg-cyan-400/5",
                  mainStatus === 'present' && "bg-green-500/20",
                  mainStatus === 'absent' && "bg-red-500/20",
                  mainStatus === 'makeup' && "bg-yellow-500/20",
                )}
              >
                <span className={cn(
                  "text-[11px] font-bold z-10",
                  today ? "text-cyan-100" : "text-cyan-100/70",
                  mainStatus === 'present' && "text-green-300",
                  mainStatus === 'absent' && "text-red-300",
                  mainStatus === 'makeup' && "text-yellow-300",
                )}>
                  {day}
                </span>
                
                {/* 하단 점 표시 (여러 세션이 있을 경우) */}
                <div className="flex gap-0.5 mt-0.5 h-1">
                  {records.map((r, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "w-1 h-1 rounded-full",
                        r.status === 'present' ? "bg-green-400" : 
                        r.status === 'absent' ? "bg-red-400" : 
                        r.session_type === 'makeup' ? "bg-yellow-400" : "bg-slate-500"
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 (Legend) */}
      <div className="mt-2 flex justify-center gap-3 px-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500/60"></div>
          <span className="text-[9px] font-bold text-cyan-200/80">출석</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/60"></div>
          <span className="text-[9px] font-bold text-cyan-200/80">결석</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500/60"></div>
          <span className="text-[9px] font-bold text-cyan-200/80">보강</span>
        </div>
      </div>
    </div>
  );
}