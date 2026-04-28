import { NextRequest, NextResponse } from 'next/server';
import { hasRole, verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/admin/login'];
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/admin/auth'];

async function hasCookieRole(request: NextRequest, cookieName: string, role: 'viewer' | 'admin') {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return hasRole(payload, role);
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const url = new URL('/login', request.url);
  if (pathname !== '/') {
    url.searchParams.set('next', pathname);
  }
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname) || PUBLIC_API_PREFIXES.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    const isAdminApi = pathname.startsWith('/api/admin/');
    const authorized = isAdminApi
      ? await hasCookieRole(request, 'admin_token', 'admin')
      : (await hasCookieRole(request, 'access_token', 'viewer')) || (await hasCookieRole(request, 'admin_token', 'admin'));

    if (!authorized) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const authorized = await hasCookieRole(request, 'admin_token', 'admin');
    if (!authorized) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }

    return NextResponse.next();
  }

  const hasAccess = (await hasCookieRole(request, 'access_token', 'viewer')) || (await hasCookieRole(request, 'admin_token', 'admin'));
  if (!hasAccess) {
    const response = redirectToLogin(request, pathname);
    response.cookies.delete('access_token');
    response.cookies.delete('admin_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
