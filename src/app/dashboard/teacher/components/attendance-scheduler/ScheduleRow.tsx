import React from 'react';
import { Student, STATUS_CONFIG } from '../types';
import { timeToIndex } from './utils';

interface ScheduleRowProps {
    student: Student;
    rowIdx: number;
}

export const ScheduleRow = React.memo(({ student, rowIdx }: ScheduleRowProps) => {
    return (
        <React.Fragment>
            <div
                className="flex items-center justify-center px-2 h-8 border-b border-cyan-500/20 text-cyan-100 text-sm font-medium text-center min-w-0 overflow-hidden whitespace-nowrap text-ellipsis"
                style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
                {student.name}
            </div>
            {Array.from({ length: 16 }).map((_, colIdx) => {
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
                            <div className={`w-full h-6 rounded border-2 ${STATUS_CONFIG[student.attendanceTime.status].color} flex items-center justify-center transition-colors duration-300`}>
                                <span className="text-[8px] sm:text-[10px] md:text-xs opacity-80 leading-tight w-full text-center select-none truncate px-1">
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
                            borderLeft: colIdx % 2 === 0 ? '1px dashed #67e8f9' : undefined,
                        }}
                    />
                );
            })}
        </React.Fragment>
    );
});

ScheduleRow.displayName = 'ScheduleRow';
