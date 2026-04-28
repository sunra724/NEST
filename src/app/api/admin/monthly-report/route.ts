import { NextRequest, NextResponse } from 'next/server';
import { appendChangelog, readJSON, verifyAdmin, writeJSON } from '@/lib/data-writer';
import type { MonthlyReportEntry, OperationsData } from '@/types';

export const runtime = 'nodejs';

const MONTHS = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];

function nowIso() {
  return new Date().toISOString();
}

function todayInSeoul() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || typeof body.month !== 'string' || !MONTHS.includes(body.month)) {
    return NextResponse.json({ error: '잘못된 월간보고 요청' }, { status: 400 });
  }

  const data = await readJSON<OperationsData>('operations.json');
  const reports = data.monthlyReports ?? [];
  const nextEntry: MonthlyReportEntry = {
    month: body.month,
    highlights: normalizeText(body.highlights),
    issues: normalizeText(body.issues),
    nextPlans: normalizeText(body.nextPlans),
    supportNeeds: normalizeText(body.supportNeeds),
    updatedAt: nowIso(),
  };

  const index = reports.findIndex((entry) => entry.month === body.month);
  if (index >= 0) {
    reports[index] = nextEntry;
  } else {
    reports.push(nextEntry);
  }

  reports.sort((a, b) => a.month.localeCompare(b.month));
  data.monthlyReports = reports;
  data.lastUpdated = todayInSeoul();

  await writeJSON('operations.json', data);
  await appendChangelog({
    action: 'MONTHLY_REPORT_UPDATE',
    target: `월간보고 / ${body.month}`,
    summary: `${body.month} 운영보고 메모 수정`,
  });

  return NextResponse.json({ ok: true, data });
}
