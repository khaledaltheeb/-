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

  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|seo-card(?:/|$)|quick-info/(?:cards|og)(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
