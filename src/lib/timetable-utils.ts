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
    const halfThreshold = threshold / 2;
    // 기준일수의 절반을 0.5 단위로 계산 (상한선 없음)
    return Math.max(0.5, Math.ceil(sessionCount / halfThreshold) * 0.5);
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

    // 해당 강사가 배정된 요일만 필터링
    const teacherDays = Object.keys(schedule).filter(day => {
        const slot = schedule[day];
        // 슬롯에 별도 강사가 지정되어 있으면 그것을 사용, 없으면 학생의 기본 강사 사용
        const assignedTeacherId = slot.teacherId || studentDefaultTeacherId;
        return assignedTeacherId === targetTeacherId;
    }).map(Number);

    if (teacherDays.length === 0) return 0;

    const sessionCount = calculateMonthlySessions(year, month, teacherDays, enrollmentDate);

    return calculateRegistrationUnit(sessionCount, threshold);
};
