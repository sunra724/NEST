import { NextRequest, NextResponse } from 'next/server';
import { appendChangelog, readJSON, verifyAdmin, writeJSON } from '@/lib/data-writer';
import type { ProgramDetailData } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { programId, participant } = await request.json();
  if (!programId || !participant?.name) {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
  }

  const filename = `program-${String(programId).toLowerCase()}.json`;
  const data = await readJSON<ProgramDetailData>(filename);

  const newEntry = {
    id: Date.now().toString(),
    ...participant,
    registeredAt: new Date().toISOString(),
  };

  data.participants = data.participants ?? [];
  data.participants.push(newEntry);
  await writeJSON(filename, data);

  await appendChangelog({
    action: 'PARTICIPANT_ADD',
    target: `참여자 / [${String(programId).toUpperCase()}]`,
    summary: `${participant.name} 추가 (${participant.cohort ?? '-'})`,
  });

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { programId, participantId } = await request.json();
  if (!programId || !participantId) {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
  }

  const filename = `program-${String(programId).toLowerCase()}.json`;
  const data = await readJSON<ProgramDetailData>(filename);
  const target = data.participants?.find((participant) => participant.id === participantId);

  if (!target) {
    return NextResponse.json({ error: '참여자 없음' }, { status: 404 });
  }

  data.participants = data.participants.filter((participant) => participant.id !== participantId);
  await writeJSON(filename, data);

  await appendChangelog({
    action: 'PARTICIPANT_DELETE',
    target: `참여자 / [${String(programId).toUpperCase()}]`,
    summary: `${target.name} 삭제`,
  });

  return NextResponse.json({ ok: true, data });
}
