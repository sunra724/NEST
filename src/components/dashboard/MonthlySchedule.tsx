import { CalendarRange } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TimelineData, TimelineTask } from '@/types';

interface MonthlyScheduleProps {
  timeline: TimelineData;
  month?: number;
}

const statusBadgeMap: Record<TimelineTask['status'], { label: string; variant: 'success' | 'info' | 'pending' }> = {
  completed: { label: '완료', variant: 'success' },
  in_progress: { label: '진행중', variant: 'info' },
  pending: { label: '예정', variant: 'pending' },
};

export default function MonthlySchedule({ timeline, month = 2 }: MonthlyScheduleProps) {
  const tasks = timeline.categories.flatMap((category) =>
    category.tasks
      .filter((task) => task.months.includes(month))
      .map((task) => ({
        ...task,
        categoryLabel: category.label,
      })),
  );

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-5 w-1 rounded bg-[#6366F1]" />
        <h2 className="text-lg font-semibold">이번 달 주요 일정</h2>
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-slate-500">2월 일정이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={`${task.categoryLabel}-${task.name}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <CalendarRange className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{task.name}</p>
                  <p className="text-xs text-slate-500">{task.categoryLabel}</p>
                </div>
              </div>
              <Badge variant={statusBadgeMap[task.status].variant}>{statusBadgeMap[task.status].label}</Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
