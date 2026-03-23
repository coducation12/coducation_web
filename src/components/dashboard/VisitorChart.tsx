'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface VisitorChartProps {
  data: any[];
  height?: number | string;
}

export default function VisitorChart({ data, height = 240 }: VisitorChartProps) {
  // 데이터가 없을 경우 가짜 데이터 (디자인 확인용)
  const displayData = data && data.length > 0 ? data : [
    { date: '03-17', visit_count: 0, unique_visitors: 0 },
    { date: '03-18', visit_count: 0, unique_visitors: 0 },
    { date: '03-19', visit_count: 0, unique_visitors: 0 },
    { date: '03-20', visit_count: 0, unique_visitors: 0 },
    { date: '03-21', visit_count: 0, unique_visitors: 0 },
    { date: '03-22', visit_count: 0, unique_visitors: 0 },
    { date: '03-23', visit_count: 0, unique_visitors: 0 },
  ];

  // 날짜 형식 변경 (MM-DD)
  const formattedData = displayData.map(item => ({
    ...item,
    formattedDate: item.date.split('-').slice(1).join('-')
  }));

  return (
    <div className="w-full mt-4" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#0891b2" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="formattedDate" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(34, 211, 238, 0.1)' }}
            contentStyle={{ 
              backgroundColor: '#0a1a2f', 
              border: '1px solid rgba(34, 211, 238, 0.3)',
              borderRadius: '8px',
              fontSize: '11px'
            }}
            itemStyle={{ color: '#22d3ee' }}
          />
          <Bar 
            dataKey="visit_count" 
            name="방문수" 
            fill="url(#barGradient)" 
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Bar 
            dataKey="unique_visitors" 
            name="고유방문" 
            fill="#a855f7" 
            radius={[4, 4, 0, 0]}
            barSize={8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
