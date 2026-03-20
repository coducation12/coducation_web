import { Student, AttendanceStatus } from "../components/types";

/**
 * 특정 날짜의 학생 출결 및 스케줄 데이터를 통합하여 가져오는 함수
 * @param date 조회할 날짜
 * @param teacherId 강사 ID (선택 사항, 클라이언트 필터링 보조용)
 * @returns 통합된 학생 세션 리스트
 */
export const getAttendanceData = async (date: Date, teacherId?: string | null): Promise<Student[]> => {
    try {
        const dateStr = date.toLocaleDateString('en-CA');
        const response = await fetch(`/api/dashboard/attendance?date=${dateStr}`);

        if (!response.ok) {
            console.error('API에서 출결 데이터 조회 실패', response.status);
            return [];
        }

        const { students, sessions, teachers } = await response.json();

        const sessionMap = new Map<string, any[]>();
        (sessions || []).forEach((session: any) => {
            const studentSessions = sessionMap.get(session.student_id) || [];
            studentSessions.push(session);
            sessionMap.set(session.student_id, studentSessions);
        });

        const teacherMap = new Map<string, string>();
        (teachers || []).forEach((t: any) => teacherMap.set(t.id, t.name));

        const dayOfWeek = date.getDay();
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const resultSessions: Student[] = [];

        (students || []).forEach((student: any) => {
            const schedule = student.attendance_schedule || {};
            const assignedTeachers = student.assigned_teachers || [];

            // 강사 ID 필터링
            if (teacherId && !assignedTeachers.includes(teacherId)) return;

            const studentSessions = sessionMap.get(student.user_id) || [];
            const teacherName = teacherMap.get(assignedTeachers[0]) || '미배정';

            // 요일 라벨 생성
            const daysLabel = Object.keys(schedule)
                .filter(k => {
                    const dayNum = parseInt(k);
                    if (isNaN(dayNum)) return false;
                    if (teacherId) {
                        const slotTeacherId = schedule[k]?.teacherId || schedule[k]?.teacher_id;
                        return slotTeacherId?.toLowerCase() === teacherId.toLowerCase();
                    }
                    return true;
                })
                .map(k => dayNames[parseInt(k)])
                .join('/');

            // A. 정규 수업 추가
            const daySchedule = schedule[dayOfWeek] || schedule[dayOfWeek.toString()];
            if (daySchedule) {
                const slotTeacherId = daySchedule.teacherId || daySchedule.teacher_id;
                if (teacherId && slotTeacherId?.toLowerCase() !== teacherId.toLowerCase()) return;

                const regularSession = studentSessions.find(s => s.session_type === 'regular');

                resultSessions.push({
                    id: `${student.user_id}-regular`,
                    sessionId: regularSession?.id,
                    userId: student.user_id,
                    name: student.users?.name || '알 수 없음',
                    teacher: teacherName,
                    day: daysLabel,
                    course: student.main_subject || '미설정',
                    curriculum: student.sub_subject || '미설정',
                    phone: '',
                    attendanceTime: {
                        start: daySchedule.startTime || '10:00',
                        end: daySchedule.endTime || '11:30',
                        status: (regularSession?.status || 'unregistered') as AttendanceStatus
                    },
                    isMakeup: false,
                    koreanSpeed: regularSession?.korean_typing_speed || 0,
                    englishSpeed: regularSession?.english_typing_speed || 0,
                    memo: regularSession?.memo || ''
                });
            }

            // B. 보강 수업 추가
            studentSessions.filter((s: any) => 
                s.session_type === 'makeup' && 
                (!teacherId || s.teacher_id?.toLowerCase() === teacherId.toLowerCase())
            ).forEach((session: any) => {
                resultSessions.push({
                    id: `${student.user_id}-makeup-${session.id}`,
                    sessionId: session.id,
                    userId: student.user_id,
                    name: student.users?.name || '알 수 없음',
                    teacher: teacherName,
                    day: '보강',
                    course: student.main_subject || '미설정',
                    curriculum: student.sub_subject || '미설정',
                    phone: '',
                    attendanceTime: {
                        start: session.start_time || '14:00',
                        end: session.end_time || '15:30',
                        status: (session.status || 'makeup') as AttendanceStatus
                    },
                    isMakeup: true,
                    koreanSpeed: session.korean_typing_speed || 0,
                    englishSpeed: session.english_typing_speed || 0,
                    memo: session.memo || ''
                });
            });
        });

        // 세션 정렬
        resultSessions.sort((a, b) => {
            if (a.attendanceTime.start !== b.attendanceTime.start) {
                return a.attendanceTime.start.localeCompare(b.attendanceTime.start);
            }
            return a.name.localeCompare(b.name, 'ko-KR');
        });

        return resultSessions;
    } catch (error) {
        console.error('getAttendanceData 처리 중 예기치 못한 오류:', error);
        return [];
    }
};
