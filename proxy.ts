import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/reservation', '/menu'];

export function proxy(request: NextRequest) {
  const verified = request.cookies.get('ageVerified')?.value === 'true';
  const isProtected = PROTECTED.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !verified) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/reservation/:path*', '/menu/:path*'],
};
