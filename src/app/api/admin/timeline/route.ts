import { NextRequest, NextResponse } from 'next/server';
import { appendChangelog, readJSON, verifyAdmin, writeJSON } from '@/lib/data-writer';
import type { TaskStatus, TimelineData } from '@/types';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { categoryId, taskName, status } = await request.json();
  const allowed: TaskStatus[] = ['pending', 'in_progress', 'completed'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: '허용되지 않은 status 값' }, { status: 400 });
  }

  const data = await readJSON<TimelineData>('timeline.json');
  const category = data.categories?.find((item) => item.id === categoryId);
  if (!category) {
    return NextResponse.json({ error: '카테고리 없음' }, { status: 404 });
  }

  const task = category.tasks?.find((item) => item.name === taskName);
  if (!task) {
    return NextResponse.json({ error: '태스크 없음' }, { status: 404 });
  }

  const prev = task.status;
  task.status = status;
  await writeJSON('timeline.json', data);
  await appendChangelog({
    action: 'TIMELINE_UPDATE',
    target: `일정 / ${categoryId} / ${taskName}`,
    summary: `상태: ${prev} → ${status}`,
  });

  return NextResponse.json({ ok: true, data });
}
