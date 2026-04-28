import type { Metadata } from 'next';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import ProgramDetailTemplate from '@/components/dashboard/ProgramDetailTemplate';
import { loadJSON } from '@/lib/data';
import type { KpiData, OverviewData, ProgramDetailData } from '@/types';

interface ProgramNData extends ProgramDetailData {
  tools?: string[];
}

export const metadata: Metadata = {
  title: '[N] 마음충전소 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

async function getProgramNData() {
  try {
    return await Promise.all([
      loadJSON<ProgramNData>('program-n.json'),
      loadJSON<OverviewData>('overview.json'),
      loadJSON<KpiData>('kpi.json'),
    ]);
  } catch {
    return null;
  }
}

export default async function ProgramNPage() {
  const data = await getProgramNData();

  if (!data) {
    return <ErrorState />;
  }

  const [program, overview, kpi] = data;
  const summary = overview.programs.find((item) => item.id === 'N');
  const merged = {
    ...program,
    tagline: summary?.tagline,
    period: summary?.period,
    scale: summary?.scale,
    budget: summary?.budget,
    kpis: kpi.programs.N?.kpis ?? [],
  };

  if (!merged.stages?.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <ProgramDetailTemplate programId="N" data={merged} />
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">측정도구 카드</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(program.tools ?? []).map((tool) => (
            <article key={tool} className="rounded-lg border border-slate-200 p-4 text-center text-sm font-semibold text-slate-700">
              {tool}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
