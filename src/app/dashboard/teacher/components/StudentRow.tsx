import React from 'react';
import { Student, AttendanceStatus, STATUS_CONFIG } from './types';
import { AttendanceCalendarModal } from "./AttendanceCalendarModal";
import { Button } from "@/components/ui/button";
import { Calendar, FileEdit } from "lucide-react";

interface StudentRowProps {
    student: Student;
    idx: number;
    onAttendanceChange: (id: string, value: AttendanceStatus) => void;
    teacherId?: string | null;
}

export const StudentRow = React.memo(({
    student,
    idx,
    onAttendanceChange,
    teacherId
}: StudentRowProps) => {
    return (
        <tr className={`${idx % 2 === 0 ? 'bg-cyan-900/10' : ''} border-b border-cyan-500/10`}>
            <td className="px-2 py-3 text-center font-medium">{student.name}</td>
            <td className="px-2 py-3 text-center">{student.day}</td>
            <td className="px-2 py-3 text-center">{student.course}</td>
            <td className="px-2 py-3 text-center hidden sm:table-cell opacity-70">{student.curriculum}</td>
            <td className="px-2 py-3 text-center">
                <button
                    className={`w-20 py-1.5 rounded-md border text-xs font-bold transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 ${STATUS_CONFIG[student.attendanceTime.status].fullClass}`}
                    onClick={() => {
                        const statusCycle: AttendanceStatus[] = ['unregistered', 'present', 'absent', 'makeup'];
                        const currentIndex = statusCycle.indexOf(student.attendanceTime.status);
                        const nextIndex = (currentIndex + 1) % statusCycle.length;
                        onAttendanceChange(student.id, statusCycle[nextIndex]);
                    }}
                >
                    {STATUS_CONFIG[student.attendanceTime.status].text}
                </button>
            </td>
            <td className="px-2 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                    <AttendanceCalendarModal
                        studentId={student.userId}
                        studentName={student.name}
                        teacherId={teacherId}
                        mode="calendar"
                        customTrigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10" title="전체 캘린더">
                                <Calendar className="h-4 w-4" />
                            </Button>
                        }
                    />
                    <AttendanceCalendarModal
                        studentId={student.userId}
                        studentName={student.name}
                        teacherId={teacherId}
                        mode="detail"
                        customTrigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-400 hover:bg-yellow-500/10" title="오늘 기록 상세">
                                <FileEdit className="h-4 w-4" />
                            </Button>
                        }
                    />
                </div>
            </td>
        </tr>
    );
});

StudentRow.displayName = 'StudentRow';
