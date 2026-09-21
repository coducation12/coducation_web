import { NextResponse } from 'next/server';
import { FIXED_HOLIDAYS } from '@/lib/holiday-utils';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const yearStr = searchParams.get('year');

    if (!yearStr || !/^\d{4}$/.test(yearStr)) {
        return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    const year = parseInt(yearStr, 10);
    const apiKey = process.env.HOLIDAY_API_KEY;
    const holidayMap: Record<string, string> = {};

    // 1. 고정 공휴일 먼저 맵에 담기 (Fallback 역할)
    for (const [mmDd, name] of Object.entries(FIXED_HOLIDAYS)) {
        holidayMap[`${year}-${mmDd}`] = name;
    }

    if (!apiKey) {
        console.warn('HOLIDAY_API_KEY is not set. Returning only fixed holidays.');
        return NextResponse.json({ holidays: holidayMap });
    }

    try {
        const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?ServiceKey=${apiKey}&solYear=${year}&numOfRows=100&_type=json`;
        
        // 공공데이터포털은 응답이 느리거나 종종 실패할 수 있으므로 timeout 설정 등 고려 가능
        const response = await fetch(url, {
            next: {
                revalidate: 86400 * 30, // 30일 캐싱 (공휴일이 자주 바뀌지는 않음)
            }
        });

        if (!response.ok) {
            throw new Error(`API response error: ${response.status}`);
        }

        const data = await response.json();
        const items = data?.response?.body?.items?.item;

        if (items) {
            // 결과가 배열이거나 단일 객체일 수 있음
            const itemArray = Array.isArray(items) ? items : [items];
            
            for (const item of itemArray) {
                if (item.locdate && item.dateName) {
                    const locdateStr = item.locdate.toString();
                    if (locdateStr.length === 8) {
                        const dateKey = `${locdateStr.substring(0, 4)}-${locdateStr.substring(4, 6)}-${locdateStr.substring(6, 8)}`;
                        holidayMap[dateKey] = item.dateName;
                    }
                }
            }
        }

        return NextResponse.json({ holidays: holidayMap });
    } catch (error) {
        console.error('Failed to fetch holidays from public API:', error);
        // 에러 시 이미 채워진 고정 공휴일만 반환
        return NextResponse.json({ holidays: holidayMap });
    }
}
