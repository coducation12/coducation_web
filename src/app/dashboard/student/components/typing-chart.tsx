'use client';

import { Keyboard } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { StudentSectionTitle, StudentText } from "./StudentThemeProvider";
import { getTypingRecords } from "@/lib/actions";

interface TypingLog {
  date: string;
  korean_speed?: number;
  english_speed?: number;
}

// 데이터 집계 함수
function aggregateTypingData(rawData: any[], totalDays: number): TypingLog[] {
  if (rawData.length === 0) return [];
  
  // 데이터 개수에 따른 집계 방식 결정
  let interval: 'daily' | 'weekly' | 'monthly' = 'daily';
  
  if (rawData.length > 60) {
    interval = 'monthly';
  } else if (rawData.length > 30) {
    interval = 'weekly';
  }
  
  if (interval === 'daily') {
    // 일별 데이터 (최신 데이터 우선)
    const dateMap = new Map<string, { korean: any[], english: any[] }>();
    
    rawData.forEach(record => {
      const date = record.date;
      if (!dateMap.has(date)) {
        dateMap.set(date, { korean: [], english: [] });
      }
      
      const dayData = dateMap.get(date)!;
      if (record.typing_language === 'korean') {
        dayData.korean.push(record);
      } else if (record.typing_language === 'english') {
        dayData.english.push(record);
      }
    });
    
    return Array.from(dateMap.entries()).map(([date, records]) => {
      const korean_speed = records.korean.length > 0
        ? Math.round(records.korean.reduce((sum: number, r: any) => sum + r.typing_speed, 0) / records.korean.length)
        : undefined;
      const english_speed = records.english.length > 0
        ? Math.round(records.english.reduce((sum: number, r: any) => sum + r.typing_speed, 0) / records.english.length)
        : undefined;
        
      return {
        date,
        korean_speed,
        english_speed
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (interval === 'weekly') {
    // 주별 데이터 집계
    const weekMap = new Map<string, { korean: any[], english: any[] }>();
    
    rawData.forEach(record => {
      const date = new Date(record.date);
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay()); // 주의 시작일 (일요일)
      const weekKey = startOfWeek.toISOString().split('T')[0];
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { korean: [], english: [] });
      }
      
      const weekData = weekMap.get(weekKey)!;
      if (record.typing_language === 'korean') {
        weekData.korean.push(record);
      } else if (record.typing_language === 'english') {
        weekData.english.push(record);
      }
    });
    
    return Array.from(weekMap.entries()).map(([weekStart, records]) => {
      const korean_speed = records.korean.length > 0
        ? Math.round(records.korean.reduce((sum: number, r: any) => sum + r.typing_speed, 0) / records.korean.length)
        : undefined;
      const english_speed = records.english.length > 0
        ? Math.round(records.english.reduce((sum: number, r: any) => sum + r.typing_speed, 0) / records.english.length)
        : undefined;
        
      return {
        date: weekStart,
        korean_speed,
        english_speed
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else {
    // 월별 데이터 집계
    const monthMap = new Map<string, { korean: any[], english: any[] }>();
    
    rawData.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { korean: [], english: [] });
      }
      
      const monthData = monthMap.get(monthKey)!;
      if (record.typing_language === 'korean') {
        monthData.korean.push(record);
      } else if (record.typing_language === 'english') {
        monthData.english.push(record);
      }
    });
    
    return Array.from(monthMap.entries()).map(([month, records]) => {
      const korean_speed = records.korean.length > 0
        ? Math.round(records.korean.reduce((sum: number, r: any) => sum + r.typing_speed, 0) / records.korean.length)
        : undefined;
      const english_speed = records.english.length > 0
        ? Math.round(records.english.reduce((sum: number, r: any) => sum + r.typing_speed, 0) / records.english.length)
        : undefined;
        
      return {
        date: month,
        korean_speed,
        english_speed
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

export function TypingChart({ studentId }: { studentId: string }) {
  const [data, setData] = useState<TypingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [studentId]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const result = await getTypingRecords(studentId, 365); // 1년간 데이터
      
      if (result.success && result.data) {
        const aggregatedData = aggregateTypingData(result.data, 365);
        setData(aggregatedData);
      } else {
        console.error('타자연습 기록 조회 실패:', result.error);
        setData([]);
      }
    } catch (e) {
      console.error('타자연습 기록 조회 실패:', e);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }

  function formatDate(date: string) {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <StudentSectionTitle icon={<Keyboard className="w-5 h-5" />}>
        타자연습 기록
      </StudentSectionTitle>
      <div className="flex-1 w-full h-0 min-h-0 mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <StudentText variant="muted">로딩 중...</StudentText>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <StudentText variant="muted">기록이 없습니다.</StudentText>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} stroke="#b3e6ff" fontSize={12} />
              <YAxis stroke="#b3e6ff" fontSize={12} domain={[0, 'dataMax + 50']} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #38bdf8', color: '#fff' }}
                labelStyle={{ color: '#38bdf8' }}
                formatter={(value: any, name: string) => {
                  const label = name === 'korean_speed' ? '한글 타자속도' : '영어 타자속도';
                  return [`${value} CPM`, label];
                }}
                labelFormatter={(label: string) => `날짜: ${formatDate(label)}`}
              />
              <Legend 
                iconType="line"
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => {
                  const labels: { [key: string]: string } = {
                    korean_speed: '한글 타자속도',
                    english_speed: '영어 타자속도'
                  };
                  return <span style={{ color: '#b3e6ff' }}>{labels[value] || value}</span>;
                }}
              />
              {/* 한글 타자속도 - 파란색 */}
              <Line 
                type="monotone" 
                dataKey="korean_speed" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
              {/* 영어 타자속도 - 주황색 */}
              <Line 
                type="monotone" 
                dataKey="english_speed" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
} 