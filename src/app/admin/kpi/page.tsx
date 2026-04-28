'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import KpiEditor from '@/components/admin/KpiEditor';
import { NEST_COLORS, PROGRAM_IDS } from '@/lib/constants';
import type { KpiData } from '@/types';

export default function AdminKpiPage() {
  const router = useRouter();
  const [data, setData] = useState<KpiData | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/data/kpi', { cache: 'no-store' });
    return (await res.json()) as KpiData;
  }, []);

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

  if (!data) return <div className="p-8 text-slate-500">데이터 로딩 중...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">KPI 실적 입력</h1>
        <p className="mt-1 text-sm text-slate-500">수치를 수정하고 저장하면 즉시 대시보드에 반영됩니다.</p>
      </div>

      {PROGRAM_IDS.map((id) => {
        const program = data.programs[id];
        const color = NEST_COLORS[id];
        return (
          <section key={id}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: color.primary }}>
                {id}
              </div>
              <h2 className="text-base font-semibold text-slate-700">{program.name}</h2>
              <span className="text-xs text-slate-400">
                {program.kpis.filter((kpi) => kpi.current > 0).length} / {program.kpis.length} 입력됨
              </span>
            </div>
            <KpiEditor programId={id} kpis={program.kpis} onSaved={reload} />
          </section>
        );
      })}

      <section>
        <h2 className="mb-4 text-base font-semibold text-slate-700">공통 KPI</h2>
        <KpiEditor programId="common" kpis={data.common.kpis} onSaved={reload} />
      </section>
    </div>
  );
}
