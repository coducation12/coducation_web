import React from "react";
import { StudentCard } from "./StudentThemeProvider";

interface DashboardCardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  active?: boolean;
}

export function DashboardCard({ className, children, hover = true, active = false }: DashboardCardProps) {
  return (
    <StudentCard className={className} hover={hover} active={active}>
      {children}
    </StudentCard>
  );
} 