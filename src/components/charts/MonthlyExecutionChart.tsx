'use client';

import { Bar, CartesianGrid, ComposedChart, Label, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BudgetData } from '@/types';

interface MonthlyExecutionChartProps {
  data: BudgetData['monthlyExecution'];
}

export default function MonthlyExecutionChart({ data }: MonthlyExecutionChartProps) {
  const chartData = data.map((item) => ({
    month: item.month.slice(5).replace('-', '.'),
    planned: item.planned,
    actual: item.actual,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `${Number(value ?? 0).toLocaleString('ko-KR')}천원`} />
          <Legend />
          <Bar dataKey="planned" fill="#94a3b8" name="계획" />
          <Line dataKey="actual" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="실제 누적" />
          <ReferenceLine x="02" stroke="#ef4444" strokeDasharray="4 4">
            <Label value="현재(2월)" position="insideTop" fill="#ef4444" />
          </ReferenceLine>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
