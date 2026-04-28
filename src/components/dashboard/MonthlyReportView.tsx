'use client';

import { AlertTriangle, CalendarDays, FileCheck2, HandCoins, Home, Printer, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { BudgetData, KpiData, MonthlyReportEntry, OperationsData, OverviewData, TimelineData } from '@/types';

interface MonthlyReportViewProps {
  overview: OverviewData;
  kpi: KpiData;
  budget: BudgetData;
  timeline: TimelineData;
  operations: OperationsData;
}

const MONTHS = [
  { value: '2026-03', label: '3월' },
  { value: '2026-04', label: '4월' },
  { value: '2026-05', label: '5월' },
  { value: '2026-06', label: '6월' },
  { value: '2026-07', label: '7월' },
  { value: '2026-08', label: '8월' },
  { value: '2026-09', label: '9월' },
  { value: '2026-10', label: '10월' },
  { value: '2026-11', label: '11월' },
  { value: '2026-12', label: '12월' },
];

const taskStatusLabel = {
  pending: '예정',
  in_progress: '진행중',
  completed: '완료',
};

const operationStatusLabel = {
  not_started: '대기',
  in_progress: '진행',
  completed: '완료',
  risk: '주의',
};

function getMonthNumber(month: string) {
  return Number(month.slice(5, 7));
}

function EmptyMemo({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-400">{children}</p>;
}

function MetricBox({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string; helper: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </article>
  );
}

function memoForMonth(reports: MonthlyReportEntry[] | undefined, month: string): MonthlyReportEntry {
  return (
    reports?.find((entry) => entry.month === month) ?? {
      month,
      highlights: '',
      issues: '',
      nextPlans: '',
      supportNeeds: '',
      updatedAt: '',
    }
  );
}

export default function MonthlyReportView({ overview, kpi, budget, timeline, operations }: MonthlyReportViewProps) {
  const [month, setMonth] = useState('2026-04');
  const monthNumber = getMonthNumber(month);
  const selectedMonth = MONTHS.find((item) => item.value === month) ?? MONTHS[1];
  const memo = memoForMonth(operations.monthlyReports, month);

  const monthTasks = useMemo(() => {
    return timeline.categories.flatMap((category) =>
      category.tasks
        .filter((task) => task.months.includes(monthNumber))
        .map((task) => ({
          category: category.label,
          color: category.color,
          ...task,
        })),
    );
  }, [timeline, monthNumber]);

  const kpiRows = useMemo(() => {
    return [
      ...(kpi.programs.N?.kpis ?? []).map((item) => ({ group: 'N', ...item })),
      ...(kpi.programs.E?.kpis ?? []).map((item) => ({ group: 'E', ...item })),
      ...(kpi.programs.S?.kpis ?? []).map((item) => ({ group: 'S', ...item })),
      ...(kpi.programs.T?.kpis ?? []).map((item) => ({ group: 'T', ...item })),
      ...(kpi.common.kpis ?? []).map((item) => ({ group: '공통', ...item })),
    ];
  }, [kpi]);

  const monthlyBudget = budget.monthlyExecution.find((entry) => entry.month === month);
  const budgetTotal = budget.byProgram.reduce(
    (acc, item) => {
      acc.budget += item.budget;
      acc.spent += item.spent;
      return acc;
    },
    { budget: 0, spent: 0 },
  );

  const evidenceItems = operations.evidence.flatMap((group) => group.items.map((item) => ({ program: group.program, programLabel: group.label, ...item })));
  const missingEvidence = evidenceItems.filter((item) => item.status !== 'completed').slice(0, 10);
  const riskEvidence = evidenceItems.filter((item) => item.status === 'risk').length;
  const caseCurrent = operations.casePipeline.reduce((acc, item) => acc + item.current, 0);
  const caseTarget = operations.casePipeline.reduce((acc, item) => acc + item.target, 0);

  return (
    <div className="space-y-5">
      <section className="no-print rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {MONTHS.map((option) => (
              <button
                key={option.value}
                onClick={() => setMonth(option.value)}
                className={`rounded-md px-3 py-2 text-sm ${option.value === month ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            인쇄
          </Button>
        </div>
      </section>

      <section className="report-body mx-auto max-w-[980px] bg-white p-8 shadow-xl">
        <header className="mb-6 border-b border-slate-200 pb-5">
          <div className="mb-3 h-[5px] w-24 rounded bg-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">N.E.S.T. 월간 운영보고</h1>
          <p className="mt-2 text-sm text-slate-600">
            대상월: {selectedMonth.value} ({selectedMonth.label}) | 기준일: {operations.lastUpdated} | 운영: {overview.operator}
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-4">
          <MetricBox
            icon={<CalendarDays className="h-4 w-4" />}
            label="월간 일정"
            value={`${formatNumber(monthTasks.length)}건`}
            helper={`완료 ${formatNumber(monthTasks.filter((task) => task.status === 'completed').length)}건`}
          />
          <MetricBox
            icon={<HandCoins className="h-4 w-4" />}
            label="월 예산"
            value={`${formatPercent(monthlyBudget?.actual ?? 0, monthlyBudget?.planned ?? 0)}%`}
            helper={`실집행 ${formatNumber(monthlyBudget?.actual ?? 0)} / 계획 ${formatNumber(monthlyBudget?.planned ?? 0)}천원`}
          />
          <MetricBox
            icon={<FileCheck2 className="h-4 w-4" />}
            label="증빙 미비"
            value={`${formatNumber(missingEvidence.length)}건`}
            helper={`보완필요 ${formatNumber(riskEvidence)}건`}
          />
          <MetricBox
            icon={<Home className="h-4 w-4" />}
            label="주거 케이스"
            value={`${formatPercent(caseCurrent, caseTarget)}%`}
            helper={`${formatNumber(caseCurrent)} / ${formatNumber(caseTarget)}건·회`}
          />
        </div>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="h-5 w-5 text-slate-500" />
              1. 월간 추진 일정
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>구분</TableHead>
                    <TableHead>과업</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthTasks.map((task) => (
                    <TableRow key={`${task.category}-${task.name}`}>
                      <TableCell>
                        <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: task.color }} />
                        {task.category}
                      </TableCell>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{taskStatusLabel[task.status]}</TableCell>
                    </TableRow>
                  ))}
                  {monthTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-400">
                        해당 월 일정이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              2. KPI 누적 현황
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>구분</TableHead>
                    <TableHead>KPI</TableHead>
                    <TableHead className="text-right">목표</TableHead>
                    <TableHead className="text-right">현재</TableHead>
                    <TableHead className="text-right">달성률</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpiRows.map((row) => (
                    <TableRow key={`${row.group}-${row.id}`}>
                      <TableCell>{row.group}</TableCell>
                      <TableCell>{row.label}</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(row.target)}
                        {row.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(row.current)}
                        {row.unit}
                      </TableCell>
                      <TableCell className="text-right">{formatPercent(row.current, row.target)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <HandCoins className="h-5 w-5 text-slate-500" />
              3. 예산 집행
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">해당 월 실집행</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(monthlyBudget?.actual ?? 0)}천원</p>
                <p className="mt-1 text-xs text-slate-500">월 계획 {formatNumber(monthlyBudget?.planned ?? 0)}천원</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">누적 집행</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatPercent(budgetTotal.spent, budgetTotal.budget)}%</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatNumber(budgetTotal.spent)} / {formatNumber(budgetTotal.budget)}천원
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-slate-500" />
              4. 증빙 미비 및 보완사항
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사업</TableHead>
                    <TableHead>증빙 항목</TableHead>
                    <TableHead>출처</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>메모</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missingEvidence.map((item) => (
                    <TableRow key={`${item.program}-${item.name}`}>
                      <TableCell>{item.program}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.source}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'risk' ? 'amber' : 'pending'}>{operationStatusLabel[item.status]}</Badge>
                      </TableCell>
                      <TableCell className="min-w-56">{item.memo || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {missingEvidence.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400">
                        미비 증빙이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">5. 관리자 월간 코멘트</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">주요 성과</h3>
                {memo.highlights ? <p className="whitespace-pre-wrap text-sm text-slate-700">{memo.highlights}</p> : <EmptyMemo>관리자 입력 대기</EmptyMemo>}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">이슈/리스크</h3>
                {memo.issues ? <p className="whitespace-pre-wrap text-sm text-slate-700">{memo.issues}</p> : <EmptyMemo>관리자 입력 대기</EmptyMemo>}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">다음 달 계획</h3>
                {memo.nextPlans ? <p className="whitespace-pre-wrap text-sm text-slate-700">{memo.nextPlans}</p> : <EmptyMemo>관리자 입력 대기</EmptyMemo>}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">지원/보완 필요</h3>
                {memo.supportNeeds ? <p className="whitespace-pre-wrap text-sm text-slate-700">{memo.supportNeeds}</p> : <EmptyMemo>관리자 입력 대기</EmptyMemo>}
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-8 border-t border-slate-200 pt-3 text-center text-xs text-slate-500">
          {overview.projectName} · 월간 운영보고 · {selectedMonth.value}
        </footer>
      </section>
    </div>
  );
}
