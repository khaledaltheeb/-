import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

const LOCAL_PUBLIC_PREFIXES = [
  '/assessment-lab',
  '/assessment-measures',
  '/guided-assessment',
  '/cognitive-lab',
  '/capabilities/kids-lab',
  '/core-outcome-sets',
  '/resources',
  '/evidence-guides',
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

  // These public knowledge/tool sectors are intended for anonymous reading and
  // are either repository-rendered or perform their own read-only public data
  // access. Anonymous GET/HEAD requests do not need a Supabase auth refresh or
  // a database-backed legacy redirect lookup before the route can render.
  // Keeping them on the direct public path prevents transient auth/session
  // failures from turning otherwise valid public pages into HTTP 500 responses.
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
