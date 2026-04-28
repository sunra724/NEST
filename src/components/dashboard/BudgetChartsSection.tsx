'use client';

import dynamic from 'next/dynamic';
import type { BudgetData } from '@/types';

const ProgramCostStackedBarChart = dynamic(() => import('@/components/charts/ProgramCostStackedBarChart'), { ssr: false });
const DirectCostHorizontalBarChart = dynamic(() => import('@/components/charts/DirectCostHorizontalBarChart'), { ssr: false });
const MonthlyExecutionChart = dynamic(() => import('@/components/charts/MonthlyExecutionChart'), { ssr: false });

interface BudgetChartsSectionProps {
  budget: BudgetData;
}

export default function BudgetChartsSection({ budget }: BudgetChartsSectionProps) {
  const directCostData = Object.entries(budget.directCostDetail).map(([key, value]) => ({
    key,
    label: value.label,
    budget: value.budget,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">프로그램별 비용 구조</h3>
            <p className="text-xs text-slate-500">(단위: 천원)</p>
          </div>
          <ProgramCostStackedBarChart data={budget.byProgram} />
        </article>
        <article className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">직접비 세부 항목</h3>
            <p className="text-xs text-slate-500">(단위: 천원)</p>
          </div>
          <DirectCostHorizontalBarChart data={directCostData} />
        </article>
      </div>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">월별 집행 추이</h3>
          <p className="text-xs text-slate-500">(단위: 천원)</p>
        </div>
        <MonthlyExecutionChart data={budget.monthlyExecution} />
      </article>
    </div>
  );
}
