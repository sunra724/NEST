import type { Metadata } from 'next';
import Link from 'next/link';
import BudgetChartsSection from '@/components/dashboard/BudgetChartsSection';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import SubsidySpendingGuide from '@/components/dashboard/SubsidySpendingGuide';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loadBudgetData } from '@/lib/budget-data';
import { NEST_COLORS } from '@/lib/constants';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { BudgetDetailItem, BudgetProgram } from '@/types';

export const metadata: Metadata = {
  title: '예산 관리 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

const WON_PER_THOUSAND = 1000;

function thousandWonToWon(value: number) {
  return value * WON_PER_THOUSAND;
}

function sumDetailItems(items: BudgetDetailItem[], predicate: (item: BudgetDetailItem) => boolean, key: 'plannedAmountWon' | 'actualAmountWon') {
  return items.filter(predicate).reduce((acc, item) => acc + item[key], 0);
}

function getProgramAmountsWon(program: BudgetProgram, detailItems: BudgetDetailItem[]) {
  const hasDetails = detailItems.length > 0;
  const isProgramItem = (item: BudgetDetailItem) => item.programId === program.id;

  return {
    budget: hasDetails ? sumDetailItems(detailItems, isProgramItem, 'plannedAmountWon') : thousandWonToWon(program.budget),
    direct: hasDetails ? sumDetailItems(detailItems, (item) => isProgramItem(item) && item.category === '직접비', 'plannedAmountWon') : thousandWonToWon(program.direct),
    indirect: hasDetails ? sumDetailItems(detailItems, (item) => isProgramItem(item) && item.category === '간접비', 'plannedAmountWon') : thousandWonToWon(program.indirect),
    labor: hasDetails ? sumDetailItems(detailItems, (item) => isProgramItem(item) && item.category === '인건비', 'plannedAmountWon') : thousandWonToWon(program.labor),
    spent: hasDetails ? sumDetailItems(detailItems, isProgramItem, 'actualAmountWon') : thousandWonToWon(program.spent),
  };
}

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
    return await loadBudgetData();
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

  const detailItems = budget.detailItems ?? [];
  const hasDetailItems = detailItems.length > 0;
  const programAmounts = budget.byProgram.map((program) => ({
    ...program,
    amountsWon: getProgramAmountsWon(program, detailItems),
  }));

  const totalBudget = hasDetailItems ? sumDetailItems(detailItems, () => true, 'plannedAmountWon') : thousandWonToWon(budget.totalBudget);
  const totalSpent = hasDetailItems ? sumDetailItems(detailItems, () => true, 'actualAmountWon') : thousandWonToWon(budget.byProgram.reduce((acc, item) => acc + item.spent, 0));
  const totalRemaining = totalBudget - totalSpent;
  const spendPercent = formatPercent(totalSpent, totalBudget);

  const totals = programAmounts.reduce(
    (acc, item) => {
      acc.budget += item.amountsWon.budget;
      acc.direct += item.amountsWon.direct;
      acc.indirect += item.amountsWon.indirect;
      acc.labor += item.amountsWon.labor;
      acc.spent += item.amountsWon.spent;
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
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-500">(단위: 원)</p>
              {budget.detailItems?.length ? (
                <Link href="/budget/detail" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  예산서 세부내역
                </Link>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <BudgetSummaryCard title="총 예산" value={totalBudget} percent={100} className="bg-gradient-to-br from-violet-100 to-fuchsia-100" />
            <BudgetSummaryCard title="집행액" value={totalSpent} percent={spendPercent} className="border border-blue-200 bg-blue-50" />
            <BudgetSummaryCard title="잔액" value={totalRemaining} percent={formatPercent(totalRemaining, totalBudget)} className="border border-slate-200 bg-slate-50" />
          </div>
        </section>

        <SubsidySpendingGuide />

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">프로그램별 예산 테이블</h2>
            <p className="text-sm text-slate-500">(단위: 원)</p>
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
                {programAmounts.map((item) => {
                  const rowRate = formatPercent(item.amountsWon.spent, item.amountsWon.budget);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NEST_COLORS[item.id as 'N' | 'E' | 'S' | 'T']?.primary ?? '#64748B' }} />
                          <span>{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.amountsWon.budget)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.amountsWon.direct)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.amountsWon.indirect)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.amountsWon.labor)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.amountsWon.spent === 0 ? <Badge variant="pending">미집행</Badge> : formatNumber(item.amountsWon.spent)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{rowRate}%</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.amountsWon.budget - item.amountsWon.spent)}</TableCell>
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
