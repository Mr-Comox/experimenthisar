import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const verified = request.cookies.get('ageVerified')?.value === 'true';
  const path = request.nextUrl.pathname;

  // Always allow age-gate page through
  if (path.startsWith('/age-gate')) return NextResponse.next();

  // Not verified — redirect to age gate
  if (!verified) {
    const url = request.nextUrl.clone();
    url.pathname = '/age-gate';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)'],
};
