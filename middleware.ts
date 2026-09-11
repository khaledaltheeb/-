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

  // First-class public knowledge, institutional, tool and crawler surfaces must
  // remain readable even when Supabase auth/redirect lookups are degraded. These
  // routes are either repository-rendered or perform their own read-only public
  // data access, so anonymous GET/HEAD requests do not need session refresh or a
  // database-backed legacy redirect lookup before the route can render.
  // Exact matching protects historical redirect behavior for unrelated subpaths;
  // only namespaces that are entirely first-class public surfaces use prefixes.
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
