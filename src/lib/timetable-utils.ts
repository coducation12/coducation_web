/**
 * 학원 시간표 관련 유틸리티 함수
 */

/**
 * 특정 월의 총 수업 일수 계산
 * @param year 연도
 * @param month 월 (1-12)
 * @param daysOfWeek 수강 요일 배열 (0: 일, 1: 월, ..., 6: 토)
 * @param startDate 수강 시작일 (해당 월 중간에 시작하는 경우 고려)
 * @returns 해당 월의 총 수업 횟수
 */
export const calculateMonthlySessions = (
    year: number,
    month: number,
    daysOfWeek: number[],
    startDate?: string
): number => {
    const start = startDate ? new Date(startDate) : new Date(year, month - 1, 1);
    const end = new Date(year, month, 0); // 월의 마지막 날

    // 만약 시작일이 해당 월보다 늦으면 해당 월 수업 없음
    if (start > end) return 0;

    // 시작일이 해당 월보다 이전이면 월 초로 설정
    const effectiveStart = start.getMonth() + 1 === month && start.getFullYear() === year
        ? start
        : new Date(year, month - 1, 1);

    let sessionCount = 0;
    const current = new Date(effectiveStart);

    while (current <= end) {
        if (daysOfWeek.includes(current.getDay())) {
            sessionCount++;
        }
        current.setDate(current.getDate() + 1);
    }

    return sessionCount;
};

/**
 * 수업 횟수에 따른 등록 단위(Unit) 계산
 * @param sessionCount 수업 횟수
 * @param threshold 기준 횟수 (기본값 8)
 * @returns 0.5 또는 1.0
 */
export const calculateRegistrationUnit = (sessionCount: number, threshold: number = 8): number => {
    if (sessionCount === 0) return 0;

    // 주 2회 기준(threshold 8), 절반(4회) 단위를 한 스텝(0.5)으로 계산
    // Math.floor를 사용하여 8회 미만(1~7회)은 전체 1.0이 되지 못하고 0.5에 머물게 함
    const halfThreshold = threshold / 2;
    const unit = Math.floor(sessionCount / halfThreshold) * 0.5;

    // 최소 0.5 보장 (수업이 1회라도 있으면)
    return Math.max(0.5, unit);
};

/**
 * 학생의 특정 월 등록 단위 계산
 * @param year 연도
 * @param month 월
 * @param schedule attendance_schedule 형태의 데이터
 * @param enrollmentDate 최초 등록일
 * @param threshold 기준 횟수 (기본값 8)
 * @returns 0.5 또는 1.0
 */
export const getStudentRegistrationUnit = (
    year: number,
    month: number,
    schedule: any,
    targetTeacherId: string,
    studentDefaultTeacherId: string,
    enrollmentDate?: string,
    threshold: number = 8
): number => {
    if (!schedule) return 0;

    const start = enrollmentDate ? new Date(enrollmentDate) : new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    if (start > end) return 0;

    const effectiveStart = (start.getMonth() + 1 === month && start.getFullYear() === year)
        ? start
        : new Date(year, month - 1, 1);

    let totalMinutes = 0;
    const current = new Date(effectiveStart);

    while (current <= end) {
        const dayNum = current.getDay();
        const slot = schedule[dayNum.toString()];

        if (slot) {
            const assignedTeacherId = slot.teacherId || studentDefaultTeacherId;
            if (assignedTeacherId === targetTeacherId && slot.startTime && slot.endTime) {
                try {
                    const [startH, startM] = slot.startTime.split(':').map(Number);
                    const [endH, endM] = slot.endTime.split(':').map(Number);
                    if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
                        const duration = (endH * 60 + endM) - (startH * 60 + startM);
                        if (duration > 0) {
                            totalMinutes += duration;
                        }
                    }
                } catch (e) {
                    console.error('시간 계산 중 오류:', e);
                }
            }
        }
        current.setDate(current.getDate() + 1);
    }

    if (totalMinutes === 0) return 0;

    // 표준 수업 시간(1.5시간 = 90분)으로 환산하여 단위 계산
    // 예: 주 3회 1시간(총 180분) = 주 2회 1.5시간(총 180분)과 동일한 8회분(720분) 가중치 부여
    const effectiveSessions = totalMinutes / 90;
    return calculateRegistrationUnit(effectiveSessions, threshold);
};
