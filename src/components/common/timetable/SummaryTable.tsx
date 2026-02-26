import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getTeacherColorSet } from '@/lib/colors';
import { getStudentRegistrationUnit } from '@/lib/timetable-utils';
import { TimetableStudent } from '@/hooks/use-timetable';

interface SummaryTableProps {
    students: TimetableStudent[];
    teacherNames: Record<string, { name: string, color: string }>;
    hoveredStudentId: string | null;
    onHover: (id: string | null) => void;
    threshold: number;
}

export function SummaryTable({
    students,
    teacherNames,
    hoveredStudentId,
    onHover,
    threshold
}: SummaryTableProps) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const activeTeacherIds = Array.from(new Set(students.flatMap(s => s.assignedTeachers)));

    const teachers = Object.entries(teacherNames)
        .filter(([id]) => activeTeacherIds.includes(id));

    return (
        <div className="space-y-4 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-cyan-100 italic flex items-center gap-2">
                    <span className="w-1 h-6 bg-cyan-400 rounded-full"></span>
                    상세 요약 표
                </h2>
            </div>

            <div className="overflow-x-auto rounded-lg border border-cyan-900/40 shadow-inner">
                <table className="w-full border-collapse bg-[#0a1837]/50 backdrop-blur-md">
                    <thead>
                        <tr className="bg-cyan-950/80">
                            <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-20 text-xs">강사</th>
                            <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-28 text-xs">분원</th>
                            <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 text-xs text-left px-4">학생 명단</th>
                            <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-16 text-xs">인원</th>
                            <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-16 text-xs">단위계</th>
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

                            const totalInwon = teacherStudentsWithUnit.length;
                            const totalUnitCount = teacherStudentsWithUnit.reduce((acc, s) => acc + s.unit, 0);
                            const academies = Array.from(new Set(teacherStudentsWithUnit.map(s => s.academy)));
                            const colorSet = getTeacherColorSet(teacherData.color);

                            return (
                                <tr key={teacherId} className="hover:bg-cyan-950/30 transition-all duration-300">
                                    <td className="p-2 px-3 text-center border border-cyan-900/40 align-middle">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <div
                                                className={`w-3 h-3 rounded-full ${colorSet.bg} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
                                                style={colorSet.style}
                                            ></div>
                                            <span className="text-cyan-100 text-[13px] font-bold">{teacherData.name || teacherId}</span>
                                        </div>
                                    </td>
                                    <td className="p-2 px-3 text-center border border-cyan-900/40 text-cyan-300">
                                        <div className="flex flex-col gap-1 items-center">
                                            {academies.map(acc => (
                                                <Badge key={acc} variant="outline" className="text-[11px] py-0.5 px-2 border-cyan-800/40 text-cyan-400 backdrop-blur-sm">
                                                    {acc}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 px-4 border border-cyan-900/40">
                                        <div className="space-y-4">
                                            {/* 1.0단위 학생들 */}
                                            {teacherStudentsWithUnit.filter(s => s.unit === 1.0).length > 0 && (
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {teacherStudentsWithUnit.filter(s => s.unit === 1.0).map((student) => {
                                                        const isHovered = hoveredStudentId === student.id;
                                                        const enrollmentDate = student.enrollmentDate ? new Date(student.enrollmentDate) : null;
                                                        const isNewStudent = enrollmentDate &&
                                                            enrollmentDate.getFullYear() === currentYear &&
                                                            (enrollmentDate.getMonth() + 1) === currentMonth;

                                                        return (
                                                            <div
                                                                key={student.id}
                                                                onMouseEnter={() => onHover(student.id)}
                                                                onMouseLeave={() => onHover(null)}
                                                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all duration-200 cursor-pointer border
                                  ${isNewStudent
                                                                        ? 'text-cyan-100 bg-amber-500/20 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                                                        : 'text-cyan-200 bg-cyan-900/40 border-cyan-800/50 hover:bg-cyan-800/60'}
                                  ${isHovered ? 'border-cyan-200 ring-2 ring-cyan-400 z-10 scale-105' : ''}
                                `}
                                                                title={isNewStudent ? `신규 등록 학생: ${student.enrollmentDate}` : undefined}
                                                            >
                                                                {student.name}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* 1.0단위가 아닌 학생들 */}
                                            {teacherStudentsWithUnit.filter(s => s.unit !== 1.0).length > 0 && (
                                                <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-cyan-500/10">
                                                    {teacherStudentsWithUnit.filter(s => s.unit !== 1.0).map((student) => {
                                                        const isHovered = hoveredStudentId === student.id;
                                                        const enrollmentDate = student.enrollmentDate ? new Date(student.enrollmentDate) : null;
                                                        const isNewStudent = enrollmentDate &&
                                                            enrollmentDate.getFullYear() === currentYear &&
                                                            (enrollmentDate.getMonth() + 1) === currentMonth;

                                                        return (
                                                            <div
                                                                key={student.id}
                                                                onMouseEnter={() => onHover(student.id)}
                                                                onMouseLeave={() => onHover(null)}
                                                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all duration-200 cursor-pointer border
                                  ${isNewStudent
                                                                        ? 'text-cyan-100 bg-amber-500/20 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                                                        : 'text-cyan-200 bg-cyan-900/40 border-cyan-800/50 hover:bg-cyan-800/60'}
                                  ${isHovered ? 'border-cyan-200 ring-2 ring-cyan-400 z-10 scale-105' : ''}
                                `}
                                                                title={isNewStudent ? `신규 등록 학생: ${student.enrollmentDate}` : undefined}
                                                            >
                                                                {student.name}<span className="ml-1 text-[10px] font-black text-cyan-400 opacity-80">({student.unit})</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-2 text-center border border-cyan-900/40 text-cyan-100 font-bold text-xs">
                                        {totalInwon}
                                    </td>
                                    <td className="p-2 text-center border border-cyan-900/40 text-cyan-300 font-black text-xs">
                                        {totalUnitCount.toFixed(1)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
