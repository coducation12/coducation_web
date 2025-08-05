'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "./types";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

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

// DB에서 학생 데이터를 가져오는 함수
const getStudentsByDay = async (day: string): Promise<Student[]> => {
  try {
    // students 테이블에서 학생 정보와 담당 강사 정보를 함께 가져오기
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select(`
        user_id,
        assigned_teachers,
        attendance_schedule,
        users!students_user_id_fkey(name)
      `);

    if (studentsError) {
      console.error('학생 데이터 가져오기 실패:', studentsError);
      return [];
    }

    // 담당 강사 ID들을 수집
    const teacherIds = new Set<string>();
    (studentsData || []).forEach((student: any) => {
      if (student.assigned_teachers && Array.isArray(student.assigned_teachers)) {
        student.assigned_teachers.forEach((teacherId: string) => {
          teacherIds.add(teacherId);
        });
      }
    });

    // 강사 정보 가져오기
    const { data: teachersData, error: teachersError } = await supabase
      .from('users')
      .select('id, name')
      .in('id', Array.from(teacherIds));

    if (teachersError) {
      console.error('강사 데이터 가져오기 실패:', teachersError);
      return [];
    }

    // 강사 ID를 이름으로 매핑
    const teacherMap = new Map();
    (teachersData || []).forEach((teacher: any) => {
      teacherMap.set(teacher.id, teacher.name);
    });

    // 요일을 숫자로 변환 (일요일=0, 월요일=1, ...)
    const dayToNumber: { [key: string]: number } = {
      '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6
    };
    const targetDayNumber = dayToNumber[day];

    // 해당 요일에 수업이 있는 학생들 필터링
    const filteredStudents = (studentsData || []).filter((student: any) => {
      const schedule = student.attendance_schedule || {};
      
      // attendance_schedule이 객체인 경우
      if (typeof schedule === 'object' && schedule !== null) {
        // 숫자 키로 저장된 경우 (0, 1, 2, ...)
        if (schedule[targetDayNumber] !== undefined && schedule[targetDayNumber] !== null) {
          return true;
        }
        
        // 문자열 키로 저장된 경우 ('0', '1', '2', ...)
        if (schedule[targetDayNumber.toString()] !== undefined && schedule[targetDayNumber.toString()] !== null) {
          return true;
        }
        
        // 요일 이름으로 저장된 경우 ('월', '화', ...)
        if (schedule[day] !== undefined && schedule[day] !== null) {
          return true;
        }
      }
      
      return false;
    });

    // 학생 데이터를 기존 형식으로 변환
    const convertedStudents = filteredStudents.map((student: any, index: number) => {
      const teacherId = student.assigned_teachers?.[0] || '';
      const teacherName = teacherMap.get(teacherId) || '미배정';
      
      // attendance_schedule을 기존 형식으로 변환
      const schedule = student.attendance_schedule || {};
      const days: string[] = [];
      let currentDayTime = '';
      
      Object.entries(schedule).forEach(([dayKey, timeData]: [string, any]) => {
        // 숫자 키인 경우
        if (!isNaN(parseInt(dayKey))) {
          const dayIndex = parseInt(dayKey);
          const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
          if (dayIndex >= 0 && dayIndex < 7) {
            days.push(dayNames[dayIndex]);
            // 현재 요일과 일치하는 경우 시간 정보 저장
            if (dayIndex === targetDayNumber && timeData && typeof timeData === 'object') {
              currentDayTime = `${timeData.startTime || '10:00'}-${timeData.endTime || '11:30'}`;
            }
          }
        } else {
          // 문자열 키인 경우 (요일 이름)
          days.push(dayKey);
          // 현재 요일과 일치하는 경우 시간 정보 저장
          if (dayKey === day && timeData && typeof timeData === 'object') {
            currentDayTime = `${timeData.startTime || '10:00'}-${timeData.endTime || '11:30'}`;
          }
        }
      });

      // 기본 수업 정보 (실제로는 curriculum 테이블에서 가져와야 함)
      const courses = ['Python', 'C언어', 'Java', 'JavaScript'];
      const curriculums = ['기초 과정', '중급 과정', '고급 과정'];
      
      return {
        id: student.user_id,
        name: student.users?.name || '알 수 없음',
        teacher: teacherName,
        day: days.join('/'),
        course: courses[index % courses.length],
        curriculum: curriculums[index % curriculums.length],
        progress: Math.floor(Math.random() * 30) + 70, // 임시 진행률
        phone: '010-1234-5678', // 임시 전화번호
        attendanceTime: {
          start: currentDayTime.split('-')[0] || '10:00',
          end: currentDayTime.split('-')[1] || '11:30',
          status: 'unregistered' as const
        }
      };
    });

    return convertedStudents;
  } catch (error) {
    console.error('학생 데이터 가져오기 중 오류:', error);
    return [];
  }
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
  const [studentsByDay, setStudentsByDay] = useState<{ [key: string]: Student[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  // 각 요일별 학생 데이터 가져오기
  useEffect(() => {
    const fetchStudentsByDay = async () => {
      setIsLoading(true);
      const studentsData: { [key: string]: Student[] } = {};
      
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      for (const day of days) {
        studentsData[day] = await getStudentsByDay(day);
      }
      
      setStudentsByDay(studentsData);
      setIsLoading(false);
    };

    fetchStudentsByDay();
  }, [currentDate]);

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
            const students = studentsByDay[dayName] || [];
            const isToday = date.getTime() === today.getTime();
            const isPast = date < today;
            const isSunday = dayName === '일';
            
            return (
              <div
                key={index}
                className={`relative p-3 rounded-lg border transition-colors min-h-[120px] ${
                  isToday 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100' 
                    : isPast
                    ? 'bg-gray-700/30 border-gray-600 text-gray-400'
                    : isSunday
                    ? 'bg-cyan-900/10 border-red-400/50 text-cyan-200' // 일요일 연한 빨간색 테두리
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
            const students = studentsByDay[dayName] || [];
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