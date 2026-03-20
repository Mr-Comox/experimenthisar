import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/', '/reservation', '/menu'];

export function proxy(request: NextRequest) {
  const verified = request.cookies.get('ageVerified')?.value === 'true';
  const path = request.nextUrl.pathname;

  if (path === '/age-gate') return NextResponse.next();

  const isProtected = PROTECTED.some(
    (p) => path === p || path.startsWith(p + '/'),
  );

  if (isProtected && !verified) {
    const url = request.nextUrl.clone();
    url.pathname = '/age-gate';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/reservation/:path*', '/menu/:path*'],
};
