import React from 'react';
import { Student } from '../types';
import { TIME_SLOTS } from './utils';
import { ScheduleRow } from './ScheduleRow';

interface ScheduleGridProps {
    students: Student[];
    isLoading: boolean;
    updatingIds: Set<string>;
}

export const ScheduleGrid = ({ students, isLoading, updatingIds }: ScheduleGridProps) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-cyan-200 animate-pulse">학생 데이터를 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto md:overflow-visible">
            {/* 데스크톱 전용 그리드 (md 이상) */}
            <div
                className="hidden md:grid w-full"
                style={{
                    gridTemplateColumns: `minmax(100px, max-content) repeat(32, 1fr)`
                }}
            >
                {/* 헤더 */}
                <div className="bg-transparent border-b border-cyan-500/30 flex items-center justify-center px-2 h-8 font-medium text-cyan-200 text-sm text-center">
                    학생
                </div>
                {TIME_SLOTS.slice(0, -1).map((time, idx) => (
                    <div
                        key={time}
                        className="relative border-b border-cyan-500/30 flex items-center justify-center h-8 text-cyan-200 text-[10px] font-medium"
                        style={{
                            borderLeft: idx % 4 === 0 ? '1px dashed #67e8f9' : undefined,
                            background: 'rgba(8,40,80,0.10)'
                        }}
                    >
                        {idx % 4 === 0 ? time : ''}
                    </div>
                ))}
                
                {/* 데스크톱 학생별 행 */}
                {students.map((student, rowIdx) => (
                    <ScheduleRow 
                        key={student.userId} 
                        student={student} 
                        rowIdx={rowIdx} 
                        updatingIds={updatingIds}
                    />
                ))}
            </div>

            {/* 모바일 전용 리스트 (md 미만) */}
            <div className="md:hidden flex flex-col w-full">
                <div className="flex items-center px-4 py-2 border-b border-cyan-500/30 bg-cyan-900/20 text-cyan-200 text-xs font-bold">
                    <span className="w-24">학생</span>
                    <span className="flex-1 text-center">시간 스케줄</span>
                </div>
                {students.map((student, rowIdx) => (
                    <ScheduleRow 
                        key={student.userId + '-mobile'} 
                        student={student} 
                        rowIdx={rowIdx} 
                        isMobile 
                        updatingIds={updatingIds}
                    />
                ))}
            </div>
        </div>
    );
};
