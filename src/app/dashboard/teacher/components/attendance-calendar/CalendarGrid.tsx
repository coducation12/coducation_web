import React from 'react';
import { AttendanceRecord } from './types';
import { AttendanceStatus, STATUS_CONFIG } from '../types';

interface CalendarGridProps {
    currentMonth: Date;
    attendanceRecords: Record<string, AttendanceRecord[]>;
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
        const records = attendanceRecords[dateStr] || [];
        const isToday = dateStr === todayStr;

        days.push(
            <div
                key={d}
                onClick={() => onEditDay(dateStr, records[0])} // 기본적으로 첫 번째 기록 혹은 빈 상태로 에디터 열기
                className={`h-20 sm:h-28 p-1 sm:p-2 border border-cyan-500/10 cursor-pointer transition-all duration-300 relative group overflow-hidden
                    ${isToday ? 'bg-cyan-500/10' : 'hover:bg-cyan-500/5'}
                `}
            >
                {isToday && (
                    <div className="absolute inset-0 border-2 border-cyan-400/50 z-0 pointer-events-none"></div>
                )}

                <div className="flex justify-between items-start relative z-10">
                    <span className={`text-[10px] sm:text-[11px] font-black tracking-tighter ${isToday ? 'text-cyan-100' : 'text-cyan-500/40 opacity-70 group-hover:opacity-100 transition-opacity'}`}>
                        {String(d).padStart(2, '0')}
                    </span>
                    <div className="flex gap-1">
                        {records.map((r, idx) => (
                            <div key={idx} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${STATUS_CONFIG[r.status].color} shadow-lg shadow-black/50`}></div>
                        ))}
                    </div>
                </div>

                <div className="mt-1 sm:mt-2 space-y-1 relative z-10 overflow-hidden">
                    {records.map((record, idx) => (
                        <div 
                            key={idx} 
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditDay(dateStr, record);
                            }}
                            className="group/record"
                        >
                            <div className={`text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-md flex items-center gap-1 mb-0.5
                                ${record.session_type === 'makeup' ? 'border border-yellow-500/50 bg-yellow-500/10 text-yellow-200' : `${STATUS_CONFIG[record.status].color} bg-black/20`}
                                backdrop-blur-sm border border-white/5 whitespace-nowrap overflow-hidden
                            `}>
                                <span className="truncate">
                                    {record.session_type === 'makeup' 
                                        ? (record.status === 'makeup' ? '보강 예정' : `보강 ${STATUS_CONFIG[record.status].text}`)
                                        : STATUS_CONFIG[record.status].text
                                    }
                                </span>
                            </div>
                        </div>
                    ))}
                    
                    {records.length > 0 && records[0].memo && (
                        <div className="text-[8px] sm:text-[9px] text-cyan-200/50 truncate bg-cyan-900/40 px-1 rounded border border-white/5">
                            {records[0].memo}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return <>{days}</>;
}
