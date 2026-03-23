import React from 'react';
import { Student, STATUS_CONFIG } from '../types';
import { timeToIndex } from './utils';

interface ScheduleRowProps {
    student: Student;
    rowIdx: number;
    isMobile?: boolean;
}

export const ScheduleRow = React.memo(({ student, rowIdx, isMobile = false }: ScheduleRowProps) => {
    // 공통 배지 스타일 로직
    const getBadgeStyle = () => {
        const isMakeupRow = student.id.includes('-makeup-');
        const status = student.attendanceTime.status;
        
        if (isMakeupRow) {
            if (status === 'unregistered') {
                return 'bg-transparent border-yellow-500/50 text-yellow-500/70';
            }
            if (status === 'present') {
                return 'bg-yellow-500 border-yellow-400 text-black';
            }
            if (status === 'absent') {
                return 'bg-red-500/20 border-red-500 text-red-500';
            }
        }
        return STATUS_CONFIG[status].color;
    };

    if (isMobile) {
        return (
            <div className={`flex items-center px-4 h-12 border-b border-cyan-500/20 ${rowIdx % 2 === 0 ? 'bg-cyan-900/10' : ''}`}>
                <div className="w-24 text-cyan-100 text-sm font-medium truncate pr-3">
                    {student.name}
                </div>
                <div className="flex-1">
                    <div className={`w-full py-1.5 rounded border-2 flex items-center justify-center transition-colors duration-300 ${getBadgeStyle()}`}>
                        <span className="text-xs sm:text-sm font-bold tracking-wider">
                            {student.attendanceTime.start} ~ {student.attendanceTime.end}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <div
                className="flex items-center justify-center px-2 h-8 border-b border-cyan-500/20 text-cyan-100 text-sm font-medium text-center min-w-0 overflow-hidden whitespace-nowrap text-ellipsis"
                style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
                {student.name}
            </div>
            {Array.from({ length: 32 }).map((_, colIdx) => {
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
                            <div className={`w-full h-6 rounded border-2 flex items-center justify-center transition-colors duration-300 
                                ${getBadgeStyle()}
                            `}>
                                <span className="text-[8px] sm:text-[10px] md:text-xs opacity-80 leading-tight w-full text-center select-none truncate px-1 font-bold">
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
                            borderLeft: colIdx % 4 === 0 ? '1px dashed #67e8f9' : undefined,
                        }}
                    />
                );
            })}
        </React.Fragment>
    );
});

ScheduleRow.displayName = 'ScheduleRow';
