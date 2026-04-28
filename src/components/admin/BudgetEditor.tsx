'use client';

import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { NEST_COLORS, type ProgramId } from '@/lib/constants';
import type { BudgetData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  data: BudgetData;
  onSaved: () => void;
}

export default function BudgetEditor({ data, onSaved }: Props) {
  const [programEdits, setProgramEdits] = useState<Record<string, number>>({});
  const [monthlyEdits, setMonthlyEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function saveProgramSpent(programId: string, spent: number) {
    setSaving(`prog_${programId}`);
    try {
      const res = await fetch('/api/admin/budget', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'program', programId, spent }),
      });
      if (!res.ok) throw new Error();
      toast.success('저장되었습니다');
      onSaved();
    } catch {
      toast.error('저장 실패');
    } finally {
      setSaving(null);
    }
  }

  async function saveMonthlyActual(month: string, actual: number) {
    setSaving(`month_${month}`);
    try {
      const res = await fetch('/api/admin/budget', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'monthly', month, actual }),
      });
      if (!res.ok) throw new Error();
      toast.success('저장되었습니다');
      onSaved();
    } catch {
      toast.error('저장 실패');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-600">프로그램별 집행액 (단위: 천원)</h3>
        <div className="space-y-2">
          {data.byProgram.map((program) => {
            const color = NEST_COLORS[program.id as ProgramId];
            const editVal = programEdits[program.id] ?? program.spent;
            const changed = editVal !== program.spent;
            const pct = program.budget > 0 ? Math.round((editVal / program.budget) * 100) : 0;

            return (
              <div key={program.id} className="flex items-center gap-3 rounded-xl border bg-white p-4 transition-colors hover:border-slate-300">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold text-white"
                  style={{ backgroundColor: color.primary }}
                >
                  {program.id}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{program.name}</span>
                    <span className="text-xs text-slate-400">예산 {program.budget.toLocaleString()}천원</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: color.primary,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{pct}%</span>
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  className="w-28 shrink-0 text-right tabular-nums"
                  value={editVal}
                  onChange={(e) => setProgramEdits((prev) => ({ ...prev, [program.id]: Number(e.target.value) }))}
                />
                <Button
                  size="sm"
                  variant={changed ? 'default' : 'outline'}
                  className="w-16 shrink-0"
                  disabled={!changed || saving === `prog_${program.id}`}
                  onClick={() => saveProgramSpent(program.id, editVal)}
                >
                  {saving === `prog_${program.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : changed ? '저장' : <Check className="h-3 w-3 text-slate-400" />}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-600">월별 실집행액 (단위: 천원)</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {data.monthlyExecution.map((entry) => {
            const monthLabel = `${entry.month.replace('2026-', '')}월`;
            const editVal = monthlyEdits[entry.month] ?? entry.actual;
            const changed = editVal !== entry.actual;

            return (
              <div key={entry.month} className="space-y-2 rounded-xl border bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{monthLabel}</span>
                  <span className="text-xs text-slate-400">계획 {entry.planned.toLocaleString()}</span>
                </div>
                <Input
                  type="number"
                  min={0}
                  className="w-full text-right text-sm tabular-nums"
                  placeholder="0"
                  value={editVal || ''}
                  onChange={(e) => setMonthlyEdits((prev) => ({ ...prev, [entry.month]: Number(e.target.value) }))}
                />
                {changed ? (
                  <Button
                    size="sm"
                    className="h-7 w-full text-xs"
                    disabled={saving === `month_${entry.month}`}
                    onClick={() => saveMonthlyActual(entry.month, editVal)}
                  >
                    {saving === `month_${entry.month}` ? <Loader2 className="h-3 w-3 animate-spin" /> : '저장'}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
