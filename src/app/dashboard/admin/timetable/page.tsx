'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 샘플 데이터 - 실제로는 API에서 가져올 데이터
const sampleStudents = [
  { id: 1, name: '김철수', teacher: '김강사', time: '14:00-15:00', days: ['월', '수', '금'] },
  { id: 2, name: '이영희', teacher: '이강사', time: '15:00-16:00', days: ['화', '목'] },
  { id: 3, name: '박민수', teacher: '김강사', time: '16:00-17:00', days: ['월', '화', '수', '목', '금'] },
  { id: 4, name: '최지은', teacher: '박강사', time: '17:00-18:00', days: ['화', '목'] },
  { id: 5, name: '정현우', teacher: '이강사', time: '18:00-19:00', days: ['월', '수', '금'] },
  { id: 6, name: '한소영', teacher: '김강사', time: '19:00-20:00', days: ['화', '목'] },
];

// 강사별 색상 매핑
const teacherColors = {
  '김강사': 'bg-blue-600/70 border-blue-500/50',
  '이강사': 'bg-green-600/70 border-green-500/50',
  '박강사': 'bg-purple-600/70 border-purple-500/50',
};

const timeSlots = [
  '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00'
];

const days = ['월', '화', '수', '목', '금', '토', '일'];

// 특정 요일과 시간에 해당하는 학생들 찾기
const getStudentsForTimeSlot = (day: string, timeSlot: string) => {
  return sampleStudents.filter(student => 
    student.days.includes(day) && student.time.startsWith(timeSlot)
  );
};

export default function AdminTimetablePage() {
  return (
    <div className="p-6 space-y-6 pt-16 lg:pt-2">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">
            학원 시간표
          </h1>
        </div>
        {/* 강사별 범례 */}
        <div className="flex items-center gap-4">
          {Object.entries(teacherColors).map(([teacher, colorClass]) => {
            // 해당 강사의 학생 수와 수업 시간 계산 (하루 = 0.5)
            const teacherStudents = sampleStudents.filter(student => student.teacher === teacher);
            const studentCount = teacherStudents.length;
            const totalSessions = teacherStudents.reduce((total, student) => {
              return total + (student.days.length * 0.5);
            }, 0);
            return (
              <div key={teacher} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${colorClass}`}></div>
                <span className="text-cyan-200 text-xs">{teacher}</span>
                <span className="text-cyan-400 text-xs">({studentCount}명/{totalSessions})</span>
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
                      const students = getStudentsForTimeSlot(day, timeSlot);
                      return (
                        <td key={`${day}-${timeSlot}`} className="p-2 border border-cyan-900/40 min-h-[80px]">
                                                     {students.length > 0 ? (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 w-full">
                               {students.map((student) => (
                                 <div
                                   key={student.id}
                                   className={`rounded text-white text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer text-center min-w-0 w-full truncate ${teacherColors[student.teacher as keyof typeof teacherColors]}`}
                                 >
                                   {student.name}
                                 </div>
                               ))}
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