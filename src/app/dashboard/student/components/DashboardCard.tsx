import React from "react";
import clsx from "clsx";

interface DashboardCardProps {
  className?: string;
  children: React.ReactNode;
}

export function DashboardCard({ className, children }: DashboardCardProps) {
  return (
    <div
      className={clsx(
        "border border-border bg-background/60 p-6 shadow-[0_0_24px_0_rgba(0,255,255,0.10)] min-w-0",
        className
      )}
    >
      {children}
    </div>
  );
} 