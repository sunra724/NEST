import { NextRequest, NextResponse } from 'next/server';
import { appendChangelog, readJSON, verifyAdmin, writeJSON } from '@/lib/data-writer';
import type { OperationStatus, OperationsData } from '@/types';

export const runtime = 'nodejs';

const ALLOWED_STATUS: OperationStatus[] = ['not_started', 'in_progress', 'completed', 'risk'];

function todayInSeoul() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function isStatus(value: unknown): value is OperationStatus {
  return typeof value === 'string' && ALLOWED_STATUS.includes(value as OperationStatus);
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
  }

  const data = await readJSON<OperationsData>('operations.json');

  if (body.type === 'evidence') {
    const { program, name, status } = body;
    if (typeof program !== 'string' || typeof name !== 'string' || !isStatus(status)) {
      return NextResponse.json({ error: '잘못된 증빙 요청' }, { status: 400 });
    }

    const group = data.evidence.find((item) => item.program === program);
    const item = group?.items.find((entry) => entry.name === name);
    if (!group || !item) {
      return NextResponse.json({ error: '증빙 항목 없음' }, { status: 404 });
    }

    const prev = item.status;
    item.status = status;
    group.completed = group.items.filter((entry) => entry.status === 'completed').length;
    data.lastUpdated = todayInSeoul();

    await writeJSON('operations.json', data);
    await appendChangelog({
      action: 'OPERATIONS_EVIDENCE_UPDATE',
      target: `운영관리 / ${program} / ${name}`,
      summary: `증빙 상태: ${prev} -> ${status}`,
    });

    return NextResponse.json({ ok: true, data });
  }

  if (body.type === 'funding') {
    const { program, stage, currentAmount, status } = body;
    if (typeof program !== 'string' || typeof stage !== 'string' || typeof currentAmount !== 'number' || !isStatus(status)) {
      return NextResponse.json({ error: '잘못된 지원금 요청' }, { status: 400 });
    }

    const group = data.funding.find((item) => item.program === program);
    const item = group?.disbursements.find((entry) => entry.stage === stage);
    if (!group || !item) {
      return NextResponse.json({ error: '지원금 항목 없음' }, { status: 404 });
    }

    const prevAmount = item.currentAmount;
    const prevStatus = item.status;
    item.currentAmount = currentAmount;
    item.status = status;
    data.lastUpdated = todayInSeoul();

    await writeJSON('operations.json', data);
    await appendChangelog({
      action: 'OPERATIONS_FUNDING_UPDATE',
      target: `운영관리 / ${program} / ${stage}`,
      summary: `집행 ${prevAmount.toLocaleString()} -> ${currentAmount.toLocaleString()}천원, 상태 ${prevStatus} -> ${status}`,
    });

    return NextResponse.json({ ok: true, data });
  }

  if (body.type === 'measurement') {
    const { program, label, current, status } = body;
    if (typeof program !== 'string' || typeof label !== 'string' || typeof current !== 'number' || !isStatus(status)) {
      return NextResponse.json({ error: '잘못된 성과측정 요청' }, { status: 400 });
    }

    const item = data.measurements.find((entry) => entry.program === program && entry.label === label);
    if (!item) {
      return NextResponse.json({ error: '성과측정 항목 없음' }, { status: 404 });
    }

    const prev = item.current;
    const prevStatus = item.status;
    item.current = current;
    item.status = status;
    data.lastUpdated = todayInSeoul();

    await writeJSON('operations.json', data);
    await appendChangelog({
      action: 'OPERATIONS_MEASUREMENT_UPDATE',
      target: `운영관리 / ${program} / ${label}`,
      summary: `현재값 ${prev} -> ${current}${item.unit}, 상태 ${prevStatus} -> ${status}`,
    });

    return NextResponse.json({ ok: true, data });
  }

  if (body.type === 'case') {
    const { label, current, status } = body;
    if (typeof label !== 'string' || typeof current !== 'number' || !isStatus(status)) {
      return NextResponse.json({ error: '잘못된 상담 케이스 요청' }, { status: 400 });
    }

    const item = data.casePipeline.find((entry) => entry.label === label);
    if (!item) {
      return NextResponse.json({ error: '상담 케이스 항목 없음' }, { status: 404 });
    }

    const prev = item.current;
    const prevStatus = item.status;
    item.current = current;
    item.status = status;
    data.lastUpdated = todayInSeoul();

    await writeJSON('operations.json', data);
    await appendChangelog({
      action: 'OPERATIONS_CASE_UPDATE',
      target: `운영관리 / T / ${label}`,
      summary: `현재값 ${prev} -> ${current}${item.unit}, 상태 ${prevStatus} -> ${status}`,
    });

    return NextResponse.json({ ok: true, data });
  }

  return NextResponse.json({ error: '잘못된 type' }, { status: 400 });
}
