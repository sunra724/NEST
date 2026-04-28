'use client';

import { Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { BudgetData, KpiData, KpiItem, OverviewData } from '@/types';

interface QuarterReportViewProps {
  overview: OverviewData;
  kpi: KpiData;
  budget: BudgetData;
}

const quarterOptions = [
  { id: 1, label: '1분기 1~3월', period: '2026.01~03' },
  { id: 2, label: '2분기 4~6월', period: '2026.04~06' },
  { id: 3, label: '3분기 7~9월', period: '2026.07~09' },
  { id: 4, label: '4분기 10~12월', period: '2026.10~12' },
];

function sliceKpis(items: KpiItem[], count: number) {
  return items.slice(0, count);
}

export default function QuarterReportView({ overview, kpi, budget }: QuarterReportViewProps) {
  const [quarter, setQuarter] = useState(1);
  const selectedQuarter = quarterOptions.find((item) => item.id === quarter) ?? quarterOptions[0];

  const kpiRows = useMemo(() => {
    const rows = [
      ...sliceKpis(kpi.programs.N?.kpis ?? [], 3).map((item) => ({ group: 'N', ...item })),
      ...sliceKpis(kpi.programs.E?.kpis ?? [], 3).map((item) => ({ group: 'E', ...item })),
      ...sliceKpis(kpi.programs.S?.kpis ?? [], 3).map((item) => ({ group: 'S', ...item })),
      ...sliceKpis(kpi.programs.T?.kpis ?? [], 3).map((item) => ({ group: 'T', ...item })),
      ...sliceKpis(kpi.common.kpis ?? [], 1).map((item) => ({ group: '공통', ...item })),
    ];
    return rows;
  }, [kpi]);

  const totalBudget = budget.byProgram.reduce(
    (acc, row) => {
      acc.budget += row.budget;
      acc.spent += row.spent;
      return acc;
    },
    { budget: 0, spent: 0 },
  );

  return (
    <div className="space-y-4">
      <section className="no-print rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {quarterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setQuarter(option.id)}
                className={`rounded-md px-3 py-2 text-sm ${option.id === quarter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            PDF 인쇄
          </Button>
        </div>
      </section>

      <section className="report-body mx-auto max-w-[794px] bg-white p-[60px] shadow-2xl">
        <header className="mb-8 border-b border-slate-200 pb-5">
          <div className="mb-3 h-[5px] w-24 rounded bg-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">청년 N.E.S.T. 분기 보고서</h1>
          <p className="mt-2 text-sm text-slate-600">
            분기: {selectedQuarter.label} ({selectedQuarter.period}) | 작성일: 2026.02 | 기관: 대구광역시 남구 / 협동조합 소이랩
          </p>
        </header>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold">1. 사업 개요</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p>사업명: {overview.projectName}</p>
              <p>총예산: {formatNumber(overview.totalBudget)}천원</p>
              <p>기간: 2026.01~12</p>
              <p>운영기관: {overview.operator}</p>
            </div>
            <div className="mt-3 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>세부사업</TableHead>
                    <TableHead>대상</TableHead>
                    <TableHead className="text-right">예산(천원)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>{program.name}</TableCell>
                      <TableCell>{program.target}</TableCell>
                      <TableCell className="text-right">{formatNumber(program.budget)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">2. N.E.S.T. 흐름도</h2>
            <p className="rounded-md border border-slate-200 p-3 text-sm text-slate-700">[N] 관계형성 → [E] 역량강화 → [S] 자립기반 → [T] 정주안전망</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">3. KPI 달성 현황</h2>
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
                    <TableRow key={row.id}>
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
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">4. 예산 집행 현황</h2>
              <p className="text-xs text-slate-500">(단위: 천원)</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사업</TableHead>
                    <TableHead className="text-right">예산</TableHead>
                    <TableHead className="text-right">집행</TableHead>
                    <TableHead className="text-right">잔액</TableHead>
                    <TableHead className="text-right">집행률</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budget.byProgram.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.budget)}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.spent)}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.budget - row.spent)}</TableCell>
                      <TableCell className="text-right">{formatPercent(row.spent, row.budget)}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50 font-semibold">
                    <TableCell>합계</TableCell>
                    <TableCell className="text-right">{formatNumber(totalBudget.budget)}</TableCell>
                    <TableCell className="text-right">{formatNumber(totalBudget.spent)}</TableCell>
                    <TableCell className="text-right">{formatNumber(totalBudget.budget - totalBudget.spent)}</TableCell>
                    <TableCell className="text-right">{formatPercent(totalBudget.spent, totalBudget.budget)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">5. 분기별 주요 성과</h2>
            <div className="space-y-2 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              <p>1)</p>
              <p>2)</p>
              <p>3)</p>
              <p>4)</p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">6. 특이사항 및 건의</h2>
            <div className="space-y-2 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              <p>1)</p>
              <p>2)</p>
              <p>3)</p>
            </div>
          </section>
        </div>

        <footer className="mt-8 border-t border-slate-200 pt-3 text-center text-xs text-slate-500">
          1 / 1 · 대구광역시 남구 인구총괄과 | 협동조합 소이랩
        </footer>
      </section>
    </div>
  );
}
