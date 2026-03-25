// 개별 출석 세션 타입
export interface AttendanceSession {
  id: string; // row 내의 고유 식별자 (예: user_id-regular, user_id-makeup-uuid)
  sessionId?: string; // DB 레코드 ID
  attendanceTime: {
    start: string;
    end: string;
    status: 'unregistered' | 'present' | 'absent';
    checkedAt?: Date;
  };
  isMakeup: boolean;
  koreanSpeed?: number;
  englishSpeed?: number;
  memo?: string;
}

// 학생 타입 (UI 행 하나를 구성)
export interface Student {
  userId: string;
  name: string;
  teacher: string;
  day: string;
  course: string;
  curriculum: string;
  phone: string;
  sessions: AttendanceSession[];
}

// 출석 상태 타입
export type AttendanceStatus = 'unregistered' | 'present' | 'absent';

// 출석 상태 설정
export const STATUS_CONFIG = {
  unregistered: {
    color: 'bg-slate-700/50 border-slate-500',
    text: '미출석',
    textColor: 'text-slate-300',
    fullClass: 'bg-slate-700/50 border-slate-500 text-slate-300'
  },
  present: {
    color: 'bg-green-500/80 border-green-400',
    text: '출석',
    textColor: 'text-white',
    fullClass: 'bg-green-500/80 border-green-400 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]'
  },
  absent: {
    color: 'bg-red-500/80 border-red-400',
    text: '결석',
    textColor: 'text-white',
    fullClass: 'bg-red-500/80 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]'
  }
} as const;