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
  '/external-review',
  '/sitemaps',
  '/developers',
  '/en/developers',
  '/api/v1',
  '/en/publishing',
  '/publishing',
] as const;

const LOCAL_PUBLIC_EXACT = new Set([
  '/all-pages',
  '/institutions',
  '/en/institutions',
  '/institutions/arabic-rtl-assurance',
  '/institutions/terminology-qa',
  '/institutions/open-source',
  '/institutions/technology-evaluation',
  '/institutions/patient-participation',
  '/media',
  '/accessibility-statement',
  '/tools/rare-phenotype-navigator',
  '/api/openapi.json',
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
]);

function normalizedPublicPath(pathname: string) {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

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

  // First-class public knowledge, institutional, publishing, developer, API and crawler
  // surfaces must remain readable without auth-session refresh. Public API routes enforce
  // their own optional Partner API authorization and quota boundary, so bypassing the
  // Supabase session middleware here also prevents Bearer partner credentials from being
  // interpreted as user-session credentials.
  const pathname = request.nextUrl.pathname;
  const normalizedPathname = normalizedPublicPath(pathname);
  const isLocalPublicRoute = LOCAL_PUBLIC_EXACT.has(normalizedPathname)
    || LOCAL_PUBLIC_PREFIXES.some(
      (prefix) => normalizedPathname === prefix || normalizedPathname.startsWith(`${prefix}/`),
    );

  if (isLocalPublicRoute && ['GET', 'HEAD'].includes(request.method)) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|seo-card(?:/|$)|quick-info/(?:og|discover)(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|mjs|map|woff|woff2|ttf|otf|eot)$).*)'],
};
