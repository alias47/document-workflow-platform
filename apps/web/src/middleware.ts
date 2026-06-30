import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/applicants'];
const PUBLIC = ['/login', '/forgot-password', '/reset-password', '/register'];

function isProtected(pathname: string) {
  return PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isPublic(pathname: string) {
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets and Next.js internals — skip
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // In development, skip middleware auth checks entirely.
  // The AuthContext (via sessionStorage) handles auth state.
  // In production, the backend will set HTTP-only cookies on login.
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get('session') ?? req.cookies.get('access_token');
  const isLoggedIn = Boolean(sessionCookie);

  if (isProtected(pathname) && !isLoggedIn) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic(pathname) && isLoggedIn) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.searchParams.delete('next');
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
