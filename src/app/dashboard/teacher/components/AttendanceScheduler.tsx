'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import React from "react";

// 타입 정의
interface Student {
  id: string;
  name: string;
  day: string;
  course: string;
  progress: number;
  phone: string;
  attendanceTime: {
    start: string;
    end: string;
    status: 'unregistered' | 'present' | 'absent' | 'makeup';
    checkedAt?: Date; // 출석체크 시간
  };
}

type AttendanceStatus = 'unregistered' | 'present' | 'absent' | 'makeup';

// 상수 정의
const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

const STATUS_CONFIG = {
  unregistered: { color: 'bg-gray-500/80 border-gray-400', text: '미등록' },
  present: { color: 'bg-green-500/80 border-green-400', text: '출석' },
  absent: { color: 'bg-red-500/80 border-red-400', text: '결석' },
  makeup: { color: 'bg-yellow-500/80 border-yellow-400', text: '보강' }
} as const;

// 유틸리티 함수들
const getMockStudentsByDate = (date: Date): Student[] => {
  const day = date.getDate();
  const baseStudents = [
    { id: '1', name: '김민준', day: '월/수', course: 'Python 기초', progress: 80, phone: '010-1234-5678' },
    { id: '2', name: '이서아', day: '화/목', course: 'Python 기초', progress: 80, phone: '010-1234-5678' },
    { id: '3', name: '박도윤', day: '금', course: 'C언어', progress: 90, phone: '010-3456-7890' },
    { id: '4', name: '정현우', day: '월/수', course: 'Python 기초', progress: 80, phone: '010-1234-5678' },
    { id: '5', name: '한소희', day: '월/수', course: 'Python 기초', progress: 80, phone: '010-1234-5678' },
    { id: '6', name: '윤준호', day: '월/수', course: 'Python 기초', progress: 80, phone: '010-1234-5678' },
  ];

  const timeSlots = [
    { start: '10:00', end: '11:30' },
    { start: '11:00', end: '12:30' },
    { start: '12:30', end: '14:00' },
    { start: '15:00', end: '16:30' },
    { start: '16:00', end: '17:30' },
    { start: '17:00', end: '18:30' },
  ];

  // 초기 상태는 모두 미등록으로 설정
  const statusPatterns = ['unregistered', 'unregistered', 'unregistered', 'unregistered', 'unregistered', 'unregistered'];

  return baseStudents.map((student, index) => ({
    ...student,
    attendanceTime: {
      ...timeSlots[index],
      status: statusPatterns[index] as AttendanceStatus
    }
  }));
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
  const [students, setStudents] = useState(() => getMockStudentsByDate(new Date()));

  // 날짜 변경 시 학생 데이터 새로 불러오기
  useEffect(() => {
    setStudents(getMockStudentsByDate(currentDate));
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

  const handleAttendanceChange = useCallback((id: string, value: AttendanceStatus) => {
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
  }, []);

  return {
    currentDate,
    students,
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

const ScheduleGrid = ({ students }: { students: Student[] }) => {
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

const StudentList = ({ 
  students, 
  onAttendanceChange 
}: { 
  students: Student[]; 
  onAttendanceChange: (id: string, value: AttendanceStatus) => void; 
}) => {
  return (
    <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-cyan-100">학생 목록</CardTitle>
        <button
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded transition-colors text-sm"
          onClick={() => alert('추가 기능 준비중')}
        >
          추가
        </button>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm text-cyan-100 table-auto">
          <thead>
            <tr className="bg-cyan-900/30">
              <th className="px-2 py-1 text-center min-w-[60px] truncate">학생 이름</th>
              <th className="px-2 py-1 text-center min-w-[48px] truncate">수강 요일</th>
              <th className="px-2 py-1 text-center min-w-[80px] truncate">수강 과정</th>
              <th className="px-2 py-1 text-center min-w-[60px] truncate">진행률</th>
              <th className="px-2 py-1 text-center min-w-[100px] truncate hidden sm:table-cell">연락처</th>
              <th className="px-2 py-1 text-center min-w-[70px] truncate">출결</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={student.id} className={idx % 2 === 0 ? 'bg-cyan-900/10' : ''}>
                <td className="px-2 py-1 text-center min-w-[60px] truncate">{student.name}</td>
                <td className="px-2 py-1 text-center min-w-[48px] truncate">{student.day}</td>
                <td className="px-2 py-1 text-center min-w-[80px] truncate">{student.course}</td>
                <td className="px-2 py-1 text-center min-w-[60px] truncate">
                  <span className="block md:hidden">{student.progress}%</span>
                  <span className="hidden md:inline-flex items-center">
                    <div className="w-24 bg-cyan-800/40 rounded-full overflow-hidden mr-2">
                      <div 
                        className="bg-cyan-400 h-2 rounded-full" 
                        style={{ width: `${student.progress}%` }} 
                      />
                    </div>
                    <span className="text-xs text-cyan-200">{student.progress}%</span>
                  </span>
                </td>
                <td className="px-2 py-1 text-center min-w-[100px] truncate hidden sm:table-cell">{student.phone}</td>
                <td className="px-2 py-1 text-center min-w-[70px] truncate">
                  <select
                    className={`border border-cyan-700 rounded px-2 py-1 focus:outline-none transition-colors duration-200 ${
                      student.attendanceTime.status === 'unregistered' ? 'bg-gray-600 text-white' :
                      student.attendanceTime.status === 'present' ? 'bg-green-600 text-white' :
                      student.attendanceTime.status === 'absent' ? 'bg-red-600 text-white' :
                      student.attendanceTime.status === 'makeup' ? 'bg-yellow-400 text-black' :
                      'bg-gray-900 text-white'
                    }`}
                    value={student.attendanceTime.status}
                    onChange={e => onAttendanceChange(student.id, e.target.value as AttendanceStatus)}
                  >
                    <option value="unregistered"></option>
                    <option value="present">출석</option>
                    <option value="absent">결석</option>
                    <option value="makeup">보강</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

// 메인 컴포넌트
export function AttendanceScheduler() {
  const {
    currentDate,
    students,
    handlePrev,
    handleNext,
    handleAttendanceChange
  } = useAttendanceScheduler();

  return (
    <>
      <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <ScheduleHeader 
          currentDate={currentDate} 
          onPrev={handlePrev} 
          onNext={handleNext} 
        />
        <CardContent className="p-0">
          <ScheduleGrid students={students} />
        </CardContent>
      </Card>
      
      <StudentList 
        students={students} 
        onAttendanceChange={handleAttendanceChange} 
      />
    </>
  );
} 