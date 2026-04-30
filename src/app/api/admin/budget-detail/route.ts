import { NextRequest, NextResponse } from 'next/server';
import { appendChangelog, readJSON, verifyAdmin, writeJSON } from '@/lib/data-writer';
import type { BudgetData, BudgetDetailApprovalStatus, BudgetDetailItem } from '@/types';

export const runtime = 'nodejs';

const ALLOWED_STATUS: BudgetDetailApprovalStatus[] = ['not_requested', 'requested', 'approved', 'paid', 'needs_review'];

function isStatus(value: unknown): value is BudgetDetailApprovalStatus {
  return typeof value === 'string' && ALLOWED_STATUS.includes(value as BudgetDetailApprovalStatus);
}

function todayInSeoul() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function wonToThousand(value: number) {
  return Math.round(value / 1000);
}

function recomputeBudgetSpent(data: BudgetData) {
  const items = data.detailItems ?? [];
  const sum = (predicate: (item: BudgetDetailItem) => boolean) => items.filter(predicate).reduce((acc, item) => acc + item.actualAmountWon, 0);

  for (const program of data.byProgram) {
    program.spent = wonToThousand(sum((item) => item.programId === program.id));
  }

  if (data.byCategory.directCost) {
    data.byCategory.directCost.spent = wonToThousand(sum((item) => item.category === '직접비'));
  }
  if (data.byCategory.indirectCost) {
    data.byCategory.indirectCost.spent = wonToThousand(sum((item) => item.category === '간접비'));
  }
  if (data.byCategory.laborCost) {
    data.byCategory.laborCost.spent = wonToThousand(sum((item) => item.category === '인건비'));
  }

  for (const [key, detail] of Object.entries(data.directCostDetail)) {
    detail.spent = wonToThousand(sum((item) => item.directCostKey === key));
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
  }

  const { id, actualAmountWon, approvalStatus, memo } = body;
  if (
    typeof id !== 'string' ||
    typeof actualAmountWon !== 'number' ||
    !Number.isFinite(actualAmountWon) ||
    actualAmountWon < 0 ||
    !isStatus(approvalStatus) ||
    typeof memo !== 'string'
  ) {
    return NextResponse.json({ error: '잘못된 예산 상세 요청' }, { status: 400 });
  }

  const data = await readJSON<BudgetData>('budget.json');
  const item = data.detailItems?.find((entry) => entry.id === id);
  if (!item) {
    return NextResponse.json({ error: '예산 상세 항목 없음' }, { status: 404 });
  }

  const prevAmount = item.actualAmountWon;
  const prevStatus = item.approvalStatus;
  item.actualAmountWon = actualAmountWon;
  item.approvalStatus = approvalStatus;
  item.memo = memo.trim();
  data.lastUpdated = todayInSeoul();
  recomputeBudgetSpent(data);

  await writeJSON('budget.json', data);
  await appendChangelog({
    action: 'BUDGET_DETAIL_UPDATE',
    target: `예산상세 / ${item.programId} / ${item.item}`,
    summary: `${prevAmount.toLocaleString()}원 -> ${actualAmountWon.toLocaleString()}원, ${prevStatus} -> ${approvalStatus}`,
  });

  return NextResponse.json({ ok: true, data });
}
