'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/lib/supabase";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getContent, updateContent } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import { Save, Loader2, Settings } from "lucide-react";
import { getTeacherColorSet } from '@/lib/colors';

import {
  getStudentRegistrationUnit
} from '@/lib/timetable-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// 학생 타입 정의
interface Student {
  id: string;
  name: string;
  teacher: string;
  teacherId: string;
  assignedTeachers: string[];
  academy: string;
  enrollmentDate?: string;
  schedule: {
    [key: string]: {
      startTime: string;
      endTime: string;
      teacherId?: string;
    };
  };
}


const academyBorderColors: Record<string, string> = {
  'coding-maker': 'border-l-4 border-l-cyan-400',
  'gwangyang-coding': 'border-l-4 border-l-orange-400',
  '코딩메이커': 'border-l-4 border-l-cyan-400',
  '광양코딩': 'border-l-4 border-l-orange-400',
};

const timeSlots = [
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00'
];

const days = ['월', '화', '수', '목', '금', '토', '일'];

const dayToNumber: { [key: string]: number } = {
  '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0
};

const normalizeTimeToHour = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number);
  return `${hour.toString().padStart(2, '0')}:00`;
};

/**
 * 하단 요약 표 컴포넌트
 */
function SummaryTable({
  students,
  teacherNames,
  hoveredStudentId,
  onHover,
  threshold
}: {
  students: Student[],
  teacherNames: Record<string, { name: string, color: string }>,
  hoveredStudentId: string | null,
  onHover: (id: string | null) => void,
  threshold: number
}) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const activeTeacherIds = Array.from(new Set(students.flatMap(s => s.assignedTeachers)));

  const teachers = Object.entries(teacherNames)
    .filter(([id]) => (selectedTeacherId === 'all' || id === selectedTeacherId) && activeTeacherIds.includes(id));

  return (
    <div className="space-y-4 pt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-cyan-100 italic">상세 요약 표</h2>
        <div className="w-48">
          <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
            <SelectTrigger className="bg-[#0a1837] border-cyan-900/40 text-cyan-100">
              <SelectValue placeholder="강사 선택" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1837] border-cyan-900/40 text-cyan-100">
              <SelectItem value="all">전체 강사</SelectItem>
              {Object.entries(teacherNames)
                .filter(([id]) => activeTeacherIds.includes(id))
                .map(([id, data]) => (
                  <SelectItem key={id} value={id}>
                    <span
                      className={`${getTeacherColorSet(data.color).text} font-medium`}
                      style={getTeacherColorSet(data.color).style}
                    >
                      {data.name}
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-cyan-900/40">
        <table className="w-full border-collapse bg-[#0a1837]">
          <thead>
            <tr className="bg-cyan-900/30">
              <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-24 text-xs">강사</th>
              <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-32 text-xs">분원</th>
              <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 text-xs">학생 명단</th>
              <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-20 text-xs">인원</th>
              <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-20 text-xs">단위계</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(([teacherId, teacherData]) => {
              const teacherStudentsWithUnit = students
                .filter(s => s.assignedTeachers.includes(teacherId))
                .map(s => ({
                  ...s,
                  unit: getStudentRegistrationUnit(currentYear, currentMonth, s.schedule, teacherId, s.teacherId, s.enrollmentDate, threshold)
                }));

              if (teacherStudentsWithUnit.length === 0) return null;

              // 분원 및 단위별 그룹화
              const groupings: { academy: string; unit: number; students: Student[] }[] = [];
              const academies = Array.from(new Set(teacherStudentsWithUnit.map(s => s.academy)));

              academies.forEach(academy => {
                const academyStudents = teacherStudentsWithUnit.filter(s => s.academy === academy);
                const units = Array.from(new Set(academyStudents.map(s => s.unit))).sort((a, b) => b - a);

                units.forEach(unit => {
                  groupings.push({
                    academy,
                    unit,
                    students: academyStudents.filter(s => s.unit === unit)
                  });
                });
              });

              const colorSet = getTeacherColorSet(teacherData.color);

              return (
                <React.Fragment key={teacherId}>
                  {groupings.map((group, idx) => {
                    const totalUnits = group.students.length * group.unit;

                    // 강사 rowSpan: 해당 강사의 첫 번째 행에서만 렌더링
                    const isFirstTeacherRow = idx === 0;

                    // 분원 rowSpan: 해당 강사 내에서 해당 분원의 첫 번째 행에서만 렌더링
                    const isFirstAcademyRow = groupings.findIndex(g => g.academy === group.academy) === idx;
                    const academyRowSpan = groupings.filter(g => g.academy === group.academy).length;

                    return (
                      <tr key={`${teacherId}-${group.academy}-${group.unit}`} className="hover:bg-cyan-900/10 transition-colors">
                        {isFirstTeacherRow && (
                          <td rowSpan={groupings.length} className="p-1 px-3 text-center border border-cyan-900/40 align-middle">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <div
                                className={`w-3 h-3 rounded ${colorSet.bg}`}
                                style={colorSet.style}
                              ></div>
                              <span className="text-cyan-100 text-[11px] font-medium">{teacherNames[teacherId]?.name || teacherId}</span>
                            </div>
                          </td>
                        )}
                        {isFirstAcademyRow && (
                          <td rowSpan={academyRowSpan} className="p-1 px-3 text-center border border-cyan-900/40 text-cyan-300 text-[11px]">
                            {group.academy}
                          </td>
                        )}
                        <td className="p-1 px-2 border border-cyan-900/40">
                          <div className="flex flex-wrap gap-1">
                            {group.students.map((student) => {
                              const isHovered = hoveredStudentId === student.id;
                              return (
                                <div
                                  key={student.id}
                                  onMouseEnter={() => onHover(student.id)}
                                  onMouseLeave={() => onHover(null)}
                                  className={`px-1.5 py-0.5 rounded text-[11px] transition-all duration-200 cursor-pointer border
                                    ${isHovered
                                      ? 'bg-cyan-400 text-[#0a1837] border-cyan-300 shadow-[0_0_8px_#22d3ee] scale-105 z-10'
                                      : 'text-cyan-200 bg-cyan-900/20 border-cyan-800/40 hover:bg-cyan-800/40'}
                                  `}
                                >
                                  {student.name}{group.unit !== 1.0 && <span className="ml-0.5 text-[9px] opacity-70">({group.unit})</span>}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-1 text-center border border-cyan-900/40 text-cyan-100 font-bold text-xs">
                          {group.students.length}
                        </td>
                        <td className="p-1 text-center border border-cyan-900/40 text-cyan-400 font-bold text-xs">
                          {totalUnits.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const getStudentsForTimeSlot = (students: Student[], day: string, timeSlot: string) => {
  const dayNumber = dayToNumber[day];

  return students
    .filter(student => {
      const schedule = student.schedule;
      const timeData = schedule[dayNumber] || schedule[dayNumber.toString()];
      if (!timeData) return false;

      return normalizeTimeToHour(timeData.startTime) === timeSlot;
    })
    .map(student => {
      const schedule = student.schedule;
      const timeData = schedule[dayNumber] || schedule[dayNumber.toString()];
      // 만약 해당 타임슬롯에 별도의 teacherId가 지정되어 있다면 그것을 사용, 
      // 없으면 학생의 대표 teacherId 사용
      return {
        ...student,
        teacherId: timeData.teacherId || student.teacherId
      };
    });
};

interface TimetableProps {
  title?: string;
  className?: string;
}

export function Timetable({ title = "학원 시간표", className = "" }: TimetableProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherNames, setTeacherNames] = useState<Record<string, { name: string, color: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);

  // 기준 횟수 설정 관련 상태
  const [unitThreshold, setUnitThreshold] = useState('8');
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);

      // 학생 및 강사 정보 가져오기
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          user_id,
          assigned_teachers,
          attendance_schedule,
          enrollment_start_date,
          users!students_user_id_fkey(name, academy)
        `);

      if (studentsError) throw studentsError;

      const teacherIds = new Set<string>();
      (studentsData || []).forEach((student: any) => {
        if (student.assigned_teachers && Array.isArray(student.assigned_teachers)) {
          student.assigned_teachers.forEach((id: string) => teacherIds.add(id));
        }
      });

      const { data: teachersData, error: teachersError } = await supabase
        .from('users')
        .select(`
          id, 
          name,
          teachers(label_color)
        `)
        .in('id', Array.from(teacherIds));

      if (teachersError) throw teachersError;

      const teacherMap = new Map();
      (teachersData || []).forEach((t: any) => {
        const detail = Array.isArray(t.teachers) ? t.teachers[0] : t.teachers;
        teacherMap.set(t.id, {
          name: t.name,
          color: detail?.label_color || '#00fff7'
        });
      });

      const convertedStudents = (studentsData || []).map((student: any) => {
        const assignedTeachers = student.assigned_teachers || [];
        const tId = assignedTeachers[0] || '';
        const tData = teacherMap.get(tId);
        const tName = tData?.name || '미배정';

        return {
          id: student.user_id,
          name: student.users?.name || '알 수 없음',
          teacher: tName,
          teacherId: tId,
          assignedTeachers: assignedTeachers,
          academy: student.users?.academy || '미지정',
          enrollmentDate: student.enrollment_start_date,
          schedule: student.attendance_schedule || {}
        };
      });

      setStudents(convertedStudents);
      setTeacherNames(Object.fromEntries(teacherMap.entries()));

      // 설정 정보(unit_threshold) 및 권한 확인
      const { data: contentResult } = await getContent();
      if (contentResult?.unit_threshold) {
        setUnitThreshold(contentResult.unit_threshold.toString());
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin(profile?.role === 'admin');
      }

    } catch (error) {
      console.error('데이터 가져오기 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSaveThreshold = async () => {
    try {
      setIsSavingThreshold(true);
      const formData = new FormData();
      formData.set('unit_threshold', unitThreshold);

      const result = await updateContent(formData);
      if (result.success) {
        toast({ title: "설정 저장 완료", description: `수강 단위 기준이 ${unitThreshold}회로 변경되었습니다.` });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: "저장 실패", description: error.message || "오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsSavingThreshold(false);
    }
  };

  const teacherStudentCount = students.reduce((acc, student) => {
    const id = student.teacherId || 'unassigned';
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className={`p-6 pt-20 lg:pt-6 flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <div className="text-cyan-200">시간표 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 pt-20 lg:pt-6 space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_6px_#00fff7]">
            {title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-2 bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/30">
              <Settings className="w-4 h-4 text-cyan-400" />
              <Label className="text-xs text-cyan-200 whitespace-nowrap">단위 기준:</Label>
              <Input
                type="number"
                value={unitThreshold}
                onChange={(e) => setUnitThreshold(e.target.value)}
                className="w-16 h-8 bg-[#0a1837] border-cyan-900/40 text-cyan-100 text-xs text-center"
              />
              <Button
                onClick={handleSaveThreshold}
                disabled={isSavingThreshold}
                size="sm"
                className="h-8 bg-cyan-600 hover:bg-cyan-500"
              >
                {isSavingThreshold ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {Object.entries(teacherStudentCount).map(([id, count]) => {
              const teacherInfo = teacherNames[id];
              const name = teacherInfo?.name || (id === 'unassigned' ? '미배정' : id);
              const colorSet = getTeacherColorSet(teacherInfo?.color || id);
              return (
                <div key={id} className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${colorSet.bg}`}
                    style={colorSet.style}
                  ></div>
                  <span className="text-cyan-200 text-[10px]">{name}</span>
                  <span className="text-cyan-400 text-[10px]">({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-[#0a1837] to-[#0a1a2f] border-cyan-900/40 overflow-hidden shadow-2xl shadow-cyan-900/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-cyan-950/50">
                  <th className="w-24 p-3 text-cyan-100 font-semibold border border-cyan-900/40 text-sm">시간</th>
                  {days.map((day) => (
                    <th key={day} className="w-32 p-3 text-cyan-100 font-semibold border border-cyan-900/40 text-sm">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="group transition-colors">
                    <td className="p-3 text-cyan-200 font-medium border border-cyan-900/40 text-center text-xs bg-cyan-950/20">
                      {timeSlot}
                    </td>
                    {days.map((day) => {
                      const studentsInSlot = getStudentsForTimeSlot(students, day, timeSlot);
                      return (
                        <td key={`${day}-${timeSlot}`} className="p-1 border border-cyan-900/40 min-h-[140px] align-top group-hover:bg-cyan-900/5 transition-colors">
                          {studentsInSlot.length > 0 ? (
                            <div className="flex flex-row flex-wrap gap-0.5 w-full">
                              {studentsInSlot.map((student) => {
                                const teacherInfo = teacherNames[student.teacherId];
                                const colorSet = getTeacherColorSet(teacherInfo?.color || student.teacherId);
                                const hovered = hoveredStudentId === student.id;

                                return (
                                  <div
                                    key={student.id}
                                    onMouseEnter={() => setHoveredStudentId(student.id)}
                                    onMouseLeave={() => setHoveredStudentId(null)}
                                    className={`rounded-[2px] px-1 py-[0.5px] text-white text-[9px] font-bold 
                                      hover:opacity-80 transition-all duration-200 cursor-pointer text-center whitespace-nowrap
                                      ${hovered ? 'shadow-[0_0_8px_rgba(34,211,238,0.5)] z-10 brightness-125 scale-110' : ''}
                                    `}
                                    style={{
                                      backgroundColor: teacherInfo?.color || '#00fff7',
                                      ...colorSet.style,
                                      color: 'white',
                                      textShadow: '0px 0px 2px rgba(0,0,0,0.9), 0px 0px 1px rgba(0,0,0,1)'
                                    }}
                                    title={`${student.name} - ${student.teacher} (${student.academy})`}
                                  >
                                    {student.name}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-cyan-900/30 text-[10px] text-center py-4">-</div>
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
