import React from 'react';
import { getTeacherColorSet } from '@/lib/colors';
import { TimetableStudent } from '@/hooks/use-timetable';

interface StudentTagProps {
    student: TimetableStudent;
    teacherColor: string;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const StudentTag = React.memo(({
    student,
    teacherColor,
    isHovered,
    onMouseEnter,
    onMouseLeave
}: StudentTagProps) => {
    const colorSet = getTeacherColorSet(teacherColor);

    return (
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`rounded-[2px] px-1.5 py-[0.5px] text-white text-[9px] font-black 
        transition-all duration-300 border-2 border-transparent cursor-pointer 
        text-center whitespace-nowrap shadow-[0_1px_3px_rgba(0,0,0,0.3)]
        ${isHovered ? 'ring-2 ring-cyan-100 z-10 scale-110 shadow-[0_0_10px_rgba(0,255,247,0.4)]' : 'hover:scale-105'}
      `}
            style={{
                backgroundColor: teacherColor || '#00fff7',
                ...colorSet.style,
                color: 'white',
                textShadow: '0px 0.5px 1.5px rgba(0,0,0,0.9), 0px 0px 1px rgba(0,0,0,1)'
            }}
            title={`${student.name} - ${student.teacher} (${student.academy})`}
        >
            {student.name}
        </div>
    );
});

StudentTag.displayName = 'StudentTag';
