import React from 'react';
import { Student, AttendanceStatus, STATUS_CONFIG } from './types';
import { AttendanceCalendarModal } from "./AttendanceCalendarModal";
import { Button } from "@/components/ui/button";
import { Calendar, FileEdit, LineChart } from "lucide-react";

interface StudentRowProps {
    student: Student;
    idx: number;
    onAttendanceChange: (id: string, value: AttendanceStatus) => void;
    teacherId?: string | null;
    onStudentClick: (userId: string) => void;
    onRefresh?: () => void;
}

export const StudentRow = React.memo(({
    student,
    idx,
    onAttendanceChange,
    teacherId,
    onStudentClick,
    onRefresh
}: StudentRowProps) => {
    return (
        <tr className={`${idx % 2 === 0 ? 'bg-cyan-900/10' : ''} border-b border-cyan-500/10`}>
            <td className="px-2 py-3 text-center font-medium">
                <button
                    onClick={() => onStudentClick(student.userId)}
                    className="text-cyan-100 hover:text-cyan-300 hover:underline transition-colors font-bold"
                >
                    {student.name}
                </button>
            </td>
            <td className="px-2 py-3 text-center">{student.day}</td>
            <td className="px-2 py-3 text-center hidden sm:table-cell">{student.course}</td>
            <td className="px-2 py-3 text-center hidden lg:table-cell">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10"
                    onClick={() => onStudentClick(student.userId)} // 일단 모달 열릴 자리
                    title="진도/성과 기록"
                >
                    <LineChart className="h-4 w-4" />
                </Button>
            </td>
            <td className="px-2 py-3 text-center">
                <button
                    className={`w-20 py-1.5 rounded-md border text-xs font-bold transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 
                        ${(() => {
                            const isMakeupRow = student.id.includes('-makeup-');
                            const status = student.attendanceTime.status;
                            
                            if (isMakeupRow) {
                                if (status === 'unregistered') {
                                    return 'bg-transparent border-yellow-500/50 text-yellow-500/70 hover:border-yellow-500 hover:bg-yellow-500/10';
                                }
                                if (status === 'present') {
                                    return 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]';
                                }
                                if (status === 'absent') {
                                    return 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
                                }
                            }
                            return STATUS_CONFIG[status].fullClass;
                        })()}
                    `}
                    onClick={() => {
                        const statusCycle: AttendanceStatus[] = ['unregistered', 'present', 'absent'];
                        const currentIndex = statusCycle.indexOf(student.attendanceTime.status);
                        const nextIndex = (currentIndex + 1) % statusCycle.length;
                        onAttendanceChange(student.id, statusCycle[nextIndex]);
                    }}
                >
                    {student.id.includes('-makeup-') 
                        ? (student.attendanceTime.status === 'present' ? '보강출석' : student.attendanceTime.status === 'absent' ? '보강결석' : '보강대기')
                        : STATUS_CONFIG[student.attendanceTime.status].text}
                </button>
            </td>
            <td className="px-2 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                    <AttendanceCalendarModal
                        studentId={student.userId}
                        studentName={student.name}
                        teacherId={teacherId}
                        onRefresh={onRefresh}
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
                        onRefresh={onRefresh}
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
