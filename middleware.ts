import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

const LOCAL_PUBLIC_PREFIXES = [
  '/assessment-lab',
  '/assessment-measures',
  '/cognitive-lab',
  '/core-outcome-sets',
] as const;

export async function middleware(request: NextRequest) {
  const hostname = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
    .split(':')[0]
    .trim()
    .toLowerCase();

  if (hostname === 'www.healthrenewal.org') {
    const canonical = request.nextUrl.clone();
    canonical.protocol = 'https:';
    canonical.host = 'healthrenewal.org';
    canonical.port = '';
    return NextResponse.redirect(canonical, 308);
  }

  // These public knowledge/tool sectors are rendered entirely from versioned
  // repository data. Anonymous GET/HEAD requests do not require a Supabase auth
  // refresh or a database-backed legacy redirect lookup. Keeping them on the
  // local Worker path removes an unnecessary network dependency and reduces
  // the blast radius of transient database/session failures without changing
  // authenticated or mutating requests elsewhere on the site.
  const pathname = request.nextUrl.pathname;
  const isLocalPublicRoute = LOCAL_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isLocalPublicRoute && ['GET', 'HEAD'].includes(request.method)) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|seo-card(?:/|$)|quick-info/(?:og|discover)(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|mjs|map|woff|woff2|ttf|otf|eot)$).*)'],
};
