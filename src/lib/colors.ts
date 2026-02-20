/**
 * 강사별 고유 색상을 관리하는 공유 유틸리티
 */

// 고정된 색상 팔레트 (Tailwind 클래스 정의)
export const TEACHER_COLORS = [
    {
        name: 'blue',
        bg: 'bg-blue-600/70',
        border: 'border-blue-500/50',
        text: 'text-blue-300',
        hoverBg: 'hover:bg-blue-500/80',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
        name: 'emerald',
        bg: 'bg-emerald-600/70',
        border: 'border-emerald-500/50',
        text: 'text-emerald-300',
        hoverBg: 'hover:bg-emerald-500/80',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
        name: 'violet',
        bg: 'bg-violet-600/70',
        border: 'border-violet-500/50',
        text: 'text-violet-300',
        hoverBg: 'hover:bg-violet-500/80',
        badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    },
    {
        name: 'amber',
        bg: 'bg-amber-600/70',
        border: 'border-amber-500/50',
        text: 'text-amber-300',
        hoverBg: 'hover:bg-amber-500/80',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
        name: 'fuchsia',
        bg: 'bg-fuchsia-600/70',
        border: 'border-fuchsia-500/50',
        text: 'text-fuchsia-300',
        hoverBg: 'hover:bg-fuchsia-500/80',
        badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
    },
    {
        name: 'sky',
        bg: 'bg-sky-600/70',
        border: 'border-sky-500/50',
        text: 'text-sky-300',
        hoverBg: 'hover:bg-sky-500/80',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    },
    {
        name: 'teal',
        bg: 'bg-teal-600/70',
        border: 'border-teal-500/50',
        text: 'text-teal-300',
        hoverBg: 'hover:bg-teal-500/80',
        badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    },
    {
        name: 'rose',
        bg: 'bg-rose-600/70',
        border: 'border-rose-500/50',
        text: 'text-rose-300',
        hoverBg: 'hover:bg-rose-500/80',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    }
];

/**
 * 강사 ID(또는 이름/HEX색상)를 기반으로 일관된 색상 객체를 반환하는 함수
 */
export const getTeacherColorSet = (idOrColor: string | null | undefined) => {
    if (!idOrColor || idOrColor === 'none' || idOrColor === '미지정') {
        return {
            bg: 'bg-gray-600/70',
            border: 'border-gray-500/50',
            text: 'text-gray-400',
            hoverBg: 'hover:bg-gray-500/80',
            badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            style: { borderTopColor: '#94a3b8' } // Fallback style
        };
    }

    // HEX 색상 코드인 경우 (DB에서 가져온 label_color)
    if (idOrColor.startsWith('#')) {
        return {
            bg: 'transparent', // CSS style will override this
            border: 'border-transparent',
            text: 'text-white', // Use white text for background blocks, or the color itself for text
            hoverBg: '',
            badge: '',
            style: {
                color: idOrColor, // Default to using the color for text
                borderColor: `${idOrColor}80`,
                backgroundColor: `${idOrColor}b3` // 70% opacity to match default palette
            }
        };
    }

    // ID를 기반으로 해시 생성 (일관성 유지)
    let hash = 0;
    for (let i = 0; i < idOrColor.length; i++) {
        hash = ((hash << 5) - hash + idOrColor.charCodeAt(i)) & 0xffffffff;
    }

    const index = Math.abs(hash) % TEACHER_COLORS.length;
    return {
        ...TEACHER_COLORS[index],
        style: {} // Default empty style for fixed palette
    };
};
