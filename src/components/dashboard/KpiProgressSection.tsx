import { NEST_COLORS, PROGRAM_IDS } from '@/lib/constants';
import { formatPercent } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { KpiData } from '@/types';

interface KpiProgressSectionProps {
  kpi: KpiData;
}

function MiniCircle({ label, value, color }: { label: string; value: number; color: string }) {
  const r = 19;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * c;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
      <svg width="46" height="46" viewBox="0 0 46 46" className="-rotate-90">
        <circle cx="23" cy="23" r={r} stroke="#e2e8f0" strokeWidth="5" fill="none" />
        <circle cx="23" cy="23" r={r} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${c - dash}`} />
      </svg>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}%</p>
      </div>
    </div>
  );
}

function SemiGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 72;
  const circumference = Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <svg viewBox="0 0 180 110" className="h-32 w-full">
        <path d="M18 90 A72 72 0 0 1 162 90" stroke="#e2e8f0" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path
          d="M18 90 A72 72 0 0 1 162 90"
          stroke="#6366F1"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
        <text x="90" y="85" textAnchor="middle" className="fill-slate-900 text-xl font-bold">
          {clamped}%
        </text>
      </svg>
      <p className="-mt-2 text-center text-sm text-slate-600">전체 달성률</p>
    </div>
  );
}

export default function KpiProgressSection({ kpi }: KpiProgressSectionProps) {
  const representative = PROGRAM_IDS.map((id) => {
    const item = kpi.programs[id]?.kpis?.[0];
    const pct = item ? formatPercent(item.current, item.target) : 0;
    return { id, item, pct };
  });
  const overall = Math.round(representative.reduce((acc, cur) => acc + cur.pct, 0) / Math.max(1, representative.length));

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <span className="h-5 w-1 rounded bg-[#6366F1]" />
          <h2 className="text-lg font-semibold">KPI 진행 현황</h2>
        </div>
        <div className="space-y-5">
          {representative.map(({ id, item, pct }) => (
            <div key={id}>
              <p className="mb-2 text-sm text-slate-700">
                {id} — {item?.label ?? '-'} {item?.current ?? 0}/{item?.target ?? 0}
                {item?.unit ?? ''}
                {' ('}
                {pct}%)
              </p>
              <Progress value={pct} indicatorColor={NEST_COLORS[id].primary} className="h-2.5" />
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-5 w-1 rounded bg-[#6366F1]" />
          <h2 className="text-lg font-semibold">통합 지표</h2>
        </div>
        <SemiGauge value={overall} />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {representative.map(({ id, pct }) => (
            <MiniCircle key={id} label={id} value={pct} color={NEST_COLORS[id].primary} />
          ))}
        </div>
      </article>
    </section>
  );
}
