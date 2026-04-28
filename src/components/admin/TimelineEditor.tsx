'use client';

import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { TaskStatus, TimelineData } from '@/types';

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending', label: '예정', color: 'bg-slate-100 text-slate-600 hover:bg-slate-200' },
  { value: 'in_progress', label: '진행중', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'completed', label: '완료', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
];

interface Props {
  data: TimelineData;
  onSaved: () => void;
}

export default function TimelineEditor({ data, onSaved }: Props) {
  const [saving, setSaving] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  async function handleStatusChange(categoryId: string, taskName: string, status: TaskStatus) {
    const key = `${categoryId}_${taskName}`;
    setSaving(key);
    try {
      const res = await fetch('/api/admin/timeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, taskName, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`"${taskName}" → ${status}`);
      onSaved();
    } catch {
      toast.error('저장 실패');
    } finally {
      setSaving(null);
    }
  }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {data.categories.map((category) => (
        <div key={category.id} className="overflow-hidden rounded-xl border bg-white">
          <button
            className="flex w-full items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
            onClick={() => toggleCollapse(category.id)}
          >
            <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
            <span className="flex-1 text-left font-semibold text-slate-800">{category.label}</span>
            <span className="text-xs text-slate-400">
              완료 {category.tasks.filter((task) => task.status === 'completed').length} / 진행 {category.tasks.filter((task) => task.status === 'in_progress').length} / 예정{' '}
              {category.tasks.filter((task) => task.status === 'pending').length}
            </span>
            {collapsed.has(category.id) ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
          </button>

          {!collapsed.has(category.id) ? (
            <div className="divide-y border-t">
              {category.tasks.map((task) => {
                const key = `${category.id}_${task.name}`;
                const monthLabel = `${Math.min(...task.months)}~${Math.max(...task.months)}월`;
                return (
                  <div key={task.name} className="flex items-center gap-4 px-5 py-3">
                    <span className="flex-1 text-sm text-slate-700">{task.name}</span>
                    <span className="w-16 text-center text-xs text-slate-400">{monthLabel}</span>
                    <div className="flex items-center gap-1">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          disabled={saving === key}
                          onClick={() => handleStatusChange(category.id, task.name, option.value)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                            task.status === option.value ? `${option.color} ring-2 ring-current ring-offset-1` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {saving === key && task.status !== option.value ? <Loader2 className="h-3 w-3 animate-spin" /> : option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
