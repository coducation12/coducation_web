// 학생 타입 정의
export interface Student {
  id: string;
  userId: string;
  name: string;
  teacher: string;
  day: string;
  course: string;
  curriculum: string;
  phone: string;
  attendanceTime: {
    start: string;
    end: string;
    status: 'unregistered' | 'present' | 'absent' | 'makeup';
    checkedAt?: Date;
  };
  isMakeup?: boolean;
}

// 출석 상태 타입
export type AttendanceStatus = 'unregistered' | 'present' | 'absent' | 'makeup';

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
  },
  makeup: {
    color: 'bg-yellow-500/80 border-yellow-400',
    text: '보강',
    textColor: 'text-black',
    fullClass: 'bg-yellow-500/80 border-yellow-400 text-black shadow-[0_0_10px_rgba(234,179,8,0.3)]'
  }
} as const;