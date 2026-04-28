import { NextRequest, NextResponse } from 'next/server';
import { appendChangelog, readJSON, verifyAdmin, writeJSON } from '@/lib/data-writer';
import type { KpiData } from '@/types';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { programId, kpiId, current } = await request.json();
  if (!programId || !kpiId || typeof current !== 'number') {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
  }

  const data = await readJSON<KpiData>('kpi.json');

  if (programId === 'common') {
    const commonKpi = data.common?.kpis?.find((k) => k.id === kpiId);
    if (!commonKpi) {
      return NextResponse.json({ error: `KPI ${kpiId} 없음` }, { status: 404 });
    }
    const prev = commonKpi.current;
    commonKpi.current = current;
    await writeJSON('kpi.json', data);
    await appendChangelog({
      action: 'KPI_UPDATE',
      target: `COMMON / ${kpiId}`,
      summary: `${commonKpi.label}: ${prev} → ${current} ${commonKpi.unit}`,
    });

    return NextResponse.json({ ok: true, data });
  }

  const program = data.programs?.[programId];
  if (!program) {
    return NextResponse.json({ error: `프로그램 ${programId} 없음` }, { status: 404 });
  }

  const kpi = program.kpis?.find((k) => k.id === kpiId);
  if (!kpi) {
    return NextResponse.json({ error: `KPI ${kpiId} 없음` }, { status: 404 });
  }

  const prev = kpi.current;
  kpi.current = current;
  await writeJSON('kpi.json', data);

  await appendChangelog({
    action: 'KPI_UPDATE',
    target: `${programId} / ${kpiId}`,
    summary: `${kpi.label}: ${prev} → ${current} ${kpi.unit}`,
  });

  return NextResponse.json({ ok: true, data });
}
