// 학생 타입 정의
export interface Student {
  id: string;
  name: string;
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
}

// 출석 상태 타입
export type AttendanceStatus = 'unregistered' | 'present' | 'absent' | 'makeup';

// 출석 상태 설정
export const STATUS_CONFIG = {
  unregistered: { color: 'bg-gray-500/80 border-gray-400', text: '미등록' },
  present: { color: 'bg-green-500/80 border-green-400', text: '출석' },
  absent: { color: 'bg-red-500/80 border-red-400', text: '결석' },
  makeup: { color: 'bg-yellow-500/80 border-yellow-400', text: '보강' }
} as const; 