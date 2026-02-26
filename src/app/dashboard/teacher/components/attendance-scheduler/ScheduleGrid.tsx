import React from 'react';
import { Student } from '../types';
import { TIME_SLOTS } from './utils';
import { ScheduleRow } from './ScheduleRow';

interface ScheduleGridProps {
    students: Student[];
    isLoading: boolean;
}

export const ScheduleGrid = ({ students, isLoading }: ScheduleGridProps) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-cyan-200 animate-pulse">학생 데이터를 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <div
                className="w-full"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `minmax(72px, max-content) repeat(16, 1fr)`
                }}
            >
                {/* 헤더 */}
                <div className="bg-transparent border-b border-cyan-500/30 flex items-center justify-center px-2 h-8 font-medium text-cyan-200 text-sm text-center">
                    학생
                </div>
                {TIME_SLOTS.slice(0, -1).map((time, idx) => (
                    <div
                        key={time}
                        className="relative border-b border-cyan-500/30 flex items-center justify-center h-8 text-cyan-200 text-xs font-medium"
                        style={{
                            borderLeft: idx % 2 === 0 ? '1px dashed #67e8f9' : undefined,
                            background: 'rgba(8,40,80,0.10)'
                        }}
                    >
                        {idx % 2 === 0 ? time : ''}
                    </div>
                ))}

                {/* 학생별 행 */}
                {students.map((student, rowIdx) => (
                    <ScheduleRow key={student.id} student={student} rowIdx={rowIdx} />
                ))}
            </div>
        </div>
    );
};
