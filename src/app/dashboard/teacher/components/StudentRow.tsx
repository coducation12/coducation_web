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
    onProgressClick: (userId: string, userName: string) => void;
    onRefresh?: () => void;
    refreshTrigger?: number;
    updatingIds: Set<string>;
}

export const StudentRow = React.memo(({
    student,
    idx,
    onAttendanceChange,
    teacherId,
    onStudentClick,
    onProgressClick,
    onRefresh,
    refreshTrigger = 0,
    updatingIds
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
            <td className="px-2 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                    {student.sessions.map((session) => {
                        const isUpdating = updatingIds.has(session.id);
                        return (
                            <button
                                key={session.id}
                                disabled={isUpdating}
                                className={`w-20 py-1.5 rounded-md border text-[10px] font-bold transition-all duration-200 shadow-sm 
                                    ${isUpdating ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'}
                                    ${(() => {
                                        const status = session.attendanceTime.status;
                                        
                                        if (session.isMakeup) {
                                            if (status === 'unregistered') {
                                                return 'bg-transparent border-yellow-500/50 text-yellow-500/70 hover:border-yellow-500 hover:bg-yellow-500/10';
                                            }
                                            if (status === 'present') {
                                                return 'bg-green-600 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]';
                                            }
                                            if (status === 'absent') {
                                                return 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]';
                                            }
                                        }
                                        return STATUS_CONFIG[status].fullClass;
                                    })()}
                                `}
                                onClick={() => {
                                    const statusCycle: AttendanceStatus[] = ['unregistered', 'present', 'absent'];
                                    const currentIndex = statusCycle.indexOf(session.attendanceTime.status);
                                    const nextIndex = (currentIndex + 1) % statusCycle.length;
                                    onAttendanceChange(session.id, statusCycle[nextIndex]);
                                }}
                                title={`${session.isMakeup ? '[보강] ' : ''}${session.attendanceTime.start}~${session.attendanceTime.end}`}
                            >
                                <div className="flex flex-col leading-tight">
                                    <span>{isUpdating ? '처리중...' : (session.isMakeup ? '보강' : STATUS_CONFIG[session.attendanceTime.status].text)}</span>
                                    <span className="text-[8px] opacity-70 font-normal">{session.attendanceTime.start}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </td>
            <td className="px-2 py-3 text-center">
                <AttendanceCalendarModal
                    studentId={student.userId}
                    studentName={student.name}
                    teacherId={teacherId}
                    onRefresh={onRefresh}
                    mode="detail"
                    initialStatus={student.sessions[0]?.attendanceTime.status}
                    isMakeup={student.sessions[0]?.isMakeup}
                    refreshTrigger={refreshTrigger}
                    customTrigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-400 hover:bg-yellow-500/10" title="출결 기록 상세">
                            <FileEdit className="h-4 w-4" />
                        </Button>
                    }
                />
            </td>
            <td className="px-2 py-3 text-center">
                <AttendanceCalendarModal
                    studentId={student.userId}
                    studentName={student.name}
                    teacherId={teacherId}
                    onRefresh={onRefresh}
                    mode="calendar"
                    refreshTrigger={refreshTrigger}
                    customTrigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10" title="전체 캘린더">
                            <Calendar className="h-4 w-4" />
                        </Button>
                    }
                />
            </td>
            <td className="px-2 py-3 text-center">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10"
                    onClick={() => onProgressClick(student.userId, student.name)}
                    title="진도/성과 기록"
                >
                    <LineChart className="h-4 w-4" />
                </Button>
            </td>
        </tr>
    );
});


StudentRow.displayName = 'StudentRow';
