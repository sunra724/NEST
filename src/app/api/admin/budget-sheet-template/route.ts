import { NextResponse } from 'next/server';
import { getStatusLabel } from '@/lib/budget-sheet';
import { readJSON, verifyAdmin } from '@/lib/data-writer';
import type { BudgetData } from '@/types';

export const runtime = 'nodejs';

function csvCell(value: string | number) {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const data = await readJSON<BudgetData>('budget.json');
  const headers = ['id', '사업', '구분', '품목', '세부품목', '보탬e 비목', '계획금액', '실집행액', '품의상태', '보탬e 메모'];
  const rows = (data.detailItems ?? []).map((item) => [
    item.id,
    item.programId,
    item.category,
    item.item,
    item.detailItem,
    item.botemCategory,
    item.plannedAmountWon,
    item.actualAmountWon || '',
    item.approvalStatus === 'not_requested' ? '' : getStatusLabel(item.approvalStatus),
    item.memo,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="nest-budget-sheet-template.csv"',
    },
  });
}
