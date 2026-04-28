'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { NEST_COLORS } from '@/lib/constants';
import type { BudgetData } from '@/types';

interface ProgramBudgetDonutChartProps {
  data: BudgetData['byProgram'];
}

const colorById: Record<string, string> = {
  N: NEST_COLORS.N.primary,
  E: NEST_COLORS.E.primary,
  S: NEST_COLORS.S.primary,
  T: NEST_COLORS.T.primary,
};

export default function ProgramBudgetDonutChart({ data }: ProgramBudgetDonutChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="budget" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={colorById[entry.id] ?? '#64748B'} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Number(value ?? 0).toLocaleString('ko-KR')}천원`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
