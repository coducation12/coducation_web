'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "./types";
import { useEffect, useState, useMemo } from "react";
import { getAttendanceData } from "../lib/attendance";
import { DayCard } from "./DayCard";

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

const getDayName = (date: Date): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
};

interface WeeklyCalendarProps {
  currentDate: Date;
  teacherId?: string;
}

export function WeeklyCalendar({ currentDate, teacherId }: WeeklyCalendarProps) {
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [studentsByDay, setStudentsByDay] = useState<{ [key: string]: Student[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  // 각 요일별 학생 데이터 가져오기
  useEffect(() => {
    const fetchStudentsByDay = async () => {
      setIsLoading(true);
      const studentsData: { [key: string]: Student[] } = {};

      // 병렬 로드를 위해 Promise.all 사용 가능하지만, 7개 정도는 순차 로드도 나쁘지 않음. 
      // 하지만 성능을 위해 병렬 로드로 리펙토링
      await Promise.all(weekDates.map(async (date) => {
        const dayName = getDayName(date);
        studentsData[dayName] = await getAttendanceData(date, teacherId);
      }));

      setStudentsByDay(studentsData);
      setIsLoading(false);
    };

    fetchStudentsByDay();
  }, [weekDates, teacherId]);

  // 모바일에서는 일요일 제외 (월~토만 표시)
  const mobileWeekDates = useMemo(() => weekDates.filter((_, index) => index !== 0), [weekDates]);

  return (
    <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 mb-6 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-cyan-100 flex items-center justify-between">
          <span>주간 캘린더</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* 데스크톱: 7일 모두 표시 */}
        <div className="hidden lg:grid grid-cols-7 gap-2 p-4">
          {weekDates.map((date, index) => {
            const dayName = getDayName(date);
            return (
              <DayCard
                key={index}
                date={date}
                dayName={dayName}
                students={studentsByDay[dayName] || []}
                isToday={date.getTime() === today.getTime()}
                isPast={date < today}
                isSunday={dayName === '일'}
              />
            );
          })}
        </div>

        {/* 모바일: 월~토만 표시 (3,3 구성) */}
        <div className="lg:hidden grid grid-cols-3 gap-2 p-4">
          {mobileWeekDates.map((date, index) => {
            const dayName = getDayName(date);
            return (
              <DayCard
                key={index}
                date={date}
                dayName={dayName}
                students={studentsByDay[dayName] || []}
                isToday={date.getTime() === today.getTime()}
                isPast={date < today}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}