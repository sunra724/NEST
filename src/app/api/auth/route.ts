import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export const runtime = 'nodejs';

function getSitePassword() {
  return process.env.SITE_PASSWORD ?? process.env.NEST_ACCESS_PASSWORD;
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const sitePassword = getSitePassword();

  if (!sitePassword || password !== sitePassword) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다' }, { status: 401 });
  }

  const token = await signToken({ role: 'viewer' });
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
