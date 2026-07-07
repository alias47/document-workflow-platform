import { type NextRequest, NextResponse } from 'next/server';

const STAFF_PROTECTED = ['/dashboard', '/applicants', '/staff', '/reports', '/search', '/settings'];
const APPLICANT_PROTECTED = [
  '/applicant/profile',
  '/applicant/documents',
  '/applicant/change-password',
];
const APPLICANT_PUBLIC = ['/applicant/login', '/applicant/activate'];
const PUBLIC = ['/login', '/forgot-password', '/reset-password', '/register'];

const ACCESS_TOKEN_COOKIE = 'access_token';
const APPLICANT_ACCESS_TOKEN_COOKIE = 'applicant_access_token';

function isStaffProtected(pathname: string) {
  return STAFF_PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isStaffPublic(pathname: string) {
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isApplicantProtected(pathname: string) {
  return APPLICANT_PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isApplicantPublicOnly(pathname: string) {
  return APPLICANT_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets and Next.js internals — skip
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const isStaffLoggedIn = Boolean(req.cookies.get(ACCESS_TOKEN_COOKIE));
  const isApplicantLoggedIn = Boolean(req.cookies.get(APPLICANT_ACCESS_TOKEN_COOKIE));

  // Staff portal protection
  if (isStaffProtected(pathname) && !isStaffLoggedIn) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isStaffPublic(pathname) && isStaffLoggedIn) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.searchParams.delete('next');
    return NextResponse.redirect(dashboardUrl);
  }

  // Applicant portal protection
  if (isApplicantProtected(pathname) && !isApplicantLoggedIn) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/applicant/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isApplicantPublicOnly(pathname) && isApplicantLoggedIn) {
    const portalUrl = req.nextUrl.clone();
    portalUrl.pathname = '/applicant';
    portalUrl.searchParams.delete('next');
    return NextResponse.redirect(portalUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
