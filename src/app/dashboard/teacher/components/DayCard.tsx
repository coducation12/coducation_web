import React from 'react';
import { Student } from './types';

interface DayCardProps {
    date: Date;
    dayName: string;
    students: Student[];
    isToday: boolean;
    isPast: boolean;
    isSunday?: boolean;
}

export const DayCard = React.memo(({
    date,
    dayName,
    students,
    isToday,
    isPast,
    isSunday = false
}: DayCardProps) => {
    return (
        <div
            className={`relative p-3 rounded-lg border transition-all duration-300 min-h-[120px] ${isToday
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                : isPast
                    ? 'bg-gray-700/30 border-gray-600 text-gray-400'
                    : isSunday
                        ? 'bg-cyan-900/10 border-red-400/50 text-cyan-200'
                        : 'bg-cyan-900/10 border-cyan-500/30 text-cyan-200'
                }`}
        >
            <div className="text-center mb-3">
                <div className="text-xs font-medium opacity-70">{dayName}</div>
                <div className={`text-lg font-bold ${isToday ? 'text-cyan-100' : ''}`}>
                    {date.getDate()}
                </div>
            </div>

            {students.length > 0 && (
                <div className="space-y-1">
                    <div className="text-xs text-center opacity-70 mb-2">
                        {students.length}명
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-1 max-h-24 overflow-y-auto custom-scrollbar">
                        {students.map(student => {
                            const isMakeup = student.isMakeup;
                            return (
                                <div
                                    key={student.id}
                                    className={`text-[10px] text-center px-1 py-0.5 rounded border whitespace-nowrap transition-colors ${isMakeup
                                        ? 'bg-yellow-400/25 border-yellow-400/40 text-yellow-200 hover:bg-yellow-400/35 shadow-[0_0_5px_rgba(234,179,8,0.1)]'
                                        : 'bg-cyan-500/20 border-cyan-400/30 hover:bg-cyan-500/30'
                                        }`}
                                    title={`${student.name} - ${student.course}${isMakeup ? ' (보강)' : ''}`}
                                >
                                    {student.name}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {students.length === 0 && (
                <div className="text-center">
                    <div className="text-xs opacity-50">수업 없음</div>
                </div>
            )}
        </div>
    );
});

DayCard.displayName = 'DayCard';
