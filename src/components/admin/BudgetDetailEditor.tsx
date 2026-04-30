'use client';

import { Check, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { BudgetData, BudgetDetailApprovalStatus, BudgetDetailItem } from '@/types';

interface Props {
  data: BudgetData;
  onSaved: () => void;
}

const PROGRAMS = [
  { id: 'all', label: '전체' },
  { id: 'N', label: 'N' },
  { id: 'E', label: 'E' },
  { id: 'S', label: 'S' },
  { id: 'T', label: 'T' },
];

const STATUS_OPTIONS: { value: BudgetDetailApprovalStatus; label: string }[] = [
  { value: 'not_requested', label: '품의 전' },
  { value: 'requested', label: '품의 요청' },
  { value: 'approved', label: '품의 승인' },
  { value: 'paid', label: '지출완료' },
  { value: 'needs_review', label: '보완필요' },
];

const EMPTY_ITEMS: BudgetDetailItem[] = [];

interface RowEdit {
  actualAmountWon: number;
  approvalStatus: BudgetDetailApprovalStatus;
  memo: string;
}

function getStatusLabel(status: BudgetDetailApprovalStatus) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export default function BudgetDetailEditor({ data, onSaved }: Props) {
  const [programId, setProgramId] = useState('all');
  const [category, setCategory] = useState('all');
  const [edits, setEdits] = useState<Record<string, RowEdit>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const items = data.detailItems ?? EMPTY_ITEMS;

  const categories = useMemo(() => ['all', ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))], [items]);
  const filtered = useMemo(
    () => items.filter((item) => (programId === 'all' || item.programId === programId) && (category === 'all' || item.category === category)),
    [items, programId, category],
  );

  const planned = filtered.reduce((acc, item) => acc + item.plannedAmountWon, 0);
  const actual = filtered.reduce((acc, item) => acc + item.actualAmountWon, 0);

  function getEdit(itemId: string) {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return null;
    return edits[itemId] ?? { actualAmountWon: item.actualAmountWon, approvalStatus: item.approvalStatus, memo: item.memo };
  }

  async function saveItem(itemId: string) {
    const edit = getEdit(itemId);
    if (!edit) return;
    setSaving(itemId);
    try {
      const res = await fetch('/api/admin/budget-detail', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, ...edit }),
      });
      if (!res.ok) throw new Error();
      toast.success('예산 상세 항목을 저장했습니다');
      setEdits((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      onSaved();
    } catch {
      toast.error('저장에 실패했습니다');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-white p-4">
        <div className="mb-3 grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">필터 기준 계획</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(planned)}원</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">필터 기준 실집행</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(actual)}원</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">진행률</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatPercent(actual, planned)}%</p>
          </div>
        </div>
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

      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사업</TableHead>
                <TableHead>품목</TableHead>
                <TableHead>보탬e 비목</TableHead>
                <TableHead className="text-right">계획</TableHead>
                <TableHead className="text-right">실집행</TableHead>
                <TableHead>품의상태</TableHead>
                <TableHead>메모</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const edit = getEdit(item.id);
                if (!edit) return null;
                const changed =
                  edit.actualAmountWon !== item.actualAmountWon || edit.approvalStatus !== item.approvalStatus || edit.memo !== item.memo;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p>{item.programId}</p>
                      <p className="text-xs text-slate-400">{item.category}/{item.subcategory}</p>
                    </TableCell>
                    <TableCell className="min-w-64">
                      <p className="font-medium text-slate-800">{item.item}</p>
                      {item.detailItem ? <p className="mt-1 text-xs text-slate-500">{item.detailItem}</p> : null}
                      {item.plannedMonth ? <p className="mt-1 text-xs text-slate-400">예정월 {item.plannedMonth}</p> : null}
                    </TableCell>
                    <TableCell>{item.botemCategory || '-'}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(item.plannedAmountWon)}원</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="w-32 text-right tabular-nums"
                        value={edit.actualAmountWon}
                        onChange={(event) => setEdits((prev) => ({ ...prev, [item.id]: { ...edit, actualAmountWon: Number(event.target.value) } }))}
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className="h-10 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
                        value={edit.approvalStatus}
                        onChange={(event) =>
                          setEdits((prev) => ({ ...prev, [item.id]: { ...edit, approvalStatus: event.target.value as BudgetDetailApprovalStatus } }))
                        }
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-slate-400">현재 {getStatusLabel(item.approvalStatus)}</p>
                    </TableCell>
                    <TableCell>
                      <Input
                        className="w-56"
                        placeholder="보탬e 번호, 품의 메모 등"
                        value={edit.memo}
                        onChange={(event) => setEdits((prev) => ({ ...prev, [item.id]: { ...edit, memo: event.target.value } }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant={changed ? 'default' : 'outline'} disabled={!changed || saving === item.id} onClick={() => saveItem(item.id)}>
                        {saving === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : changed ? '저장' : <Check className="h-3 w-3 text-slate-400" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
