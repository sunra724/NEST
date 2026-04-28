'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NEST_COLORS } from '@/lib/constants';

interface BudgetCategoryRatioChartProps {
  data: Array<{ label: string; ratio: number }>;
}

const palette = [NEST_COLORS.N.primary, NEST_COLORS.E.primary, NEST_COLORS.S.primary];

export default function BudgetCategoryRatioChart({ data }: BudgetCategoryRatioChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
          <XAxis type="number" unit="%" />
          <YAxis dataKey="label" type="category" width={64} />
          <Tooltip formatter={(value) => `${Number(value ?? 0)}%`} />
          <Bar dataKey="ratio" radius={[0, 8, 8, 0]}>
            {data.map((entry, idx) => (
              <Cell key={entry.label} fill={palette[idx] ?? '#64748B'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
