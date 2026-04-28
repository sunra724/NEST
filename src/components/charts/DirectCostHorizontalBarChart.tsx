'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NEST_COLORS } from '@/lib/constants';

interface DirectCostHorizontalBarChartProps {
  data: Array<{ key: string; label: string; budget: number }>;
}

const colors = [NEST_COLORS.N.primary, NEST_COLORS.E.primary, NEST_COLORS.S.primary, NEST_COLORS.T.primary];

export default function DirectCostHorizontalBarChart({ data }: DirectCostHorizontalBarChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="label" width={90} />
          <Tooltip formatter={(value) => `${Number(value ?? 0).toLocaleString('ko-KR')}천원`} />
          <Bar dataKey="budget" radius={[0, 8, 8, 0]}>
            {data.map((entry, idx) => (
              <Cell key={entry.key} fill={colors[idx] ?? '#64748B'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
