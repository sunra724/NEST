'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBudgetExecutionStatusLabel, getBudgetExecutionStatusVariant, normalizeBudgetExecutionStatus } from '@/lib/budget-execution-status';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { BudgetData, BudgetDetailApprovalStatus, BudgetDetailItem } from '@/types';

interface BudgetDetailViewProps {
  budget: BudgetData;
}

const PROGRAMS = [
  { id: 'all', label: '전체' },
  { id: 'N', label: 'N' },
  { id: 'E', label: 'E' },
  { id: 'S', label: 'S' },
  { id: 'T', label: 'T' },
];

const EMPTY_ITEMS: BudgetDetailItem[] = [];

function wonToThousand(value: number) {
  return Math.round(value / 1000);
}

function StatusBadge({ status }: { status: BudgetDetailApprovalStatus }) {
  return <Badge variant={getBudgetExecutionStatusVariant(status)}>{getBudgetExecutionStatusLabel(status)}</Badge>;
}

function SummaryBox({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </article>
  );
}

function sumBy(items: BudgetDetailItem[], getter: (item: BudgetDetailItem) => number) {
  return items.reduce((acc, item) => acc + getter(item), 0);
}

export default function BudgetDetailView({ budget }: BudgetDetailViewProps) {
  const [programId, setProgramId] = useState('all');
  const [category, setCategory] = useState('all');
  const items = budget.detailItems ?? EMPTY_ITEMS;

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => (programId === 'all' || item.programId === programId) && (category === 'all' || item.category === category));
  }, [items, programId, category]);

  const planned = sumBy(filtered, (item) => item.plannedAmountWon);
  const actual = sumBy(filtered, (item) => item.actualAmountWon);
  const requestedCount = filtered.filter((item) => normalizeBudgetExecutionStatus(item.approvalStatus) === 'requested').length;
  const paidCount = filtered.filter((item) => normalizeBudgetExecutionStatus(item.approvalStatus) === 'paid').length;

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Budget Detail</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">예산서 세부내역</h1>
            <p className="mt-2 text-sm text-slate-600">
              남구청 제출 예산서를 기준으로 세부 품목, 보탬e 비목, 지출 예정월, 집행상태를 추적합니다.
            </p>
          </div>
          <Badge variant="outline">{budget.budgetDetailSource?.fileName ?? '예산서'} · {budget.budgetDetailSource?.itemCount ?? items.length}개 항목</Badge>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <SummaryBox label="계획 예산" value={`${formatNumber(wonToThousand(planned))}천원`} helper={`${formatNumber(filtered.length)}개 항목`} />
        <SummaryBox label="실집행" value={`${formatNumber(wonToThousand(actual))}천원`} helper={`계획 대비 ${formatPercent(actual, planned)}%`} />
        <SummaryBox label="집행요청" value={`${formatNumber(requestedCount)}건`} helper="집행상태 기준" />
        <SummaryBox label="집행완료" value={`${formatNumber(paidCount)}건`} helper="집행상태 기준" />
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {PROGRAMS.map((program) => (
            <button
              key={program.id}
              className={`rounded-md px-3 py-2 text-sm ${programId === program.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setProgramId(program.id)}
            >
              {program.label}
            </button>
          ))}
          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? '전체 구분' : option}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사업</TableHead>
                <TableHead>구분</TableHead>
                <TableHead>품목</TableHead>
                <TableHead>보탬e 비목</TableHead>
                <TableHead>예정월</TableHead>
                <TableHead className="text-right">계획</TableHead>
                <TableHead className="text-right">실집행</TableHead>
                <TableHead>집행상태</TableHead>
                <TableHead>메모</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.programId}</TableCell>
                  <TableCell>
                    <p>{item.category}</p>
                    <p className="text-xs text-slate-400">{item.subcategory}</p>
                  </TableCell>
                  <TableCell className="min-w-64">
                    <p className="font-medium text-slate-800">{item.item}</p>
                    {item.detailItem ? <p className="mt-1 text-xs text-slate-500">{item.detailItem}</p> : null}
                  </TableCell>
                  <TableCell>{item.botemCategory || '-'}</TableCell>
                  <TableCell>{item.plannedMonth || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(item.plannedAmountWon)}원</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(item.actualAmountWon)}원</TableCell>
                  <TableCell>
                    <StatusBadge status={item.approvalStatus} />
                  </TableCell>
                  <TableCell className="min-w-48 text-sm text-slate-600">{item.memo || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
