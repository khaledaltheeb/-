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

  // Assessment Lab routes are fully prerendered from versioned local data and do
  // not require authentication or the database-backed legacy redirect registry.
  // Serving them directly removes an unnecessary network dependency from a public
  // static route while preserving canonical-host handling above.
  const pathname = request.nextUrl.pathname;
  if (
    (pathname === '/assessment-lab' || pathname.startsWith('/assessment-lab/'))
    && ['GET', 'HEAD'].includes(request.method)
  ) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|seo-card(?:/|$)|quick-info/(?:og|discover)(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
