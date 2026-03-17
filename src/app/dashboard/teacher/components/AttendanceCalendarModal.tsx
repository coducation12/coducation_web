'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { AttendanceStatus } from './types';
import { useAttendanceCalendar } from '../hooks/useAttendanceCalendar';
import { DayEditor } from './attendance-calendar/DayEditor';
import { CalendarGrid } from './attendance-calendar/CalendarGrid';
import { AttendanceRecord } from './attendance-calendar/types';

interface AttendanceCalendarModalProps {
    studentId: string;
    studentName: string;
    teacherId?: string | null;
    mode?: 'calendar' | 'detail';
    customTrigger?: React.ReactNode;
    onRefresh?: () => void;
}

export function AttendanceCalendarModal({
    studentId,
    studentName,
    teacherId,
    mode = 'calendar',
    customTrigger,
    onRefresh
}: AttendanceCalendarModalProps) {
    const [open, setOpen] = useState(false);
    const {
        currentMonth,
        setCurrentMonth,
        attendanceRecords,
        editingDay,
        setEditingDay,
        isSaving,
        handleSaveDay,
        handleDeleteDay,
        nextMonth,
        prevMonth,
        openTodayDetail
    } = useAttendanceCalendar(studentId, teacherId, onRefresh);

    const onEditDay = (dateStr: string, record?: AttendanceRecord) => {
        setEditingDay(record || { date: dateStr, status: 'present', memo: '' });
    };

    if (mode === 'detail') {
        return (
            <>
                <div onClick={openTodayDetail} className="cursor-pointer">
                    {customTrigger}
                </div>
                <DayEditor
                    editingDay={editingDay}
                    isSaving={isSaving}
                    onClose={() => setEditingDay(null)}
                    onSave={() => handleSaveDay(teacherId)}
                    onDelete={handleDeleteDay}
                    setEditingDay={setEditingDay}
                />
            </>
        );
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {customTrigger || (
                        <Button variant="outline" size="sm" className="bg-cyan-900/40 border-cyan-500/30 text-cyan-100 hover:bg-cyan-800/60 hover:text-cyan-400 transition-all flex items-center gap-2">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Open Calendar</span>
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-4xl bg-[#0a1a2f] border-cyan-500/30 text-cyan-100 p-0 overflow-hidden flex flex-col max-h-[95vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <DialogHeader className="p-2 sm:p-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950 to-blue-950">
                        <DialogTitle className="flex items-center justify-between w-full h-8 sm:h-10 pr-6 sm:pr-0">
                            {/* 왼쪽: 학생 이름 */}
                            <div className="w-[18%] xs:w-[20%] sm:w-1/4">
                                <span className="text-cyan-100 text-sm sm:text-lg font-bold drop-shadow-[0_0_8px_#00fff7] truncate block">
                                    {studentName}
                                </span>
                            </div>

                            {/* 중앙: 날짜 이동 및 Today */}
                            <div className="flex-1 flex items-center justify-center gap-1 sm:gap-4">
                                <div className="flex items-center gap-0.5 sm:gap-2">
                                    <Button variant="ghost" size="icon" onClick={prevMonth} className="text-cyan-400 hover:bg-cyan-500/10 h-7 w-7 sm:h-8 sm:w-8">
                                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:h-5" />
                                    </Button>
                                    <span className="text-xs sm:text-lg font-black min-w-[70px] sm:min-w-[120px] text-center tracking-tighter text-cyan-50">
                                        {currentMonth.getFullYear()}. {String(currentMonth.getMonth() + 1).padStart(2, '0')}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={nextMonth} className="text-cyan-400 hover:bg-cyan-500/10 h-7 w-7 sm:h-8 sm:w-8">
                                        <ChevronRight className="h-4 w-4 sm:h-5 sm:h-5" />
                                    </Button>
                                </div>
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentMonth(new Date())}
                                    className="border-cyan-500/30 text-cyan-400 bg-cyan-900/20 hover:bg-cyan-800/40 px-2 h-7 text-[9px] font-black uppercase tracking-wider transition-all hidden xs:flex"
                                >
                                    Today
                                </Button>
                            </div>

                            {/* 오른쪽: X 버튼 공간 확보를 위한 더미 (lg 이상에서만 보임) */}
                            <div className="hidden sm:block w-1/4"></div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4">
                        <div className="grid grid-cols-7 gap-px mb-2">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                                <div key={day} className={`text-center text-[11px] font-black tracking-widest py-2 border-b-2 border-transparent ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-cyan-500/60'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-px border border-cyan-500/20 rounded-lg overflow-hidden bg-cyan-950/30 backdrop-blur-sm shadow-inner">
                            <CalendarGrid
                                currentMonth={currentMonth}
                                attendanceRecords={attendanceRecords}
                                onEditDay={onEditDay}
                            />
                        </div>

                        <div className="mt-4 sm:mt-8 flex flex-wrap gap-4 sm:gap-8 justify-center bg-cyan-900/10 p-3 sm:p-5 rounded-2xl border border-cyan-500/10 backdrop-blur-md">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500/40 border border-green-500/60 shadow-[0_0_8px_rgba(34,197,94,0.3)]"></div>
                                <span className="text-xs sm:text-sm font-bold text-cyan-200">출석</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500/40 border border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]"></div>
                                <span className="text-xs sm:text-sm font-bold text-cyan-200">결석</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500/40 border border-yellow-500/60 shadow-[0_0_8px_rgba(234,179,8,0.3)]"></div>
                                <span className="text-xs sm:text-sm font-bold text-cyan-200">보강</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 border-l border-cyan-500/20 pl-4 sm:pl-8">
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-cyan-400 rounded-sm"></div>
                                <span className="text-xs sm:text-sm font-bold text-cyan-200">오늘</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <DayEditor
                editingDay={editingDay}
                isSaving={isSaving}
                onClose={() => setEditingDay(null)}
                onSave={() => handleSaveDay(teacherId)}
                onDelete={handleDeleteDay}
                setEditingDay={setEditingDay}
            />
        </>
    );
}
