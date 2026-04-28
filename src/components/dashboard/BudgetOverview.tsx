'use client';

import dynamic from 'next/dynamic';
import { formatBudget } from '@/lib/utils';
import type { BudgetData } from '@/types';

const ProgramBudgetDonutChart = dynamic(() => import('@/components/charts/ProgramBudgetDonutChart'), { ssr: false });
const BudgetCategoryRatioChart = dynamic(() => import('@/components/charts/BudgetCategoryRatioChart'), { ssr: false });

interface BudgetOverviewProps {
  budget: BudgetData;
}

export default function BudgetOverview({ budget }: BudgetOverviewProps) {
  const ratioData = [
    { label: '직접비', ratio: budget.byCategory.directCost?.ratio ?? 0 },
    { label: '인건비', ratio: budget.byCategory.laborCost?.ratio ?? 0 },
    { label: '간접비', ratio: budget.byCategory.indirectCost?.ratio ?? 0 },
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded bg-[#6366F1]" />
            <h2 className="text-lg font-semibold">프로그램 예산 비중</h2>
          </div>
          <p className="text-xs text-slate-500">(단위: 천원)</p>
        </div>
        <div className="relative">
          <ProgramBudgetDonutChart data={budget.byProgram} />
          <p className="pointer-events-none absolute inset-0 mt-[128px] text-center text-sm font-semibold text-slate-700">총 {formatBudget(budget.totalBudget)}</p>
        </div>
      </article>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded bg-[#6366F1]" />
            <h2 className="text-lg font-semibold">예산 구성 비율</h2>
          </div>
          <p className="text-xs text-slate-500">(단위: %)</p>
        </div>
        <BudgetCategoryRatioChart data={ratioData} />
      </article>
    </section>
  );
}
