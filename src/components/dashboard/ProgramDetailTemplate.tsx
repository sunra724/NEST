import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NEST_COLORS, type ProgramId } from '@/lib/constants';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { KpiItem, ProgramDetailData } from '@/types';

interface EnrichedProgramDetailData extends ProgramDetailData {
  tagline?: string;
  period?: string;
  scale?: string;
  budget?: number;
  kpis?: KpiItem[];
}

interface ProgramDetailTemplateProps {
  programId: ProgramId;
  data: EnrichedProgramDetailData;
}

function KpiCircle({ item, color }: { item: KpiItem; color: string }) {
  const pct = formatPercent(item.current, item.target);
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{item.label}</p>
        <Badge variant="secondary">{pct}%</Badge>
      </div>
      <div className="flex items-center gap-3">
        <svg width="70" height="70" viewBox="0 0 70 70" className="-rotate-90">
          <circle cx="35" cy="35" r={r} stroke="#e2e8f0" strokeWidth="7" fill="none" />
          <circle cx="35" cy="35" r={r} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${c - dash}`} />
        </svg>
        <p className="text-sm text-slate-700">
          {formatNumber(item.current)} / {formatNumber(item.target)}
          {item.unit}
        </p>
      </div>
    </div>
  );
}

export default function ProgramDetailTemplate({ programId, data }: ProgramDetailTemplateProps) {
  const color = NEST_COLORS[programId];
  const kpis = data.kpis ?? [];
  const stageRows = (data.stages ?? []).map((stage, idx) => ({
    index: idx + 1,
    name: stage.name,
    duration: stage.duration,
  }));
  const participantSummary = data.participantSummary ?? {
    total: data.participants.length,
    byCohort: Object.entries(
      data.participants.reduce<Record<string, number>>((acc, participant) => {
        const label = participant.cohort?.trim() || '미분류';
        acc[label] = (acc[label] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([label, count]) => ({ label, count })),
  };
  const operationRows = (
    data.cohorts?.map((cohort) => ({
      label: cohort.label,
      period: cohort.period,
      capacity: cohort.capacity,
      registered: data.participants.filter((participant) => participant.cohort === cohort.label).length,
      status: cohort.status,
    })) ??
    Object.values(data.tracks ?? {}).map((track) => ({
      label: `${track.label}`,
      period: track.period,
      capacity: track.teams,
      registered: data.participants.filter((participant) => participant.cohort === track.label).length,
      status: '예정',
    }))
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl shadow-sm" style={{ background: `linear-gradient(135deg, ${color.primary} 0%, ${color.light} 100%)` }}>
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">{programId}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{data.name}</h1>
          <p className="mt-1 text-sm text-slate-700">{data.tagline ?? '-'}</p>

          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <p>기간: {data.period ?? '-'}</p>
            <p>예산: {data.budget ? `${formatNumber(data.budget)}천원` : '-'}</p>
            <p>규모: {data.scale ?? '-'}</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(kpis.length > 0 ? kpis.slice(0, 2) : [{ id: '0', label: '-', target: 0, current: 0, unit: '' } as KpiItem]).map((kpi) => (
              <article key={kpi.id} className="rounded-lg bg-white/80 p-3">
                <p className="text-xs text-slate-500">{kpi.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {kpi.current}/{kpi.target}
                  {kpi.unit}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="flex w-full items-center justify-between text-left text-base font-semibold text-slate-900">
            사업 목적
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 text-sm leading-7 text-slate-700">{data.purpose}</CollapsibleContent>
        </Collapsible>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">단계 흐름도</h2>
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
          {stageRows.map((stage, idx) => (
            <div key={stage.name} className="flex items-center gap-2">
              <div className="flex min-w-[180px] items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{stage.index}</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{stage.name}</p>
                  <p className="text-xs text-slate-500">{stage.duration}</p>
                </div>
              </div>
              {idx < stageRows.length - 1 && <span className="hidden text-slate-400 xl:inline">→</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">KPI 그리드</h2>
        {kpis.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-5 text-center text-slate-500">아직 등록된 데이터가 없습니다</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">{kpis.map((item) => <KpiCircle key={item.id} item={item} color={color.primary} />)}</div>
        )}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">기수/트랙 운영 현황</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>기수명</TableHead>
                <TableHead>기간</TableHead>
                <TableHead className="text-right">정원</TableHead>
                <TableHead className="text-right">등록</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operationRows.length > 0 ? (
                operationRows.map((row) => (
                  <TableRow key={`${row.label}-${row.period}`}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell>{row.period}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.capacity)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.registered)}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === '예정' ? 'pending' : 'info'}>{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    아직 등록된 데이터가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">협력기관</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {(data.partners ?? []).length > 0 ? (
              (data.partners ?? []).map((partner) => (
                <li key={partner} className="rounded-md border border-slate-200 px-3 py-2">
                  {partner}
                </li>
              ))
            ) : (
              <li className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-slate-500">아직 등록된 데이터가 없습니다</li>
            )}
          </ul>
        </article>
        <article className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">N.E.S.T. 연계</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {(data.connections ?? []).length > 0 ? (
              (data.connections ?? []).map((connection) => (
                <li key={`${connection.target}-${connection.desc}`} className="rounded-md border border-slate-200 px-3 py-2">
                  <p className="font-semibold">{connection.target}</p>
                  <p className="text-slate-600">{connection.desc}</p>
                </li>
              ))
            ) : (
              <li className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-slate-500">아직 등록된 데이터가 없습니다</li>
            )}
          </ul>
        </article>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">참여자 현황</h2>
        {participantSummary.total === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-slate-500">아직 등록된 참여자가 없습니다</p>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">총 등록</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(participantSummary.total)}명</p>
            </div>
            {participantSummary.byCohort.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {participantSummary.byCohort.map((item) => (
                  <div key={item.label} className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <span className="font-medium">{item.label}</span>
                    <span className="float-right tabular-nums">{formatNumber(item.count)}명</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
