'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ParticipantEditor from '@/components/admin/ParticipantEditor';
import { NEST_COLORS, PROGRAM_IDS, type ProgramId } from '@/lib/constants';
import type { ProgramDetailData } from '@/types';

export default function AdminProgramPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProgramDetailData | null>(null);

  const normalizedId = useMemo(() => id?.toLowerCase() ?? 'n', [id]);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/data/program-${normalizedId}`, { cache: 'no-store' });
    return (await res.json()) as ProgramDetailData;
  }, [normalizedId]);

  const reload = useCallback(async () => {
    setData(await fetchData());
    router.refresh();
  }, [fetchData, router]);

  useEffect(() => {
    let active = true;
    void fetchData().then((nextData) => {
      if (active) setData(nextData);
    });
    return () => {
      active = false;
    };
  }, [fetchData]);

  if (!data) return <div className="p-8 text-slate-500">로딩 중...</div>;

  const upperId = normalizedId.toUpperCase();
  const programId = PROGRAM_IDS.includes(upperId as ProgramId) ? (upperId as ProgramId) : 'N';
  const color = NEST_COLORS[programId];
  const cohortOptions = data.cohorts?.map((cohort) => cohort.label) ?? (data.tracks ? Object.values(data.tracks).map((track) => track.label) : []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white" style={{ backgroundColor: color?.primary ?? '#6366F1' }}>
          {upperId}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{data.name} — 참여자 관리</h1>
          <p className="mt-0.5 text-sm text-slate-500">참여자를 추가하거나 삭제할 수 있습니다.</p>
        </div>
      </div>

      <ParticipantEditor programId={normalizedId} programName={data.name} participants={data.participants ?? []} cohortOptions={cohortOptions} onSaved={reload} />
    </div>
  );
}
