'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import React from "react";
import { Student, AttendanceStatus, STATUS_CONFIG } from "./types";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { StudentList } from "./StudentList";
import { supabase } from "@/lib/supabase";

// 상수 정의
const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

// DB에서 학생 데이터를 가져오는 함수
const getStudentsByDate = async (date: Date): Promise<Student[]> => {
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

    // 해당 날짜의 요일 구하기 (0: 일요일, 1: 월요일, ...)
    const dayOfWeek = date.getDay();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const currentDayName = dayNames[dayOfWeek];

    // 해당 요일에 수업이 있는 학생들만 필터링
    const filteredStudents = (studentsData || []).filter((student: any) => {
      const schedule = student.attendance_schedule || {};
      
      // attendance_schedule이 객체인 경우
      if (typeof schedule === 'object' && schedule !== null) {
        // 숫자 키로 저장된 경우 (0, 1, 2, ...)
        if (schedule[dayOfWeek] !== undefined && schedule[dayOfWeek] !== null) {
          return true;
        }
        
        // 문자열 키로 저장된 경우 ('0', '1', '2', ...)
        if (schedule[dayOfWeek.toString()] !== undefined && schedule[dayOfWeek.toString()] !== null) {
          return true;
        }
        
        // 요일 이름으로 저장된 경우 ('월', '화', ...)
        if (schedule[currentDayName] !== undefined && schedule[currentDayName] !== null) {
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
      const times: string[] = [];
      let currentDayTime = '';
      
      Object.entries(schedule).forEach(([dayKey, timeData]: [string, any]) => {
        // 숫자 키인 경우
        if (!isNaN(parseInt(dayKey))) {
          const dayIndex = parseInt(dayKey);
          const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
          if (dayIndex >= 0 && dayIndex < 7) {
            days.push(dayNames[dayIndex]);
            if (timeData && typeof timeData === 'object') {
              const timeStr = `${timeData.startTime || '10:00'}-${timeData.endTime || '11:30'}`;
              times.push(timeStr);
              // 현재 요일과 일치하는 경우 시간 정보 저장
              if (dayIndex === dayOfWeek) {
                currentDayTime = timeStr;
              }
            }
          }
        } else {
          // 문자열 키인 경우 (요일 이름)
          days.push(dayKey);
          if (timeData && typeof timeData === 'object') {
            const timeStr = `${timeData.startTime || '10:00'}-${timeData.endTime || '11:30'}`;
            times.push(timeStr);
            // 현재 요일과 일치하는 경우 시간 정보 저장
            if (dayKey === currentDayName) {
              currentDayTime = timeStr;
            }
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
          status: 'unregistered' as AttendanceStatus
        },
        originalSchedule: schedule
      };
    });

    return convertedStudents;
  } catch (error) {
    console.error('학생 데이터 가져오기 중 오류:', error);
    return [];
  }
};

// 날짜가 지났는지 확인하는 함수
const isDatePassed = (targetDate: Date): boolean => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  return target < today;
};

// 자동 결석 처리 함수
const processAutoAbsence = (students: Student[], currentDate: Date): Student[] => {
  return students.map(student => {
    // 이미 출석체크가 된 경우는 건드리지 않음
    if (student.attendanceTime.status !== 'unregistered' || student.attendanceTime.checkedAt) {
      return student;
    }

    // 수업 시간이 지났고 아직 미등록 상태라면 자동으로 결석 처리
    const classEndTime = new Date(currentDate);
    const [endHour, endMinute] = student.attendanceTime.end.split(':').map(Number);
    classEndTime.setHours(endHour, endMinute, 0, 0);

    if (new Date() > classEndTime) {
      return {
        ...student,
        attendanceTime: {
          ...student.attendanceTime,
          status: 'absent',
          checkedAt: new Date()
        }
      };
    }

    return student;
  });
};

const timeToIndex = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return (h - 10) * 2 + (m === 30 ? 1 : 0);
};

const getStatusColor = (status: AttendanceStatus): string => {
  return STATUS_CONFIG[status].color;
};

const getStatusText = (status: AttendanceStatus): string => {
  return STATUS_CONFIG[status].text;
};

// 커스텀 훅
const useAttendanceScheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 날짜 변경 시 학생 데이터 새로 불러오기
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      const studentsData = await getStudentsByDate(currentDate);
      setStudents(studentsData);
      setIsLoading(false);
    };
    
    fetchStudents();
  }, [currentDate]);

  // 자동 결석 처리 (1분마다 체크)
  useEffect(() => {
    const interval = setInterval(() => {
      setStudents(prev => processAutoAbsence(prev, currentDate));
    }, 60000); // 1분마다 체크

    return () => clearInterval(interval);
  }, [currentDate]);

  const handlePrev = useCallback(() => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  }, []);

  const handleAttendanceChange = useCallback(async (id: string, value: AttendanceStatus) => {
    // 로컬 상태 업데이트
    setStudents(prev => prev.map(s =>
      s.id === id ? { 
        ...s, 
        attendanceTime: { 
          ...s.attendanceTime, 
          status: value,
          checkedAt: new Date() // 출석체크 시간 기록
        } 
      } : s
    ));

    // 데이터베이스에 출석 기록 저장
    try {
      const today = currentDate.toISOString().split('T')[0];
      
      // 기존 출석 기록 확인
      const { data: existing } = await supabase
        .from('student_activity_logs')
        .select('id')
        .eq('student_id', id)
        .eq('activity_type', 'attendance')
        .eq('date', today)
        .single();

      if (existing) {
        // 기존 기록이 있으면 업데이트
        const { error } = await supabase
          .from('student_activity_logs')
          .update({ 
            attended: value === 'present',
            created_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) {
          console.error('출석 업데이트 실패:', error);
        }
      } else {
        // 새로운 출석 기록 생성
        const { error } = await supabase
          .from('student_activity_logs')
          .insert({
            student_id: id,
            activity_type: 'attendance',
            date: today,
            attended: value === 'present'
          });
        
        if (error) {
          console.error('출석 기록 생성 실패:', error);
        }
      }
    } catch (error) {
      console.error('출석 상태 저장 중 오류:', error);
    }
  }, [currentDate]);

  return {
    currentDate,
    students,
    isLoading,
    handlePrev,
    handleNext,
    handleAttendanceChange
  };
};

