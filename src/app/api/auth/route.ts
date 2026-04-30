import { NextRequest, NextResponse } from 'next/server';
import { getEnvValue, signToken } from '@/lib/auth';

export const runtime = 'nodejs';

function getSitePassword() {
  return getEnvValue('SITE_PASSWORD') ?? getEnvValue('NEST_ACCESS_PASSWORD');
}

async function readPassword(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const { password } = await request.json().catch(() => ({ password: '' }));
    return { password, jsonRequest: true };
  }

  const formData = await request.formData().catch(() => null);
  return {
    password: String(formData?.get('password') ?? ''),
    jsonRequest: false,
  };
}

export async function POST(request: NextRequest) {
  const { password, jsonRequest } = await readPassword(request);
  const sitePassword = getSitePassword();

  if (!sitePassword || password !== sitePassword) {
    if (!jsonRequest) {
      return NextResponse.redirect(new URL('/login?error=invalid', request.url), 303);
    }
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다' }, { status: 401 });
  }

  let token: string;
  try {
    token = await signToken({ role: 'viewer' });
  } catch {
    if (!jsonRequest) {
      return NextResponse.redirect(new URL('/login?error=config', request.url), 303);
    }
    return NextResponse.json({ error: '로그인 설정을 확인해야 합니다' }, { status: 500 });
  }

  const response = jsonRequest ? NextResponse.json({ ok: true }) : NextResponse.redirect(new URL('/', request.url), 303);
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
