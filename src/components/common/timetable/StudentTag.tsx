import React from 'react';
import { getTeacherColorSet } from '@/lib/colors';
import { TimetableStudent } from '@/hooks/use-timetable';
import { getAcademyColor } from '@/lib/timetable-utils';

interface StudentTagProps {
    student: TimetableStudent;
    teacherColor: string;
    isHovered: boolean;
    hoveredAcademy: string | null;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const StudentTag = React.memo(({
    student,
    teacherColor,
    isHovered,
    hoveredAcademy,
    onMouseEnter,
    onMouseLeave
}: StudentTagProps) => {
    const colorSet = getTeacherColorSet(teacherColor);
    const academyColor = getAcademyColor(student.academy);

    // 학원 범례에 마우스 오버 시 강조되는 효과 포함
    const isActive = isHovered || (hoveredAcademy === student.academy);

    return (
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`rounded-[2px] px-1.5 py-[0.5px] text-white text-[11px] font-black 
        transition-all duration-300 border-2 border-transparent cursor-pointer 
        text-center whitespace-nowrap shadow-[0_1px_3px_rgba(0,0,0,0.3)]
        ${isActive ? 'ring-2 ring-cyan-100 z-10 scale-110 shadow-[0_0_10px_rgba(0,255,247,0.4)]' : 'hover:scale-105'}
      `}
            style={{
                backgroundColor: teacherColor || '#00fff7',
                ...colorSet.style,
                color: 'white',
                textShadow: '0px 0.5px 1.5px rgba(0,0,0,0.9), 0px 0px 1px rgba(0,0,0,1)',
                borderLeft: `4px solid ${academyColor}`, // 왼쪽 세로 포인트 바
                paddingLeft: '5px' // 선과 이름 사이 간격 확보
            }}
        >
            {student.name}
        </div>
    );
});

StudentTag.displayName = 'StudentTag';
