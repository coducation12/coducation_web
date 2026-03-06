import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getTeacherColorSet } from '@/lib/colors';
import { getStudentRegistrationUnit, getAcademyColor } from '@/lib/timetable-utils';
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
                    상세 요약표
                </h2>
            </div>

            <div className="overflow-x-auto rounded-lg border border-cyan-900/40 shadow-inner">
                <table className="w-full border-collapse bg-[#0a1837]/50 backdrop-blur-md">
                    <thead>
                        <tr className="bg-cyan-950/80">
                            <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-20 text-sm">강사</th>
                            <th className="hidden md:table-cell p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-28 text-sm">분원</th>
                            <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 text-sm text-left px-4">학생 명단</th>
                            <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-16 text-sm">인원</th>
                            <th className="p-1.5 text-cyan-100 font-semibold border border-cyan-900/40 w-16 text-sm">단위계</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map(([teacherId, teacherData]) => {
                            const teacherStudentsWithUnit = students
                                .filter(s => s.assignedTeachers.includes(teacherId))
                                .map(s => ({
                                    ...s,
                                    unit: getStudentRegistrationUnit(currentYear, currentMonth, s.schedule, teacherId, s.teacherId, s.enrollmentDate)
                                }))
                                .sort((a, b) => {
                                    const academyOrder: Record<string, number> = { '코딩메이커': 1, '광양코딩': 2 };
                                    const orderA = academyOrder[a.academy] || 99;
                                    const orderB = academyOrder[b.academy] || 99;
                                    if (orderA !== orderB) return orderA - orderB;
                                    return a.name.localeCompare(b.name);
                                });

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
                                            <span className="text-cyan-100 text-[14px] font-bold">{teacherData.name || teacherId}</span>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell p-2 px-3 text-center border border-cyan-900/40 text-cyan-300">
                                        <div className="flex flex-col gap-1 items-center">
                                            {academies.map(acc => (
                                                <Badge key={acc} variant="outline" className="text-[12px] py-0.5 px-2 border-cyan-800/40 text-cyan-400 backdrop-blur-sm">
                                                    {acc}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-2 px-4 border border-cyan-900/40">
                                        <div className="space-y-2">
                                            {/* 1.0단위 학생들 */}
                                            {teacherStudentsWithUnit.filter(s => s.unit === 1.0).length > 0 && (
                                                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1 sm:gap-2 items-center">
                                                    {teacherStudentsWithUnit.filter(s => s.unit === 1.0).map((student) => {
                                                        const isHovered = hoveredStudentId === student.id;
                                                        const enrollmentDate = student.enrollmentDate ? new Date(student.enrollmentDate) : null;
                                                        const isNewStudent = enrollmentDate &&
                                                            enrollmentDate.getFullYear() === currentYear &&
                                                            (enrollmentDate.getMonth() + 1) === currentMonth;
                                                        const academyColor = getAcademyColor(student.academy);

                                                        return (
                                                            <div
                                                                key={student.id}
                                                                onMouseEnter={() => onHover(student.id)}
                                                                onMouseLeave={() => onHover(null)}
                                                                className={`pl-1 pr-1.5 sm:pl-2 sm:pr-2.5 py-[1px] rounded-r-[2px] text-[11px] sm:text-[12px] font-bold transition-all duration-200 cursor-pointer border-l-[3px] sm:border-l-[4px] border-y border-r border-y-transparent border-r-transparent truncate
                                                                    ${isNewStudent
                                                                        ? 'text-amber-100 bg-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                                                                        : 'text-cyan-200 bg-cyan-900/40 hover:bg-cyan-800/60'}
                                                                    ${isHovered ? 'ring-2 ring-cyan-400 z-10 scale-105' : ''}
                                                                `}
                                                                style={{ borderLeftColor: academyColor }}
                                                            >
                                                                {student.name}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* 1.0단위가 아닌 학생들 */}
                                            {teacherStudentsWithUnit.filter(s => s.unit !== 1.0).length > 0 && (
                                                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1 sm:gap-2 items-center pt-1.5 border-t border-cyan-500/10">
                                                    {teacherStudentsWithUnit.filter(s => s.unit !== 1.0).map((student) => {
                                                        const isHovered = hoveredStudentId === student.id;
                                                        const enrollmentDate = student.enrollmentDate ? new Date(student.enrollmentDate) : null;
                                                        const isNewStudent = enrollmentDate &&
                                                            enrollmentDate.getFullYear() === currentYear &&
                                                            (enrollmentDate.getMonth() + 1) === currentMonth;
                                                        const academyColor = getAcademyColor(student.academy);

                                                        return (
                                                            <div
                                                                key={student.id}
                                                                onMouseEnter={() => onHover(student.id)}
                                                                onMouseLeave={() => onHover(null)}
                                                                className={`pl-1 pr-1.5 sm:pl-2 sm:pr-2.5 py-[1px] rounded-r-[2px] text-[11px] sm:text-[12px] font-bold transition-all duration-200 cursor-pointer border-l-[3px] sm:border-l-[4px] border-y border-r border-y-transparent border-r-transparent truncate
                                                                    ${isNewStudent
                                                                        ? 'text-amber-100 bg-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                                                                        : 'text-cyan-200 bg-cyan-900/40 hover:bg-cyan-800/60'}
                                                                    ${isHovered ? 'ring-2 ring-cyan-400 z-10 scale-105' : ''}
                                                                `}
                                                                style={{ borderLeftColor: academyColor }}
                                                            >
                                                                {student.name}<span className="ml-1 text-[10px] font-black text-cyan-400 opacity-80">({student.unit})</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-2 text-center border border-cyan-900/40 text-cyan-100 font-bold text-sm">
                                        {totalInwon}
                                    </td>
                                    <td className="p-2 text-center border border-cyan-900/40 text-cyan-300 font-black text-sm">
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
