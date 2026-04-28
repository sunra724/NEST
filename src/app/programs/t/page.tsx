import type { Metadata } from 'next';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import ProgramDetailTemplate from '@/components/dashboard/ProgramDetailTemplate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loadJSON } from '@/lib/data';
import type { KpiData, OverviewData, ProgramDetailData } from '@/types';

interface ProgramTData extends ProgramDetailData {
  additionalServices?: { name: string; cycle: string; desc: string }[];
  contents?: string[];
}

export const metadata: Metadata = {
  title: '[T] 안심전월세 지킴이 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

async function getProgramTData() {
  try {
    return await Promise.all([
      loadJSON<ProgramTData>('program-t.json'),
      loadJSON<OverviewData>('overview.json'),
      loadJSON<KpiData>('kpi.json'),
    ]);
  } catch {
    return null;
  }
}

export default async function ProgramTPage() {
  const data = await getProgramTData();

  if (!data) {
    return <ErrorState />;
  }

  const [program, overview, kpi] = data;
  const summary = overview.programs.find((item) => item.id === 'T');
  const merged = {
    ...program,
    tagline: summary?.tagline,
    period: summary?.period,
    scale: summary?.scale,
    budget: summary?.budget,
    kpis: kpi.programs.T?.kpis ?? [],
  };

  if (!merged.stages?.length) {
    return <EmptyState />;
  }

  return (
      <div className="space-y-6">
        <ProgramDetailTemplate programId="T" data={merged} />

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">추가 서비스</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>서비스명</TableHead>
                  <TableHead>주기</TableHead>
                  <TableHead>설명</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(program.additionalServices ?? []).map((service) => (
                  <TableRow key={service.name}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.cycle}</TableCell>
                    <TableCell>{service.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">제작콘텐츠 체크리스트</h2>
          <ul className="space-y-2">
            {(program.contents ?? []).map((content) => (
              <li key={content} className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
                {content}
              </li>
            ))}
          </ul>
        </section>
      </div>
  );
}
