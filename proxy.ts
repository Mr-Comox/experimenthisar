import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const verified = request.cookies.get('ageVerified')?.value === 'true';
  const path = request.nextUrl.pathname;

  console.log('[proxy] path:', path, '| verified:', verified);

  if (path.startsWith('/age-gate')) return NextResponse.next();

  if (!verified) {
    const url = request.nextUrl.clone();
    url.pathname = '/age-gate';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // This regex matches all routes except _next internals, api, and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)'],
};
