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
 * 수업 시간(분)에 따른 등록 단위(Unit) 계산 (주 단위 방식)
 * @param totalMinutes 총 수업 시간(분)
 * @returns 0.25 단위 기반 등록 단위
 */
export const calculateRegistrationUnit = (totalMinutes: number): number => {
    // 표준 수업 시간(90분)으로 환산하여 '표준 세션 횟수' 계산
    const standardSessions = Math.floor(totalMinutes / 90);

    if (standardSessions < 2) return 0;

    // 2세션당 0.25 단위 (8세션 = 1.0 단위)
    // 홀수 세션(예: 7회)은 내림 처리하여 6회(0.75)로 계산
    return Math.floor(standardSessions / 2) * 0.25;
};

/**
 * 학생의 특정 월 등록 단위(Unit) 계산 (주 단위 방식 - 시간 기반)
 * @param year 연도
 * @param month 월
 * @param schedule attendance_schedule 형태의 데이터
 * @param targetTeacherId 대상 강사 ID
 * @param studentDefaultTeacherId 학생의 전담 강사 ID
 * @param enrollmentDate 최초 등록일
 * @returns 0.25 단위 기반 등록 단위
 */
export const getStudentRegistrationUnit = (
    year: number,
    month: number,
    schedule: any,
    targetTeacherId: string,
    studentDefaultTeacherId: string,
    enrollmentDate?: string,
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

    return calculateRegistrationUnit(totalMinutes);
};

/**
 * 학원 이름에 따른 색상 매핑
 * @param academyName 학원 이름
 * @returns HEX 색상 코드
 */
export const getAcademyColor = (academyName: string): string => {
    // 학원 이름별 고정 색상 매핑 (순서대로 1~5번)
    const academyColors: Record<string, string> = {
        '코딩메이커': '#00fff7', // 1번: 진한 하늘색 (사이트 테마)
        '광양 코딩': '#ff00ff',   // 2번: 마젠타
        '본점': '#00fff7',       // 1번과 동일한 경우 대응
        // 추가 학원이 있을 경우 아래에 마젠타 이외의 색상들(Amber, Lime, Purple 등) 매핑
    };

    // 기본적으로 등록된 학원이면 해당 색상, 없으면 학원 이름 문자열을 기반으로 결정
    if (academyColors[academyName]) {
        return academyColors[academyName];
    }

    // 이름에 따른 동적 할당 (3~5번 색상 후보)
    const dynamicColors = ['#ffaa00', '#00ff00', '#9d50bb'];
    const charSum = academyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return dynamicColors[charSum % dynamicColors.length];
};
