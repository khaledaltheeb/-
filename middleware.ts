import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

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

  // Assessment Lab and Core Outcome Sets routes are fully prerendered from
  // versioned local data. Anonymous GET/HEAD requests do not need Supabase auth
  // refreshes or database-backed legacy redirect lookups. Serving these routes
  // directly removes an unnecessary runtime dependency while preserving the
  // canonical-host redirect above.
  const pathname = request.nextUrl.pathname;
  const isStaticAssessmentRoute =
    pathname === '/assessment-lab'
    || pathname.startsWith('/assessment-lab/')
    || pathname === '/core-outcome-sets'
    || pathname.startsWith('/core-outcome-sets/');

  if (isStaticAssessmentRoute && ['GET', 'HEAD'].includes(request.method)) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|seo-card(?:/|$)|quick-info/(?:og|discover)(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|mjs|map|woff|woff2|ttf|otf|eot)$).*)'],
};
