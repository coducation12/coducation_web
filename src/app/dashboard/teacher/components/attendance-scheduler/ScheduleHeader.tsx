import React from 'react';
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleHeaderProps {
    currentDate: Date;
    onPrev: () => void;
    onNext: () => void;
}

export const ScheduleHeader = ({
    currentDate,
    onPrev,
    onNext
}: ScheduleHeaderProps) => {
    const yearShort = String(currentDate.getFullYear()).slice(-2);
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = dayNames[currentDate.getDay()];

    const desktopStr = `${yearShort}년 ${month}월 ${day}일 ${dayOfWeek}요일`;
    const mobileStr = `${yearShort}년 ${month}월 ${day}일 (${dayOfWeek})`;

    return (
        <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-cyan-100 font-bold text-xl sm:text-2xl whitespace-nowrap">출석 스케줄</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center min-w-0">
                    <button onClick={onPrev} className="p-1 rounded hover:bg-cyan-900/30 transition-colors focus:outline-none" aria-label="이전 날짜">
                        <ChevronLeft className="w-6 h-6 text-cyan-200" />
                    </button>
                    <span className="text-cyan-200 text-base sm:text-lg md:text-xl font-semibold select-none text-center whitespace-nowrap">
                        <span className="hidden sm:inline">{desktopStr}</span>
                        <span className="sm:hidden">{mobileStr}</span>
                    </span>
                    <button onClick={onNext} className="p-1 rounded hover:bg-cyan-900/30 transition-colors focus:outline-none" aria-label="다음 날짜">
                        <ChevronRight className="w-6 h-6 text-cyan-200" />
                    </button>
                </div>
                <div className="hidden md:flex flex-wrap items-center gap-2 justify-end min-w-0">
                    <Badge className="bg-green-500/60 text-white text-xs border-none">출석</Badge>
                    <Badge className="bg-red-500/60 text-white text-xs border-none">결석</Badge>
                    <Badge className="bg-yellow-500/60 text-white text-xs border-none">보강</Badge>
                </div>
            </div>
        </CardHeader>
    );
};
