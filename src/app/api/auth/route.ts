import { NextRequest, NextResponse } from 'next/server';
import { getEnvValue, signToken } from '@/lib/auth';

export const runtime = 'nodejs';

function getSitePassword() {
  return getEnvValue('SITE_PASSWORD') ?? getEnvValue('NEST_ACCESS_PASSWORD');
}

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({ password: '' }));
  const sitePassword = getSitePassword();

  if (!sitePassword || password !== sitePassword) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다' }, { status: 401 });
  }

  let token: string;
  try {
    token = await signToken({ role: 'viewer' });
  } catch {
    return NextResponse.json({ error: '로그인 설정을 확인해야 합니다' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('access_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 12,
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('access_token');
  response.cookies.delete('admin_token');
  return response;
}
