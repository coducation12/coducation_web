'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/lib/supabase";

// 학생 타입 정의
interface Student {
  id: string;
  name: string;
  teacher: string;
  teacherId: string;
  schedule: {
    [key: string]: {
      startTime: string;
      endTime: string;
    };
  };
}

// 강사별 색상 매핑 (동적 생성)
const generateTeacherColors = (teacherIds: string[]) => {
  const colors = [
    'bg-blue-600/70 border-blue-500/50',
    'bg-green-600/70 border-green-500/50',
    'bg-purple-600/70 border-purple-500/50',
    'bg-orange-600/70 border-orange-500/50',
    'bg-pink-600/70 border-pink-500/50',
    'bg-indigo-600/70 border-indigo-500/50',
    'bg-teal-600/70 border-teal-500/50',
    'bg-red-600/70 border-red-500/50',
  ];
  
  const colorMap: { [key: string]: string } = {};
  teacherIds.forEach((teacherId, index) => {
    colorMap[teacherId] = colors[index % colors.length];
  });
  
  return colorMap;
};

// 1시간 단위 시간대
const timeSlots = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00'
];

const days = ['월', '화', '수', '목', '금', '토', '일'];

// 요일을 숫자로 변환
const dayToNumber: { [key: string]: number } = {
  '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0
};

// 시간을 1시간 단위로 변환 (예: 15:30 -> 15:00, 15:10 -> 15:00)
const normalizeTimeToHour = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number);
  return `${hour.toString().padStart(2, '0')}:00`;
};

// 특정 요일과 시간에 해당하는 학생들 찾기
const getStudentsForTimeSlot = (students: Student[], day: string, timeSlot: string) => {
  return students.filter(student => {
    const schedule = student.schedule;
    const dayNumber = dayToNumber[day];
    
    // 해당 요일에 수업이 있는지 확인
    if (!schedule[dayNumber] && !schedule[dayNumber.toString()]) {
      return false;
    }
    
    // 시간대 확인
    const timeData = schedule[dayNumber] || schedule[dayNumber.toString()];
    if (!timeData) return false;
    
    const startTime = timeData.startTime;
    const normalizedStartTime = normalizeTimeToHour(startTime);
    
    // 정규화된 시작 시간이 해당 시간대와 일치하는지 확인
    return normalizedStartTime === timeSlot;
  });
};

interface TimetableProps {
  title?: string;
  className?: string;
}

export function Timetable({ title = "학원 시간표", className = "" }: TimetableProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [teacherColors, setTeacherColors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // DB에서 학생 데이터 가져오기
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      
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
        return;
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
        return;
      }

      // 강사 ID를 이름으로 매핑
      const teacherMap = new Map();
      (teachersData || []).forEach((teacher: any) => {
        teacherMap.set(teacher.id, teacher.name);
      });

      // 학생 데이터를 변환
      const convertedStudents = (studentsData || []).map((student: any) => {
        const teacherId = student.assigned_teachers?.[0] || '';
        const teacherName = teacherMap.get(teacherId) || '미배정';
        
        return {
          id: student.user_id,
          name: student.users?.name || '알 수 없음',
          teacher: teacherName,
          teacherId: teacherId,
          schedule: student.attendance_schedule || {}
        };
      });

      setStudents(convertedStudents);
      setTeacherNames(Object.fromEntries(teacherMap));
      setTeacherColors(generateTeacherColors(Array.from(teacherIds)));
      setIsLoading(false);
    } catch (error) {
      console.error('데이터 가져오기 중 오류:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 강사별 학생 수 계산
  const teacherStudentCount = students.reduce((acc, student) => {
    if (!acc[student.teacherId]) {
      acc[student.teacherId] = 0;
    }
    acc[student.teacherId] += 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className={`p-6 pt-20 lg:pt-6 space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-20">
          <div className="text-cyan-200">시간표 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 pt-20 lg:pt-6 space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">
            {title}
          </h1>
        </div>
        {/* 강사별 범례 */}
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(teacherStudentCount).map(([teacherId, count]) => {
            const teacherName = teacherNames[teacherId] || teacherId;
            const colorClass = teacherColors[teacherId] || 'bg-gray-600/70 border-gray-500/50';
            
            return (
              <div key={teacherId} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${colorClass}`}></div>
                <span className="text-cyan-200 text-xs">{teacherName}</span>
                <span className="text-cyan-400 text-xs">({count}명)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 시간표 테이블 */}
      <Card className="bg-gradient-to-br from-[#0a1837] to-[#0a1a2f] border-cyan-900/40">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* 요일 헤더 */}
              <thead>
                <tr className="bg-cyan-900/20">
                  <th className="w-24 p-3 text-cyan-100 font-semibold border border-cyan-900/40">
                    시간
                  </th>
                  {days.map((day) => (
                    <th key={day} className="w-32 p-3 text-cyan-100 font-semibold border border-cyan-900/40">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* 시간별 행 */}
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-cyan-900/10 transition-colors">
                    {/* 시간 칼럼 */}
                    <td className="p-3 text-cyan-200 font-medium border border-cyan-900/40 text-center">
                      {timeSlot}
                    </td>
                    
                    {/* 각 요일별 셀 */}
                    {days.map((day) => {
                      const studentsInSlot = getStudentsForTimeSlot(students, day, timeSlot);
                      return (
                        <td key={`${day}-${timeSlot}`} className="p-2 border border-cyan-900/40 min-h-[80px]">
                          {studentsInSlot.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1 w-full">
                              {studentsInSlot.map((student) => {
                                const colorClass = teacherColors[student.teacherId] || 'bg-gray-600/70 border-gray-500/50';
                                return (
                                  <div
                                    key={student.id}
                                    className={`rounded text-white text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer text-center min-w-0 w-full truncate ${colorClass}`}
                                    title={`${student.name} - ${student.teacher}`}
                                  >
                                    {student.name}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-cyan-400/50 text-xs text-center py-4">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 