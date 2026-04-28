import type { Metadata } from 'next';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import ProgramDetailTemplate from '@/components/dashboard/ProgramDetailTemplate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loadJSON } from '@/lib/data';
import { formatNumber } from '@/lib/utils';
import type { KpiData, OverviewData, ProgramDetailData } from '@/types';

interface ProgramSData extends ProgramDetailData {
  tracks?: {
    track1?: { label: string; teams: number; budgetPerTeam: number; period: string; focus: string };
    track2?: { label: string; teams: number; budgetPerTeam: number; period: string; focus: string };
  };
  fundingSchedule?: number[];
}

export const metadata: Metadata = {
  title: '[S] 둥지 시드머니 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

async function getProgramSData() {
  try {
    return await Promise.all([
      loadJSON<ProgramSData>('program-s.json'),
      loadJSON<OverviewData>('overview.json'),
      loadJSON<KpiData>('kpi.json'),
    ]);
  } catch {
    return null;
  }
}

export default async function ProgramSPage() {
  const data = await getProgramSData();

  if (!data) {
    return <ErrorState />;
  }

  const [program, overview, kpi] = data;
  const summary = overview.programs.find((item) => item.id === 'S');
  const merged = {
    ...program,
    tagline: summary?.tagline,
    period: summary?.period,
    scale: summary?.scale,
    budget: summary?.budget,
    kpis: kpi.programs.S?.kpis ?? [],
  };

  const track1 = program.tracks?.track1;
  const track2 = program.tracks?.track2;

  if (!merged.stages?.length) {
    return <EmptyState />;
  }

  return (
      <div className="space-y-6">
        <ProgramDetailTemplate programId="S" data={merged} />

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">트랙 비교</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">{track1?.label ?? '트랙1'}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatNumber(track1?.teams ?? 0)}팀 / {formatNumber(track1?.budgetPerTeam ?? 0)}천원
              </p>
            </article>
            <article className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">{track2?.label ?? '트랙2'}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatNumber(track2?.teams ?? 0)}팀 / {formatNumber(track2?.budgetPerTeam ?? 0)}천원
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">지원금 3단계 분할</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>단계</TableHead>
                  <TableHead className="text-right">비율</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(program.fundingSchedule ?? [40, 30, 30]).map((ratio, idx) => (
                  <TableRow key={`${ratio}-${idx}`}>
                    <TableCell>{idx + 1}단계</TableCell>
                    <TableCell className="text-right">{ratio}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
  );
}
