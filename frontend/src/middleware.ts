import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedStudentPaths = ['/student'];
const protectedAdminPaths = ['/admin'];
const authPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isStudentPath = protectedStudentPaths.some((p) => pathname.startsWith(p));
  const isAdminPath = protectedAdminPaths.some((p) => pathname.startsWith(p));
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p));

  if ((isStudentPath || isAdminPath) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/admin/:path*', '/login', '/register'],
};
