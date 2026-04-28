import { NextRequest, NextResponse } from 'next/server';
import { appendChangelog, readJSON, verifyAdmin, writeJSON } from '@/lib/data-writer';
import type { BudgetData } from '@/types';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const body = await request.json();
  const data = await readJSON<BudgetData>('budget.json');

  if (body.type === 'program') {
    const { programId, spent } = body;
    if (typeof spent !== 'number') {
      return NextResponse.json({ error: '잘못된 spent 값' }, { status: 400 });
    }
    const program = data.byProgram.find((p) => p.id === programId);
    if (!program) {
      return NextResponse.json({ error: '프로그램 없음' }, { status: 404 });
    }

    const prev = program.spent;
    program.spent = spent;
    await writeJSON('budget.json', data);
    await appendChangelog({
      action: 'BUDGET_PROGRAM_UPDATE',
      target: `예산 / ${programId}`,
      summary: `${program.name} 집행액: ${prev.toLocaleString()} → ${spent.toLocaleString()} 천원`,
    });
  } else if (body.type === 'monthly') {
    const { month, actual } = body;
    if (!month || typeof actual !== 'number') {
      return NextResponse.json({ error: '잘못된 월별 요청' }, { status: 400 });
    }
    const entry = data.monthlyExecution.find((m) => m.month === month);
    if (!entry) {
      return NextResponse.json({ error: '월 데이터 없음' }, { status: 404 });
    }

    const prev = entry.actual;
    entry.actual = actual;
    await writeJSON('budget.json', data);
    await appendChangelog({
      action: 'BUDGET_MONTHLY_UPDATE',
      target: `예산 / 월별 / ${month}`,
      summary: `${month} 실집행: ${prev.toLocaleString()} → ${actual.toLocaleString()} 천원`,
    });
  } else {
    return NextResponse.json({ error: '잘못된 type' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data });
}
