'use client';

import { useEffect } from 'react';
import { trackVisit } from '@/lib/actions';

export default function VisitTracker() {
    useEffect(() => {
        const track = async () => {
            // 로컬 개발 환경에서의 접속은 추적하지 않음
            if (typeof window !== 'undefined' && 
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                return;
            }

            try {
                const today = new Date().toISOString().split('T')[0];
                const lastVisit = localStorage.getItem('last_visit_date');
                
                // 고유 방문자 여부 판단 (오늘 최초 방문인 경우)
                const isUnique = lastVisit !== today;
                
                await trackVisit(isUnique);
                
                // 마지막 방문 날짜 업데이트
                localStorage.setItem('last_visit_date', today);
            } catch (error) {
                console.error('Failed to track visit:', error);
            }
        };

        track();
    }, []);

    return null; // UI를 렌더링하지 않음
}
