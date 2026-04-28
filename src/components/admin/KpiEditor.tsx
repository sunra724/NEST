'use client';

import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { NEST_COLORS, type ProgramId } from '@/lib/constants';
import type { KpiItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  programId: string;
  kpis: KpiItem[];
  onSaved: () => void;
}

export default function KpiEditor({ programId, kpis, onSaved }: Props) {
  const primaryColor = programId === 'common' ? '#6366F1' : NEST_COLORS[programId as ProgramId].primary;
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function handleSave(kpiId: string, current: number) {
    setSaving(kpiId);
    try {
      const res = await fetch('/api/admin/kpi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, kpiId, current }),
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
    <div className="space-y-3">
      {kpis.map((kpi) => {
        const editVal = edits[kpi.id] ?? kpi.current;
        const changed = editVal !== kpi.current;
        const pct = kpi.target > 0 ? Math.round((editVal / kpi.target) * 100) : 0;

        return (
          <div key={kpi.id} className="flex items-center gap-3 rounded-xl border bg-white p-4 transition-colors hover:border-slate-300">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">{kpi.id}</span>
                <span className="truncate text-sm font-medium text-slate-800">{kpi.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: primaryColor,
                    }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-slate-500">{pct}%</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Input
                type="number"
                min={0}
                max={kpi.target * 2}
                className="w-24 text-right tabular-nums"
                value={editVal}
                onChange={(e) => setEdits((prev) => ({ ...prev, [kpi.id]: Number(e.target.value) }))}
              />
              <span className="w-16 text-xs text-slate-400">
                / {kpi.target} {kpi.unit}
              </span>
              <Button
                size="sm"
                variant={changed ? 'default' : 'outline'}
                className="w-16"
                disabled={!changed || saving === kpi.id}
                onClick={() => handleSave(kpi.id, editVal)}
              >
                {saving === kpi.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : changed ? (
                  '저장'
                ) : (
                  <Check className="h-3 w-3 text-slate-400" />
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
