'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NEST_COLORS } from '@/lib/constants';
import type { BudgetData } from '@/types';

interface ProgramCostStackedBarChartProps {
  data: BudgetData['byProgram'];
}

export default function ProgramCostStackedBarChart({ data }: ProgramCostStackedBarChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="id" />
          <YAxis />
          <Tooltip formatter={(value) => `${Number(value ?? 0).toLocaleString('ko-KR')}천원`} />
          <Legend />
          <Bar dataKey="direct" stackId="cost" fill={NEST_COLORS.N.primary} name="직접비" />
          <Bar dataKey="indirect" stackId="cost" fill={NEST_COLORS.E.primary} name="간접비" />
          <Bar dataKey="labor" stackId="cost" fill={NEST_COLORS.S.primary} name="인건비" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
