import { NextRequest, NextResponse } from 'next/server';
import { getEnvValue, signToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({ password: '' }));

  if (password !== getEnvValue('ADMIN_PASSWORD')) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다' }, { status: 401 });
  }

  let token: string;
  try {
    token = await signToken({ role: 'admin' });
  } catch {
    return NextResponse.json({ error: '로그인 설정을 확인해야 합니다' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8,
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('admin_token');
  return response;
}
