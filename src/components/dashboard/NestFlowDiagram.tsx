import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NEST_COLORS, PROGRAM_IDS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { KpiData, OverviewData } from '@/types';

interface NestFlowDiagramProps {
  overview: OverviewData;
  kpi: KpiData;
}

export default function NestFlowDiagram({ overview, kpi }: NestFlowDiagramProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-5 w-1 rounded bg-[#6366F1]" />
        <h2 className="text-lg font-semibold">N.E.S.T. 흐름도</h2>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        {PROGRAM_IDS.map((id, idx) => {
          const program = overview.programs.find((item) => item.id === id);
          const rep = kpi.programs[id]?.kpis?.[0];
          if (!program || !rep) return null;

          return (
            <div key={id} className="flex items-center gap-3">
              <Link
                href={`/programs/${id.toLowerCase()}`}
                className={cn(
                  'group relative w-full min-w-[190px] overflow-hidden rounded-lg border border-slate-200 transition hover:-translate-y-0.5 hover:shadow-md',
                  'xl:w-[220px]',
                )}
              >
                <div className="h-2 w-full" style={{ backgroundColor: NEST_COLORS[id].primary }} />
                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-900">{program.name}</p>
                  <p className="text-xs text-slate-500">{overview.nestMeaning[id]?.en ?? '-'}</p>
                  <p className="mt-3 text-sm text-slate-700">
                    {rep.label.split(' ')[0]} {rep.current}/{rep.target}
                    {rep.unit}
                  </p>
                </div>
              </Link>

              {idx < PROGRAM_IDS.length - 1 && <ArrowRight className="hidden h-4 w-4 text-slate-400 xl:block" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
