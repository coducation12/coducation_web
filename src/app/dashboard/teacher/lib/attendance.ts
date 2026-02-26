import { supabase } from "@/lib/supabase";
import { Student, AttendanceStatus } from "../components/types";

/**
 * 특정 날짜의 학생 출결 및 스케줄 데이터를 통합하여 가져오는 함수
 * @param date 조회할 날짜
 * @param teacherId 강사 ID (선택 사항, 필터링용)
 * @returns 통합된 학생 세션 리스트
 */
export const getAttendanceData = async (date: Date, teacherId?: string | null): Promise<Student[]> => {
    try {
        // 1. 모든 학생 기본 정보 및 요일별 스케줄 로드
        const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select(`
        user_id,
        assigned_teachers,
        attendance_schedule,
        main_subject,
        sub_subject,
        users:users!students_user_id_fkey(name, status)
      `);

        if (studentsError) {
            console.error('학생 데이터 로드 실패:', studentsError);
            return [];
        }

        // 활성 학생 필터링
        const activeStudents = (studentsData || []).filter((s: any) =>
            s.users?.status === 'active' || !s.users?.status
        );

        // 2. 해당 날짜의 출결 로그(정규+보강) 로드
        const dateStr = date.toLocaleDateString('en-CA');
        const { data: logData, error: logError } = await supabase
            .from('student_activity_logs')
            .select('id, student_id, status, is_makeup, start_time, end_time')
            .eq('date', dateStr)
            .eq('activity_type', 'attendance');

        if (logError) {
            console.error('출결 로그 로드 실패:', logError);
        }

        const logMap = new Map<string, any[]>();
        (logData || []).forEach((log: any) => {
            const logs = logMap.get(log.student_id) || [];
            logs.push(log);
            logMap.set(log.student_id, logs);
        });

        // 3. 관련 강사 이름 맵핑 정보 로드
        const teacherIds = new Set<string>();
        activeStudents.forEach((s: any) => {
            if (Array.isArray(s.assigned_teachers)) {
                s.assigned_teachers.forEach((id: string) => teacherIds.add(id));
            }
        });

        const { data: teachersData } = await supabase
            .from('users')
            .select('id, name')
            .in('id', Array.from(teacherIds));

        const teacherMap = new Map<string, string>();
        (teachersData || []).forEach((t: any) => teacherMap.set(t.id, t.name));

        // 4. 데이터 가공 및 병합
        const dayOfWeek = date.getDay();
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const sessions: Student[] = [];

        activeStudents.forEach((student: any) => {
            const schedule = student.attendance_schedule || {};
            const assignedTeachers = student.assigned_teachers || [];

            // 강사 ID 필터링 (학생의 배정 강사 목록에 포함되어 있는지 확인)
            if (teacherId && !assignedTeachers.includes(teacherId)) return;

            const studentLogs = logMap.get(student.user_id) || [];
            const teacherName = teacherMap.get(assignedTeachers[0]) || '미배정';

            // 요일 라벨 생성
            const daysLabel = Object.keys(schedule)
                .filter(k => !isNaN(parseInt(k)))
                .map(k => dayNames[parseInt(k)])
                .join('/');

            // A. 정규 수업 추가
            const daySchedule = schedule[dayOfWeek] || schedule[dayOfWeek.toString()];
            if (daySchedule) {
                // 특정 교시 강사가 본인이 아닌 경우 필터링
                if (teacherId && daySchedule.teacherId && daySchedule.teacherId !== teacherId) return;

                // 해당 요일의 로그 중 보강이 아닌 일반 출석 로그 찾기
                const regularLog = studentLogs.find(l => !l.is_makeup);

                sessions.push({
                    id: `${student.user_id}-regular`,
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
                        status: (regularLog?.status || 'unregistered') as AttendanceStatus
                    },
                    isMakeup: false
                });
            }

            // B. 보강 수업 추가
            studentLogs.filter(l => l.is_makeup).forEach(log => {
                sessions.push({
                    id: `${student.user_id}-makeup-${log.id}`,
                    userId: student.user_id,
                    name: student.users?.name || '알 수 없음',
                    teacher: teacherName,
                    day: '보강',
                    course: student.main_subject || '미설정',
                    curriculum: student.sub_subject || '미설정',
                    phone: '',
                    attendanceTime: {
                        start: log.start_time || '14:00',
                        end: log.end_time || '15:30',
                        status: (log.status || 'makeup') as AttendanceStatus
                    },
                    isMakeup: true
                });
            });
        });

        return sessions;
    } catch (error) {
        console.error('getAttendanceData 처리 중 예기치 못한 오류:', error);
        return [];
    }
};
