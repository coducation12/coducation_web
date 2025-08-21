import React from "react";
import { cn } from "@/lib/utils";

// 학생 페이지 전용 테마 상수
export const STUDENT_THEME = {
  // 색상 팔레트
  colors: {
    primary: "text-cyan-100",
    secondary: "text-cyan-200", 
    accent: "text-cyan-300",
    muted: "text-cyan-400",
    border: "border-cyan-400/40",
    borderHover: "border-cyan-400/60",
    background: "bg-background/60",
    backgroundHover: "bg-cyan-400/10",
  },
  
  // 글씨체
  typography: {
    heading: "font-bold text-cyan-100",
    subheading: "font-semibold text-cyan-200",
    body: "text-cyan-100",
    muted: "text-cyan-400",
  },
  
  // 카드 스타일
  card: {
    base: "border border-cyan-400/40 bg-background/60 p-6 shadow-[0_0_24px_0_rgba(0,255,255,0.10)]",
    hover: "hover:shadow-[0_0_24px_0_rgba(0,255,255,0.15)] transition-shadow duration-200",
    active: "shadow-[0_0_24px_0_rgba(0,255,255,0.20)]",
  },
  
  // 빛나는 효과
  glow: {
    text: "drop-shadow-[0_0_6px_#00fff7]",
    textSmall: "drop-shadow-[0_0_4px_#00fff7]",
    border: "shadow-[0_0_12px_0_rgba(0,255,255,0.10)]",
    borderHover: "shadow-[0_0_12px_0_rgba(0,255,255,0.15)]",
  },
  
  // 아이콘 스타일
  icon: {
    primary: "text-cyan-300 drop-shadow-[0_0_6px_#00fff7]",
    secondary: "text-cyan-400",
    success: "text-green-400 drop-shadow-[0_0_6px_#00ff00]",
    warning: "text-yellow-400 drop-shadow-[0_0_6px_#ffff00]",
  }
};

// 학생 페이지 전용 카드 컴포넌트
interface StudentCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  active?: boolean;
}

export function StudentCard({ children, className, hover = true, active = false }: StudentCardProps) {
  return (
    <div
      className={cn(
        STUDENT_THEME.card.base,
        hover && STUDENT_THEME.card.hover,
        active && STUDENT_THEME.card.active,
        "min-h-0", // 높이 제약 추가
        className
      )}
    >
      {children}
    </div>
  );
}

// 학생 페이지 전용 제목 컴포넌트
interface StudentHeadingProps {
  children: React.ReactNode;
  className?: string;
  size?: "h1" | "h2" | "h3" | "h4";
  glow?: boolean;
}

export function StudentHeading({ children, className, size = "h2", glow = true }: StudentHeadingProps) {
  const sizeClasses = {
    h1: "text-3xl font-bold",
    h2: "text-2xl font-bold", 
    h3: "text-xl font-bold",
    h4: "text-lg font-bold"
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        STUDENT_THEME.typography.heading,
        glow && STUDENT_THEME.glow.text,
        className
      )}
    >
      {children}
    </div>
  );
}

// 학생 페이지 전용 섹션 제목 컴포넌트
interface StudentSectionTitleProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function StudentSectionTitle({ children, icon, className, glow = true }: StudentSectionTitleProps) {
  return (
    <div className={cn("flex items-center gap-2 font-bold text-lg mb-2", className)}>
      {icon && (
        <div className={cn(STUDENT_THEME.icon.primary)}>
          {icon}
        </div>
      )}
      <span className={cn(STUDENT_THEME.typography.heading, glow && STUDENT_THEME.glow.textSmall)}>
        {children}
      </span>
    </div>
  );
}

// 학생 페이지 전용 텍스트 컴포넌트
interface StudentTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "muted" | "accent";
  glow?: boolean;
}

export function StudentText({ children, className, variant = "primary", glow = false }: StudentTextProps) {
  const variantClasses = {
    primary: STUDENT_THEME.typography.body,
    secondary: STUDENT_THEME.typography.subheading,
    muted: STUDENT_THEME.typography.muted,
    accent: STUDENT_THEME.colors.accent
  };

  return (
    <span
      className={cn(
        variantClasses[variant],
        glow && STUDENT_THEME.glow.textSmall,
        className
      )}
    >
      {children}
    </span>
  );
}

// 학생 페이지 전용 버튼 스타일
export const studentButtonStyles = {
  primary: "bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500 shadow-[0_0_12px_0_rgba(0,255,255,0.20)]",
  secondary: "bg-transparent border-cyan-400/60 text-cyan-100 hover:bg-cyan-400/10 hover:border-cyan-400/80",
  ghost: "bg-transparent text-cyan-100 hover:bg-cyan-400/10",
};

// 학생 페이지 전용 입력 필드 스타일
export const studentInputStyles = "bg-background/40 border-cyan-400/40 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400/80 focus:ring-cyan-400/20";

// 학생 페이지 전용 프로그레스 바 스타일
export const studentProgressStyles = "bg-cyan-400/20 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-cyan-300 [&>div]:shadow-[0_0_8px_0_rgba(0,255,255,0.30)]"; 