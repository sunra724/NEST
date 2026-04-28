import type { Metadata } from 'next';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import ProgramDetailTemplate from '@/components/dashboard/ProgramDetailTemplate';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { loadJSON } from '@/lib/data';
import { formatNumber } from '@/lib/utils';
import type { KpiData, OverviewData, ProgramDetailData } from '@/types';

interface ProgramEData extends ProgramDetailData {
  funding?: {
    individualSupport?: number;
    teamSupport?: number;
    individualUnit?: string;
    teamUnit?: string;
  };
  foreignStudentTarget?: string;
}

export const metadata: Metadata = {
  title: '[E] 캠퍼스타운 챌린지 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

async function getProgramEData() {
  try {
    return await Promise.all([
      loadJSON<ProgramEData>('program-e.json'),
      loadJSON<OverviewData>('overview.json'),
      loadJSON<KpiData>('kpi.json'),
    ]);
  } catch {
    return null;
  }
}

export default async function ProgramEPage() {
  const data = await getProgramEData();

  if (!data) {
    return <ErrorState />;
  }

  const [program, overview, kpi] = data;
  const summary = overview.programs.find((item) => item.id === 'E');
  const merged = {
    ...program,
    tagline: summary?.tagline,
    period: summary?.period,
    scale: summary?.scale,
    budget: summary?.budget,
    kpis: kpi.programs.E?.kpis ?? [],
  };

  if (!merged.stages?.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <ProgramDetailTemplate programId="E" data={merged} />
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">지원금 안내</h2>
        <Tabs defaultValue="funding">
          <TabsList>
            <TabsTrigger value="funding">지원금</TabsTrigger>
            <TabsTrigger value="policy">운영 기준</TabsTrigger>
          </TabsList>
          <TabsContent value="funding" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">개인 활동지원</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatNumber(program.funding?.individualSupport ?? 0)}
                  {program.funding?.individualUnit ?? '천원/인'}
                </p>
              </article>
              <article className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">팀 프로젝트 지원</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatNumber(program.funding?.teamSupport ?? 0)}
                  {program.funding?.teamUnit ?? '천원/팀'}
                </p>
              </article>
            </div>
          </TabsContent>
          <TabsContent value="policy" className="mt-4">
            <Badge variant="amber">{program.foreignStudentTarget ?? '10% 참여 권장'}</Badge>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