// 서브 컴포넌트들
const ScheduleHeader = ({ 
  currentDate, 
  onPrev, 
  onNext 
}: { 
  currentDate: Date; 
  onPrev: () => void; 
  onNext: () => void; 
}) => {
  const todayStr = currentDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const todayStrMobile = currentDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-cyan-100 font-bold text-xl sm:text-2xl whitespace-nowrap">출석 스케줄</span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
          <button onClick={onPrev} className="p-1 rounded hover:bg-cyan-900/30 transition-colors">
            <ChevronLeft className="w-6 h-6 text-cyan-200" />
          </button>
          <span className="text-cyan-200 text-lg sm:text-xl font-semibold select-none text-center truncate max-w-[220px]">
            <span className="hidden md:inline">{todayStr}</span>
            <span className="md:hidden">{todayStrMobile}</span>
          </span>
          <button onClick={onNext} className="p-1 rounded hover:bg-cyan-900/30 transition-colors">
            <ChevronRight className="w-6 h-6 text-cyan-200" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end min-w-0">
          <Badge className="bg-green-500/60 text-white text-xs">출석</Badge>
          <Badge className="bg-red-500/60 text-white text-xs">결석</Badge>
          <Badge className="bg-yellow-500/60 text-white text-xs">보강</Badge>
        </div>
      </div>
    </CardHeader>
  );
};

const ScheduleGrid = ({ students, isLoading }: { students: Student[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-cyan-200">학생 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `minmax(72px, max-content) repeat(20, 1fr)`
        }}
      >
        {/* 헤더 */}
        <div className="bg-transparent border-b border-cyan-500/30 flex items-center justify-center px-2 h-8 font-medium text-cyan-200 text-sm text-center">
          학생
        </div>
        {TIME_SLOTS.slice(0, -1).map((time, idx) => (
          <div
            key={time}
            className="relative border-b border-cyan-500/30 flex items-center justify-center h-8 text-cyan-200 text-xs font-medium"
            style={{
              borderLeft: idx % 2 === 0 ? '1px dashed #67e8f9' : undefined,
              background: 'rgba(8,40,80,0.10)'
            }}
          >
            {idx % 2 === 0 ? time : ''}
          </div>
        ))}
        
        {/* 학생별 행 */}
        {students.map((student, rowIdx) => (
          <ScheduleRow key={student.id} student={student} rowIdx={rowIdx} />
        ))}
      </div>
    </div>
  );
};

const ScheduleRow = ({ student, rowIdx }: { student: Student; rowIdx: number }) => {
  return (
    <React.Fragment>
      <div
        className="flex items-center justify-center px-2 h-8 border-b border-cyan-500/20 text-cyan-100 text-sm font-medium text-center min-w-0 overflow-hidden whitespace-nowrap text-ellipsis"
        style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {student.name}
      </div>
      {Array.from({ length: 20 }).map((_, colIdx) => {
        const startIdx = timeToIndex(student.attendanceTime.start);
        const endIdx = timeToIndex(student.attendanceTime.end);
        
        if (colIdx === startIdx) {
          const colSpan = endIdx - startIdx;
          return (
            <div
              key={student.id + '-bar'}
              className={`relative h-8 flex items-center justify-center border-b border-cyan-500/20 ${rowIdx % 2 === 0 ? 'bg-cyan-900/10' : ''}`}
              style={{ gridColumn: `span ${colSpan}`, zIndex: 1 }}
            >
              <div className={`w-full h-6 rounded border-2 ${getStatusColor(student.attendanceTime.status)} flex items-center justify-center transition-colors duration-300`}>
                <span className="text-[8px] sm:text-[10px] md:text-xs opacity-80 leading-tight w-full text-center select-none truncate px-1">
                  <span className="hidden sm:inline">{student.attendanceTime.start}~{student.attendanceTime.end}</span>
                  <span className="sm:hidden">{student.attendanceTime.start}</span>
                </span>
              </div>
            </div>
          );
        }
        
        if (colIdx > startIdx && colIdx < endIdx) {
          return null;
        }
        
        return (
          <div
            key={student.id + '-empty-' + colIdx}
            className={`h-8 border-b border-cyan-500/20 ${rowIdx % 2 === 0 ? 'bg-cyan-900/10' : ''}`}
            style={{
              borderLeft: colIdx % 2 === 0 ? '1px dashed #67e8f9' : undefined,
            }}
          />
        );
      })}
    </React.Fragment>
  );
};

// 메인 컴포넌트
export function AttendanceScheduler() {
  const {
    currentDate,
    students,
    isLoading,
    handlePrev,
    handleNext,
    handleAttendanceChange
  } = useAttendanceScheduler();

  return (
    <>
      <WeeklyCalendar currentDate={currentDate} />
      
      <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <ScheduleHeader 
          currentDate={currentDate} 
          onPrev={handlePrev} 
          onNext={handleNext} 
        />
        <CardContent className="p-0">
          <ScheduleGrid students={students} isLoading={isLoading} />
        </CardContent>
      </Card>
      
      <StudentList 
        students={students} 
        onAttendanceChange={handleAttendanceChange} 
      />
    </>
  );
} 