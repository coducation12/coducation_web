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
    const todayStr = currentDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    const todayStrMobile = currentDate.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    return (
        <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-cyan-100 font-bold text-xl sm:text-2xl whitespace-nowrap">출석 스케줄</span>
                </div>
                <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
                    <button onClick={onPrev} className="p-1 rounded hover:bg-cyan-900/30 transition-colors focus:outline-none">
                        <ChevronLeft className="w-6 h-6 text-cyan-200" />
                    </button>
                    <span className="text-cyan-200 text-lg sm:text-xl font-semibold select-none text-center truncate max-w-[220px]">
                        <span className="hidden md:inline">{todayStr}</span>
                        <span className="md:hidden">{todayStrMobile}</span>
                    </span>
                    <button onClick={onNext} className="p-1 rounded hover:bg-cyan-900/30 transition-colors focus:outline-none">
                        <ChevronRight className="w-6 h-6 text-cyan-200" />
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-end min-w-0">
                    <Badge className="bg-green-500/60 text-white text-xs border-none">출석</Badge>
                    <Badge className="bg-red-500/60 text-white text-xs border-none">결석</Badge>
                    <Badge className="bg-yellow-500/60 text-white text-xs border-none">보강</Badge>
                </div>
            </div>
        </CardHeader>
    );
};
