export interface Holiday {
    date: string; // YYYY-MM-DD
    name: string;
}

export const FIXED_HOLIDAYS: Record<string, string> = {
    '01-01': '신정',
    '03-01': '삼일절',
    '05-05': '어린이날',
    '06-06': '현충일',
    '08-15': '광복절',
    '10-03': '개천절',
    '10-09': '한글날',
    '12-25': '크리스마스',
};

/**
 * 고정된 양력 공휴일(예: 01-01)을 확인합니다.
 * 공공데이터포털 API 호출 실패 시 Fallback으로 사용할 수 있습니다.
 */
export function getFixedHoliday(dateStr: string): string | null {
    if (!dateStr) return null;
    
    const mmDd = dateStr.substring(5); // "YYYY-MM-DD" -> "MM-DD"
    if (FIXED_HOLIDAYS[mmDd]) {
        return FIXED_HOLIDAYS[mmDd];
    }
    
    return null;
}
