import React from 'react';
import { AttendanceRecord } from './types';
import { AttendanceStatus, STATUS_CONFIG } from '../types';

interface CalendarGridProps {
    currentMonth: Date;
    attendanceRecords: Record<string, AttendanceRecord>;
    onEditDay: (dateStr: string, record?: AttendanceRecord) => void;
}

export function CalendarGrid({
    currentMonth,
    attendanceRecords,
    onEditDay
}: CalendarGridProps) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toLocaleDateString('en-CA');

    const days = [];

    // 빈 칸 (이전 달의 날짜들)
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-20 sm:h-28 bg-cyan-950/10 border-cyan-500/5"></div>);
    }

    // 실제 날짜들
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const record = attendanceRecords[dateStr];
        const isToday = dateStr === todayStr;

        days.push(
            <div
                key={d}
                onClick={() => onEditDay(dateStr, record)}
                className={`h-20 sm:h-28 p-2 border border-cyan-500/10 cursor-pointer transition-all duration-300 relative group overflow-hidden
                    ${isToday ? 'bg-cyan-500/10' : 'hover:bg-cyan-500/5'}
                `}
            >
                {isToday && (
                    <div className="absolute inset-0 border-2 border-cyan-400/50 z-0 pointer-events-none"></div>
                )}

                <div className="flex justify-between items-start relative z-10">
                    <span className={`text-[11px] font-black tracking-tighter ${isToday ? 'text-cyan-100' : 'text-cyan-500/40 opacity-70 group-hover:opacity-100 transition-opacity'}`}>
                        {String(d).padStart(2, '0')}
                    </span>
                    {record && (
                        <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[record.status].color} shadow-lg shadow-black/50`}></div>
                    )}
                </div>

                {record && (
                    <div className="mt-2 space-y-1 relative z-10">
                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block ${STATUS_CONFIG[record.status].color} bg-black/20 backdrop-blur-sm border border-white/5`}>
                            {STATUS_CONFIG[record.status].text}
                        </div>
                        {record.memo && (
                            <div className="text-[9px] text-cyan-200/50 truncate bg-cyan-900/40 px-1 rounded border border-white/5">
                                {record.memo}
                            </div>
                        )}
                        {record.is_makeup && (
                            <div className="text-[8px] text-yellow-400 font-black tracking-widest uppercase opacity-80 decoration-yellow-500/50 underline-offset-2 underline">
                                MAKEUP
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return <>{days}</>;
}
