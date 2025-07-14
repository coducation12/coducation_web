'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "./types";

// 주간 캘린더 관련 유틸리티 함수들
const getWeekDates = (date: Date): Date[] => {
  const week = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay()); // 일요일부터 시작
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }
  return week;
};

const getStudentsByDay = (day: string): Student[] => {
  const baseStudents = [
    { id: '1', name: '김민준', day: '월/수', course: 'Python', curriculum: '기초 과정', progress: 80, phone: '010-1234-5678' },
    { id: '2', name: '이서아', day: '화/목', course: 'Python', curriculum: '기초 과정', progress: 80, phone: '010-1234-5678' },
    { id: '3', name: '박도윤', day: '금', course: 'C언어', curriculum: '기초 과정', progress: 90, phone: '010-3456-7890' },
    { id: '4', name: '정현우', day: '월/수', course: 'Python', curriculum: '기초 과정', progress: 80, phone: '010-1234-5678' },
    { id: '5', name: '한소희', day: '월/수', course: 'Python', curriculum: '기초 과정', progress: 80, phone: '010-1234-5678' },
    { id: '6', name: '윤준호', day: '월/수', course: 'Python', curriculum: '기초 과정', progress: 80, phone: '010-1234-5678' },
  ];

  const dayMap: { [key: string]: string[] } = {
    '월': ['월/수'],
    '화': ['화/목'],
    '수': ['월/수'],
    '목': ['화/목'],
    '금': ['금'],
    '토': [],
    '일': []
  };

  const targetDays = dayMap[day] || [];
  const filteredStudents = baseStudents.filter(student => 
    targetDays.some(targetDay => student.day.includes(targetDay))
  );

  // attendanceTime 속성 추가
  return filteredStudents.map(student => ({
    ...student,
    attendanceTime: {
      start: '10:00',
      end: '11:30',
      status: 'unregistered' as const
    }
  }));
};

const getDayName = (date: Date): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
};

interface WeeklyCalendarProps {
  currentDate: Date;
}

export function WeeklyCalendar({ currentDate }: WeeklyCalendarProps) {
  const weekDates = getWeekDates(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 모바일에서는 일요일 제외 (월~토만 표시)
  const mobileWeekDates = weekDates.filter((_, index) => index !== 0); // 일요일(index 0) 제거

  return (
    <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-cyan-100">주간 캘린더</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* 데스크톱: 7일 모두 표시 */}
        <div className="hidden lg:grid grid-cols-7 gap-2 p-4">
          {weekDates.map((date, index) => {
            const dayName = getDayName(date);
            const students = getStudentsByDay(dayName);
            const isToday = date.getTime() === today.getTime();
            const isPast = date < today;
            
            return (
              <div
                key={index}
                className={`relative p-3 rounded-lg border transition-colors min-h-[120px] ${
                  isToday 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100' 
                    : isPast
                    ? 'bg-gray-700/30 border-gray-600 text-gray-400'
                    : 'bg-cyan-900/10 border-cyan-500/30 text-cyan-200'
                }`}
              >
                <div className="text-center mb-3">
                  <div className="text-xs font-medium opacity-70">{dayName}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-cyan-100' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
                
                {students.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-center opacity-70 mb-2">
                      {students.length}명
                    </div>
                    <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto">
                      {students.map(student => (
                        <div
                          key={student.id}
                          className="text-[10px] text-center px-1 bg-cyan-500/20 rounded border border-cyan-400/30 truncate hover:bg-cyan-500/30 transition-colors"
                          title={`${student.name} - ${student.course}`}
                        >
                          {student.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {students.length === 0 && (
                  <div className="text-center">
                    <div className="text-xs opacity-50">수업 없음</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 모바일: 월~토만 표시 (3,3 구성) */}
        <div className="lg:hidden grid grid-cols-3 gap-2 p-4">
          {mobileWeekDates.map((date, index) => {
            const dayName = getDayName(date);
            const students = getStudentsByDay(dayName);
            const isToday = date.getTime() === today.getTime();
            const isPast = date < today;
            
            return (
              <div
                key={index}
                className={`relative p-3 rounded-lg border transition-colors min-h-[120px] ${
                  isToday 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100' 
                    : isPast
                    ? 'bg-gray-700/30 border-gray-600 text-gray-400'
                    : 'bg-cyan-900/10 border-cyan-500/30 text-cyan-200'
                }`}
              >
                <div className="text-center mb-3">
                  <div className="text-xs font-medium opacity-70">{dayName}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-cyan-100' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
                
                {students.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-center opacity-70 mb-2">
                      {students.length}명
                    </div>
                    <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                      {students.map(student => (
                        <div
                          key={student.id}
                          className="text-[10px] text-center px-1 bg-cyan-500/20 rounded border border-cyan-400/30 truncate hover:bg-cyan-500/30 transition-colors"
                          title={`${student.name} - ${student.course}`}
                        >
                          {student.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {students.length === 0 && (
                  <div className="text-center">
                    <div className="text-xs opacity-50">수업 없음</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 