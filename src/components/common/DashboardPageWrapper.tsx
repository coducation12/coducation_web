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
                "max-w-[1400px] mx-auto w-full pt-20 lg:pt-6 pb-6 space-y-6 h-screen overflow-y-auto scrollbar-hide",
                isPaddingReduced ? "p-0 md:p-6" : "p-6",
                className
            )}
        >
            {children}
        </div>
    );
}
