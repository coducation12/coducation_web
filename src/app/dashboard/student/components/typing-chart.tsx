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

  // 데이터베이스에서 날짜별로 이미 유니크하게 가져오므로 단순 매핑만 수행
  return rawData.map(record => ({
    date: record.date,
    korean_speed: record.korean_typing_speed || undefined,
    english_speed: record.english_typing_speed || undefined
  }));
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
    <div className="w-full h-full flex flex-col min-h-0">
      <StudentSectionTitle icon={<Keyboard className="w-5 h-5" />}>
        타자연습 기록
      </StudentSectionTitle>
      <div className="flex-1 w-full mt-2 min-h-0">
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
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                stroke="#b3e6ff" 
                fontSize={12}
                tick={{ fill: '#b3e6ff' }}
              />
              <YAxis 
                stroke="#b3e6ff" 
                fontSize={12} 
                tick={{ fill: '#b3e6ff' }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #38bdf8', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#38bdf8' }}
                formatter={(value: any, name: string) => {
                  const label = name === 'korean_speed' ? '한글 타자속도' : '영어 타자속도';
                  return [`${value} CPM`, label];
                }}
                labelFormatter={(label: string) => `날짜: ${formatDate(label)}`}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                formatter={(value) => {
                  const labels: { [key: string]: string } = {
                    korean_speed: '한글',
                    english_speed: '영어'
                  };
                  return <span style={{ color: '#b3e6ff' }}>{labels[value] || value}</span>;
                }}
              />
              <Line
                name="korean_speed"
                type="monotone"
                dataKey="korean_speed"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                connectNulls
              />
              <Line
                name="english_speed"
                type="monotone"
                dataKey="english_speed"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
} 