import React from 'react';
import { AttendanceRecord } from './types';
import { STATUS_CONFIG } from '../types';

interface CalendarDayProps {
    day: number;
    dateStr: string;
    isToday: boolean;
    records: AttendanceRecord[];
    onEditDay: (dateStr: string, record?: AttendanceRecord) => void;
}

export const CalendarDay = React.memo(({
    day,
    dateStr,
    isToday,
    records,
    onEditDay
}: CalendarDayProps) => {
    return (
        <div
            onClick={() => onEditDay(dateStr, records[0])}
            className={`h-24 sm:h-32 p-1 sm:p-2 border border-cyan-500/10 cursor-pointer transition-all duration-300 relative group overflow-hidden flex flex-col
                ${isToday ? 'bg-cyan-500/15 ring-1 ring-inset ring-cyan-400/30' : 'hover:bg-cyan-500/5'}
            `}
        >
            {isToday && (
                <div className="absolute inset-x-0 top-0 h-1 bg-cyan-400/50 z-20 pointer-events-none"></div>
            )}

            <div className="flex justify-between items-start mb-1 relative z-10 shrink-0">
                <span className={`text-[10px] sm:text-[11px] font-black tracking-tighter ${isToday ? 'text-cyan-100' : 'text-cyan-500/40 opacity-70 group-hover:opacity-100 transition-opacity'}`}>
                    {String(day).padStart(2, '0')}
                </span>
                <div className="flex gap-0.5">
                    {records.map((r, idx) => (
                        <div key={idx} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${STATUS_CONFIG[r.status].color} shadow-[0_0_5px_rgba(0,0,0,0.5)]`}></div>
                    ))}
                </div>
            </div>

            <div className="flex-1 space-y-1 relative z-10 overflow-y-auto overflow-x-hidden scrollbar-hide scroll-smooth">
                {records.map((record, idx) => (
                    <div 
                        key={idx} 
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditDay(dateStr, record);
                        }}
                        className="flex flex-col gap-0.5"
                    >
                        <div className={`text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-md flex items-center gap-1
                            ${record.session_type === 'makeup'
                                ? record.status === 'unregistered'
                                    ? 'border border-yellow-500/50 bg-yellow-500/10 text-yellow-200'
                                    : record.status === 'present'
                                        ? 'bg-green-600/90 border border-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.1)]'
                                        : record.status === 'absent'
                                            ? 'bg-red-600/90 border border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                                            : 'border border-yellow-400 bg-yellow-400/80 text-yellow-900'
                                : `${STATUS_CONFIG[record.status].color} bg-black/30 border border-white/5`
                            }
                            backdrop-blur-sm whitespace-nowrap overflow-hidden transition-all hover:scale-[1.02]
                        `}>
                            <span className="truncate w-full text-center">
                                {record.session_type === 'makeup' 
                                    ? (record.status === 'unregistered' ? '보강 예정' : `보강 ${STATUS_CONFIG[record.status].text}`)
                                    : STATUS_CONFIG[record.status].text
                                }
                            </span>
                        </div>
                        
                        {record.memo && (
                            <div className="text-[7px] sm:text-[8px] text-cyan-200/60 leading-tight px-1 py-0.5 bg-cyan-900/40 rounded border border-white/5 truncate hover:whitespace-normal hover:overflow-visible hover:z-50 hover:bg-cyan-900/90 transition-all">
                                {record.memo}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}, (prev, next) => {
    // 렌더링 최적화: 날짜, 오늘 여부, 레코드 내용이 동일하면 재렌더링 방지
    return (
        prev.day === next.day &&
        prev.dateStr === next.dateStr &&
        prev.isToday === next.isToday &&
        JSON.stringify(prev.records) === JSON.stringify(next.records)
    );
});

CalendarDay.displayName = 'CalendarDay';
