import { NextRequest, NextResponse } from 'next/server';
import { getEnvValue, signToken } from '@/lib/auth';

export const runtime = 'nodejs';

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

function redirectTo(path: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: path },
  });
}

export async function POST(request: NextRequest) {
  const { password, jsonRequest } = await readPassword(request);

  if (password !== getEnvValue('ADMIN_PASSWORD')) {
    if (!jsonRequest) {
      return redirectTo('/admin/login?error=invalid');
    }
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다' }, { status: 401 });
  }

  let token: string;
  try {
    token = await signToken({ role: 'admin' });
  } catch {
    if (!jsonRequest) {
      return redirectTo('/admin/login?error=config');
    }
    return NextResponse.json({ error: '로그인 설정을 확인해야 합니다' }, { status: 500 });
  }

  const response = jsonRequest ? NextResponse.json({ ok: true }) : redirectTo('/admin');
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
