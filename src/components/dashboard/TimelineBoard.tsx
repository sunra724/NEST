'use client';

import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TimelineData, TaskStatus } from '@/types';

interface TimelineBoardProps {
  timeline: TimelineData;
}

type FilterId = 'common' | 'N' | 'E' | 'S' | 'T';

const filterOrder: FilterId[] = ['common', 'N', 'E', 'S', 'T'];

function statusLabel(status: TaskStatus) {
  if (status === 'completed') return '완료';
  if (status === 'in_progress') return '진행중';
  return '예정';
}

function statusClass(status: TaskStatus) {
  if (status === 'completed') return '';
  if (status === 'in_progress') return 'animate-pulse';
  return 'opacity-30';
}

export default function TimelineBoard({ timeline }: TimelineBoardProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<FilterId[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const visibleCategories = useMemo(() => {
    if (selected.length === 0) return timeline.categories;
    return timeline.categories.filter((category) => selected.includes(category.id as FilterId));
  }, [selected, timeline.categories]);

  const currentMonth = 2;
  const nextMonth = 3;
  const allTasks = timeline.categories.flatMap((category) => category.tasks.map((task) => ({ ...task, categoryId: category.id })));
  const summary = {
    inProgress: allTasks.filter((task) => task.months.includes(currentMonth) && task.status === 'in_progress').length,
    completed: allTasks.filter((task) => task.months.includes(currentMonth) && task.status === 'completed').length,
    upcoming: allTasks.filter((task) => task.months.includes(nextMonth) && task.status === 'pending').length,
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setSelected([])}
            className={cn('rounded-full border px-3 py-1 text-sm', selected.length === 0 ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700')}
          >
            전체
          </button>
          {filterOrder.map((filter) => {
            const category = timeline.categories.find((item) => item.id === filter);
            if (!category) return null;
            const active = selected.includes(filter);
            return (
              <button
                key={filter}
                onClick={() =>
                  setSelected((prev) => (prev.includes(filter) ? prev.filter((item) => item !== filter) : [...prev, filter]))
                }
                className={cn('rounded-full border px-3 py-1 text-sm', active ? 'text-white' : 'border-slate-300 bg-white text-slate-700')}
                style={active ? { backgroundColor: category.color, borderColor: category.color } : undefined}
              >
                {filter === 'common' ? '공통' : filter}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="grid grid-cols-[250px_1fr] border-b border-slate-200">
              <div className="sticky left-0 z-10 bg-white p-3 text-sm font-semibold text-slate-700">카테고리 / 태스크</div>
              <div className="relative grid grid-cols-12 gap-1 p-3">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="rounded bg-slate-100 py-1 text-center text-xs text-slate-600">
                    {index + 1}월
                  </div>
                ))}
                <div className="pointer-events-none absolute bottom-0 left-[12.5%] top-0 border-l-2 border-dashed border-red-500">
                  <span className="absolute -top-5 -translate-x-1/2 rounded bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">오늘(2026.02)</span>
                </div>
              </div>
            </div>

            {visibleCategories.map((category) => {
              const isCollapsed = collapsed[category.id];
              return (
                <div key={category.id} className="grid grid-cols-[250px_1fr] border-b border-slate-200">
                  <div className="sticky left-0 z-10 bg-white p-2">
                    <button
                      onClick={() => setCollapsed((prev) => ({ ...prev, [category.id]: !isCollapsed }))}
                      className="mb-1 flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100"
                    >
                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <span>{category.label}</span>
                    </button>

                    {!isCollapsed && (
                      <div className="space-y-1 pl-6">
                        {category.tasks.map((task) => (
                          <p key={task.name} className="text-xs text-slate-600">
                            {task.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative space-y-1 p-2">
                    {!isCollapsed &&
                      category.tasks.map((task) => {
                        const start = Math.min(...task.months);
                        const end = Math.max(...task.months);
                        const span = end - start + 1;
                        return (
                          <div key={task.name} className="grid h-8 grid-cols-12 gap-1">
                            {Array.from({ length: 12 }).map((_, index) => (
                              <div key={index} className="rounded bg-slate-50" style={{ gridColumn: `${index + 1} / ${index + 2}`, gridRow: '1 / 2' }} />
                            ))}
                            <button
                              title={`${task.name} | ${start}~${end}월 | ${statusLabel(task.status)}`}
                              onClick={() => {
                                if (category.id === 'common') return;
                                router.push(`/programs/${category.id.toLowerCase()}`);
                              }}
                              className={cn(
                                'relative z-[1] flex h-6 items-center justify-center rounded-full text-xs font-semibold text-white',
                                statusClass(task.status),
                              )}
                              style={{ gridColumn: `${start} / span ${span}`, gridRow: '1 / 2', backgroundColor: category.color }}
                            >
                              {task.status === 'completed' ? <Check className="h-3.5 w-3.5" /> : task.name}
                            </button>
                          </div>
                        );
                      })}

                    <div className="pointer-events-none absolute bottom-0 left-[12.5%] top-0 border-l-2 border-dashed border-red-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          이번 달(2월) 진행 중 {summary.inProgress}건 / 완료 {summary.completed}건 / 다음 달(3월) 예정 {summary.upcoming}건
        </div>
      </section>
    </div>
  );
}
