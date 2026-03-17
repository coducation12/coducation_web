import React from "react";
import { cn } from "@/lib/utils";

interface DashboardPageWrapperProps {
    children: React.ReactNode;
    className?: string;
    isPaddingReduced?: boolean; // For pages like 'timetable' that might need less or no horizontal padding
}

export function DashboardPageWrapper({
    children,
    className,
    isPaddingReduced = false,
}: DashboardPageWrapperProps) {
    return (
        <div
            className={cn(
                "max-w-[1400px] mx-auto w-full pt-6 pb-6 space-y-6 h-full lg:h-screen overflow-y-auto scrollbar-hide",
                isPaddingReduced ? "px-0 md:px-6" : "px-6",
                className
            )}
        >
            {children}
        </div>
    );
}
