'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from "lucide-react";
import { useTimetable } from '@/hooks/use-timetable';
import { SummaryTable } from './timetable/SummaryTable';
import { StudentTag } from './timetable/StudentTag';
import { days, timeSlots, getStudentsForTimeSlot } from './timetable/utils';
import { getAcademyColor } from '@/lib/timetable-utils';

interface TimetableProps {
  title?: string;
  className?: string;
}

export function Timetable({ title = "학원 시간표", className = "" }: TimetableProps) {
  const {
    students,
    teacherNames,
    isLoading,
    hoveredStudentId,
    setHoveredStudentId,
    unitThreshold
  } = useTimetable();

  const [hoveredAcademy, setHoveredAcademy] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className={`p-6 pt-20 lg:pt-6 flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <div className="text-cyan-200 font-bold animate-pulse">시간표 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 고유 학원 목록 추출
  const academies = Array.from(new Set(students.map(s => s.academy))).filter(Boolean);

  return (
    <div className={`p-6 pt-20 lg:pt-6 space-y-8 animate-in fade-in duration-700 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-6 w-full">
          <h1 className="text-3xl font-black text-cyan-100 drop-shadow-[0_0_12px_rgba(0,255,247,0.5)] italic tracking-tighter shrink-0">
            {title}
          </h1>

          {/* 학원 범례 (Legend) */}
          <div className="flex flex-wrap items-center gap-3 bg-cyan-950/30 px-4 py-2 rounded-full border border-cyan-800/30 backdrop-blur-sm self-start md:self-auto">
            {academies.map((academy) => (
              <div
                key={academy}
                onMouseEnter={() => setHoveredAcademy(academy)}
                onMouseLeave={() => setHoveredAcademy(null)}
                className={`flex items-center gap-2 px-2 py-0.5 rounded-md cursor-help transition-all duration-300
                  ${hoveredAcademy === academy ? 'bg-cyan-800/40 scale-105' : 'opacity-80 hover:opacity-100'}
                `}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                  style={{ backgroundColor: getAcademyColor(academy) }}
                ></div>
                <span className="text-sm font-bold text-cyan-100">{academy}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-[#0a1837]/80 to-[#0a1a2f]/80 border-cyan-900/40 overflow-hidden shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cyan-950/60 transition-colors">
                  <th className="w-24 p-4 text-cyan-100 font-bold border border-cyan-900/30 text-sm uppercase tracking-widest">TIME</th>
                  {days.map((day) => (
                    <th key={day} className="w-32 p-4 text-cyan-100 font-bold border border-cyan-900/30 text-sm">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="group hover:bg-cyan-500/5 transition-all duration-300">
                    <td className="p-4 text-cyan-200 font-black border border-cyan-900/30 text-center text-[13px] bg-cyan-950/40">
                      {timeSlot}
                    </td>
                    {days.map((day) => {
                      const studentsInSlot = getStudentsForTimeSlot(students, day, timeSlot);
                      return (
                        <td key={`${day}-${timeSlot}`} className="p-1.5 border border-cyan-900/20 min-h-[140px] align-top transition-colors">
                          {studentsInSlot.length > 0 ? (
                            <div className="flex flex-row flex-wrap gap-1 w-full p-1">
                              {studentsInSlot.map((student) => (
                                <StudentTag
                                  key={student.id}
                                  student={student}
                                  teacherColor={teacherNames[student.teacherId]?.color || '#00fff7'}
                                  isHovered={hoveredStudentId === student.id}
                                  hoveredAcademy={hoveredAcademy}
                                  onMouseEnter={() => setHoveredStudentId(student.id)}
                                  onMouseLeave={() => setHoveredStudentId(null)}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-cyan-900/10 text-[10px] text-center py-6 select-none opacity-20">-</div>
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

      <SummaryTable
        students={students}
        teacherNames={teacherNames}
        hoveredStudentId={hoveredStudentId}
        onHover={setHoveredStudentId}
        threshold={parseInt(unitThreshold) || 8}
      />
    </div>
  );
}
