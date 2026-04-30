import { formatBudget, formatNumber, formatPercent } from '@/lib/utils';
import { NEST_COLORS } from '@/lib/constants';
import type { BudgetData } from '@/types';

interface BudgetOverviewProps {
  budget: BudgetData;
}

const categoryMeta = [
  { key: 'directCost', label: '직접비', color: NEST_COLORS.N.primary },
  { key: 'laborCost', label: '인건비', color: NEST_COLORS.E.primary },
  { key: 'indirectCost', label: '간접비', color: NEST_COLORS.S.primary },
] as const;

const programColor: Record<string, string> = {
  N: NEST_COLORS.N.primary,
  E: NEST_COLORS.E.primary,
  S: NEST_COLORS.S.primary,
  T: NEST_COLORS.T.primary,
};

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export default function BudgetOverview({ budget }: BudgetOverviewProps) {
  const totalSpent = budget.byProgram.reduce((sum, program) => sum + program.spent, 0);
  const totalExecutionRate = formatPercent(totalSpent, budget.totalBudget);
  const categoryRows = categoryMeta.map((meta) => {
    const item = budget.byCategory[meta.key];
    const planned = item?.budget ?? 0;
    const spent = item?.spent ?? 0;

    return {
      ...meta,
      planned,
      spent,
      plannedRatio: formatPercent(planned, budget.totalBudget),
      spentRatio: formatPercent(spent, totalSpent),
    };
  });

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded bg-[#6366F1]" />
            <h2 className="text-lg font-semibold">프로그램별 예산 집행 현황</h2>
          </div>
          <p className="text-xs text-slate-500">단위: 천원</p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs text-slate-500">계획</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatBudget(budget.totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">실집행</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatBudget(totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">집행률</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{totalExecutionRate}%</p>
          </div>
        </div>

        <div className="space-y-4">
          {budget.byProgram.map((program) => {
            const rate = formatPercent(program.spent, program.budget);
            const remaining = Math.max(program.budget - program.spent, 0);
            const color = programColor[program.id] ?? '#64748B';

            return (
              <div key={program.id} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      [{program.id}] {program.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      실집행 {formatNumber(program.spent)} / 계획 {formatNumber(program.budget)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-900">{rate}%</p>
                    <p className="text-xs text-slate-500">잔액 {formatNumber(remaining)}</p>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full" style={{ width: `${clampPercent(rate)}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </article>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded bg-[#6366F1]" />
            <h2 className="text-lg font-semibold">예산 구성 및 집행 비율</h2>
          </div>
          <p className="text-xs text-slate-500">단위: %</p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs text-slate-500">계획 구성</p>
            <p className="mt-1 text-lg font-bold text-slate-900">100%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">실집행 합계</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatBudget(totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">전체 집행률</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{totalExecutionRate}%</p>
          </div>
        </div>

        <div className="space-y-5">
          {categoryRows.map((row) => (
            <div key={row.key} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{row.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    계획 {formatNumber(row.planned)} / 실집행 {formatNumber(row.spent)}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>계획 {row.plannedRatio}%</p>
                  <p>집행 {row.spentRatio}%</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-300" style={{ width: `${clampPercent(row.plannedRatio)}%` }} />
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full" style={{ width: `${clampPercent(row.spentRatio)}%`, backgroundColor: row.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-4 rounded-full bg-slate-300" />
            계획 비중
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-4 rounded-full bg-[#6366F1]" />
            실집행 비중
          </span>
        </div>
      </article>
    </section>
  );
}
