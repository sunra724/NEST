import { NextResponse } from 'next/server';
import { applyBudgetSheetChanges, previewBudgetSheetChanges, readBudgetSheetRows } from '@/lib/budget-sheet';
import { todayInSeoul } from '@/lib/budget-utils';
import { appendChangelog, readJSON, verifyAdmin, writeJSON } from '@/lib/data-writer';
import type { BudgetData } from '@/types';

export const runtime = 'nodejs';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : '스프레드시트 동기화에 실패했습니다.';
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  try {
    const data = await readJSON<BudgetData>('budget.json');
    const sheet = await readBudgetSheetRows();
    const preview = previewBudgetSheetChanges(data, sheet.rows, sheet.skipped);
    return NextResponse.json({ ok: true, ...preview });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  try {
    const data = await readJSON<BudgetData>('budget.json');
    const sheet = await readBudgetSheetRows();
    const applied = applyBudgetSheetChanges(data, sheet.rows, sheet.skipped);

    if (applied.changes.length > 0) {
      data.lastUpdated = todayInSeoul();
      await writeJSON('budget.json', data);
      await appendChangelog({
        action: 'BUDGET_SHEET_SYNC',
        target: `예산상세 / ${applied.sheetName}`,
        summary: `Google Sheet에서 ${applied.changes.length.toLocaleString()}개 항목 반영`,
      });
    }

    return NextResponse.json({ ok: true, applied: applied.changes.length, ...applied });
  } catch (error) {
    return errorResponse(error);
  }
}
