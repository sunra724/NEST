import type { Metadata } from 'next';
import BudgetChartsSection from '@/components/dashboard/BudgetChartsSection';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loadJSON } from '@/lib/data';
import { NEST_COLORS } from '@/lib/constants';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { BudgetData } from '@/types';

export const metadata: Metadata = {
  title: '예산 관리 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

function BudgetSummaryCard({
  title,
  value,
  percent,
  className,
}: {
  title: string;
  value: number;
  percent: number;
  className: string;
}) {
  return (
    <article className={`rounded-xl p-5 ${className}`}>
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{formatNumber(value)}</p>
      <div className="mt-4 space-y-1">
        <Progress value={percent} className="h-2.5 bg-slate-200" indicatorColor="#2563EB" />
        <p className="text-right text-xs text-slate-600">{percent}%</p>
      </div>
    </article>
  );
}

async function getBudgetData() {
  try {
    return await loadJSON<BudgetData>('budget.json');
  } catch {
    return null;
  }
}

export default async function BudgetPage() {
  const budget = await getBudgetData();

  if (!budget) {
    return <ErrorState />;
  }

  if (!budget.byProgram.length) {
    return <EmptyState />;
  }

  const totalBudget = budget.totalBudget;
  const totalSpent = budget.byProgram.reduce((acc, item) => acc + item.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const spendPercent = formatPercent(totalSpent, totalBudget);

  const totals = budget.byProgram.reduce(
    (acc, item) => {
      acc.budget += item.budget;
      acc.direct += item.direct;
      acc.indirect += item.indirect;
      acc.labor += item.labor;
      acc.spent += item.spent;
      return acc;
    },
    { budget: 0, direct: 0, indirect: 0, labor: 0, spent: 0 },
  );
  const totalRemainRow = totals.budget - totals.spent;

  return (
      <div className="space-y-8">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded bg-[#6366F1]" />
              <h2 className="text-lg font-semibold">예산 총괄</h2>
            </div>
            <p className="text-sm text-slate-500">(단위: 천원)</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <BudgetSummaryCard title="총 예산" value={totalBudget} percent={100} className="bg-gradient-to-br from-violet-100 to-fuchsia-100" />
            <BudgetSummaryCard title="집행액" value={totalSpent} percent={spendPercent} className="border border-blue-200 bg-blue-50" />
            <BudgetSummaryCard title="잔액" value={totalRemaining} percent={formatPercent(totalRemaining, totalBudget)} className="border border-slate-200 bg-slate-50" />
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">프로그램별 예산 테이블</h2>
            <p className="text-sm text-slate-500">(단위: 천원)</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>프로그램</TableHead>
                  <TableHead className="text-right">총예산</TableHead>
                  <TableHead className="text-right">직접비</TableHead>
                  <TableHead className="text-right">간접비</TableHead>
                  <TableHead className="text-right">인건비</TableHead>
                  <TableHead className="text-right">집행액</TableHead>
                  <TableHead className="text-right">집행률</TableHead>
                  <TableHead className="text-right">잔액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.byProgram.map((item) => {
                  const rowRate = formatPercent(item.spent, item.budget);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NEST_COLORS[item.id as 'N' | 'E' | 'S' | 'T']?.primary ?? '#64748B' }} />
                          <span>{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.budget)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.direct)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.indirect)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.labor)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.spent === 0 ? <Badge variant="pending">미집행</Badge> : formatNumber(item.spent)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{rowRate}%</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.budget - item.spent)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell>합계</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.budget)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.direct)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.indirect)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.labor)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totals.spent)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPercent(totals.spent, totals.budget)}%</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(totalRemainRow)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </section>

        <BudgetChartsSection budget={budget} />

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">인건비 상세</h2>
          <Accordion type="single" collapsible defaultValue="labor">
            <AccordionItem value="labor">
              <AccordionTrigger>
                <div className="flex flex-wrap items-center gap-5">
                  <span>총액 {formatNumber(budget.laborDetail.total)}천원</span>
                  <span className="text-xs text-slate-500">PM {formatNumber(budget.laborDetail.pmSalary)}</span>
                  <span className="text-xs text-slate-500">관리자 {formatNumber(budget.laborDetail.managerSalary)}</span>
                  <span className="text-xs text-slate-500">부대경비 {formatNumber(budget.laborDetail.overhead)}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>성명</TableHead>
                        <TableHead>직책</TableHead>
                        <TableHead>담당사업</TableHead>
                        <TableHead>역할</TableHead>
                        <TableHead>투입률</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budget.laborDetail.staff.map((staff) => (
                        <TableRow key={`${staff.name}-${staff.program}`}>
                          <TableCell>{staff.name}</TableCell>
                          <TableCell>{staff.title}</TableCell>
                          <TableCell>{staff.program}</TableCell>
                          <TableCell>{staff.role}</TableCell>
                          <TableCell>{staff.rate ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
  );
}
