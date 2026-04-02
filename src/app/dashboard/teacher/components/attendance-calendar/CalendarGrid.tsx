import React, { useMemo } from 'react';
import { AttendanceRecord } from './types';
import { CalendarDay } from './CalendarDay';

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
    const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA'), []);
    
    const { days } = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        
        // 빈 칸 (이전 달의 날짜들)
        for (let i = 0; i < firstDay; i++) {
            days.push({ type: 'empty', id: `empty-${i}` });
        }
        
        // 실제 날짜들
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ 
                type: 'day', 
                id: dateStr, 
                day: d, 
                dateStr: dateStr, 
                isToday: dateStr === todayStr 
            });
        }
        
        return { days };
    }, [currentMonth, todayStr]);

    return (
        <>
            {days.map((item) => {
                if (item.type === 'empty') {
                    return <div key={item.id} className="h-20 sm:h-28 bg-cyan-950/10 border-cyan-500/5"></div>;
                }
                
                return (
                    <CalendarDay
                        key={item.id}
                        day={item.day as number}
                        dateStr={item.dateStr as string}
                        isToday={item.isToday as boolean}
                        records={attendanceRecords[item.dateStr as string] || []}
                        onEditDay={onEditDay}
                    />
                );
            })}
        </>
    );
}

CalendarGrid.displayName = 'CalendarGrid';
