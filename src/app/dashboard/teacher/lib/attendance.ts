import { Student, AttendanceStatus, AttendanceSession } from "../components/types";

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
        const studentMap = new Map<string, Student>();

        (students || []).forEach((student: any) => {
            const userId = student.user_id;
            const schedule = student.attendance_schedule || {};
            const assignedTeachers = student.assigned_teachers || [];
            const studentSessions = sessionMap.get(userId) || [];
            const teacherName = teacherMap.get(assignedTeachers[0]) || '미배정';

            const sessions: AttendanceSession[] = [];

            // A. 정규 수업 확인 및 추가
            const daySchedule = schedule[dayOfWeek] || schedule[dayOfWeek.toString()];
            if (daySchedule) {
                const slotTeacherId = daySchedule.teacherId || daySchedule.teacher_id;
                const isAssignedToMe = teacherId && slotTeacherId?.toLowerCase() === teacherId.toLowerCase();
                
                if (isAssignedToMe || !teacherId) {
                    const regularSession = studentSessions.find(s => s.session_type === 'regular');
                    sessions.push({
                        id: `${userId}-regular`,
                        sessionId: regularSession?.id,
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
            }

            // B. 보강 수업 확인 및 추가
            studentSessions.filter((s: any) => 
                s.session_type === 'makeup' && 
                (!teacherId || s.teacher_id?.toLowerCase() === teacherId.toLowerCase())
            ).forEach((session: any) => {
                sessions.push({
                    id: `${userId}-makeup-${session.id}`,
                    sessionId: session.id,
                    attendanceTime: {
                        start: session.start_time || '14:00',
                        end: session.end_time || '15:30',
                        status: (session.status === 'makeup' ? 'unregistered' : (session.status || 'unregistered')) as AttendanceStatus
                    },
                    isMakeup: true,
                    koreanSpeed: session.korean_typing_speed || 0,
                    englishSpeed: session.english_typing_speed || 0,
                    memo: session.memo || ''
                });
            });

            // 결과 세션이 하나라도 있는 경우에만 학생 레코드 생성
            if (sessions.length > 0) {
                const progress = student?.learning_progress || [];
                const ongoing = progress.filter((p: any) => p.status !== 'completed');
                const currentProgress = ongoing.length > 0 ? ongoing[ongoing.length - 1] : null;

                studentMap.set(userId, {
                    userId: userId,
                    name: student.users?.name || '알 수 없음',
                    teacher: teacherName,
                    day: Object.keys(schedule)
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
                        .join('/'),
                    course: currentProgress ? currentProgress.title : (student.main_subject || '미지정'),
                    category: currentProgress ? (currentProgress.category || '') : '',
                    curriculum: currentProgress ? currentProgress.title : (student.sub_subject || '미설정'),
                    phone: '',
                    sessions: sessions
                } as Student);
            }
        });

        const resultStudents = Array.from(studentMap.values());

        // 정렬 (첫 번째 수업 시간 기준)
        resultStudents.sort((a, b) => {
            const aFirstStart = a.sessions[0]?.attendanceTime.start || '24:00';
            const bFirstStart = b.sessions[0]?.attendanceTime.start || '24:00';
            
            if (aFirstStart !== bFirstStart) {
                return aFirstStart.localeCompare(bFirstStart);
            }
            return a.name.localeCompare(b.name, 'ko-KR');
        });

        return resultStudents;
    } catch (error) {
        console.error('getAttendanceData 처리 중 예기치 못한 오류:', error);
        return [];
    }
};
