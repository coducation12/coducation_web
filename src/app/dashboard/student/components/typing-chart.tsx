'use client';

import { Keyboard } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { StudentSectionTitle, StudentText } from "./StudentThemeProvider";

interface TypingLog {
  date: string;
  typing_score: number;
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
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const fromDate = oneYearAgo.toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from('student_activity_logs')
        .select('date, typing_score')
        .eq('student_id', studentId)
        .eq('activity_type', 'typing')
        .not('typing_score', 'is', null)
        .gte('date', fromDate)
        .order('date', { ascending: true });
      if (error) throw error;
      setData(data || []);
    } catch (e) {
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
              <YAxis stroke="#b3e6ff" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #38bdf8', color: '#fff' }}
                labelStyle={{ color: '#38bdf8' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => `${value}점`}
                labelFormatter={(label: string) => `날짜: ${label}`}
              />
              <Line type="monotone" dataKey="typing_score" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
} 