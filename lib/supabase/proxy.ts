import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasSupabaseAuthCookie } from '@/lib/supabase/auth-cookie';

const protectedPrefixes = [
  '/account',
  '/admin',
  '/dashboard',
  '/specialist',
  '/center',
  '/messages',
  '/appointments',
  '/notifications',
  '/specialists-partners/account',
  '/specialists-partners/admin',
  '/specialists-partners/portal',
];

const redirectExcludedPrefixes = [
  '/account',
  '/admin',
  '/auth',
  '/login',
  '/mfa',
  '/forgot-password',
  '/reset-password',
  '/dashboard',
  '/specialist',
  '/center',
  '/messages',
  '/appointments',
  '/notifications',
  '/specialists-partners/account',
  '/specialists-partners/admin',
  '/specialists-partners/portal',
  '/api',
  '/seo-card',
  '/quick-info/cards',
  '/quick-info/og',
];

const encyclopediaConditionAliases = new Set([
  'alcohol-use-disorder',
  'autism',
  'cannabis-use-disorder',
  'depression',
  'gambling-related-harms',
  'gaming-disorder',
  'inhalant-use-disorder',
  'nicotine-tobacco-dependence',
  'opioid-use-disorder',
  'polysubstance-use-and-overdose-risk',
  'sedative-benzodiazepine-use-disorder',
  'stimulant-use-disorder',
]);

const REDIRECT_TTL_MS = 60_000;
const REDIRECT_CACHE_LIMIT = 500;
const LEGACY_ROUTE_TTL_MS = 300_000;
const LEGACY_ROUTE_CACHE_LIMIT = 2_000;

type RedirectCacheItem = { destination: string | null; status: 301 | 302 | 307 | 308; expiresAt: number };
type LegacyRouteCacheItem = { exists: boolean; expiresAt: number };
const redirectCache = new Map<string, RedirectCacheItem>();
const legacyRouteCache = new Map<string, LegacyRouteCacheItem>();

function isPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function canResolveRedirect(request: NextRequest) {
  if (!['GET', 'HEAD'].includes(request.method)) return false;
  return !redirectExcludedPrefixes.some((prefix) => isPrefix(request.nextUrl.pathname, prefix));
}

function validRedirectStatus(value: number): value is 301 | 302 | 307 | 308 {
  return value === 301 || value === 302 || value === 307 || value === 308;
}

function decodedPathname(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function headerSafePathname(pathname: string) {
  return encodeURI(pathname);
}

function preservedContentAliasCanonical(pathname: string) {
  const match = pathname.match(/^\/content\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
  if (!match) return null;
  const slug = match[1];
  if (encyclopediaConditionAliases.has(slug)) return `/encyclopedia/${slug}/`;
  if (slug === 'capabilities-hub') return '/capabilities/';
  if (slug.startsWith('capabilities-')) return `/capabilities/${slug.slice('capabilities-'.length)}/`;
  if (slug === 'comparisons-hub') return '/comparisons/';
  if (slug.startsWith('comparisons-')) return `/comparisons/${slug.slice('comparisons-'.length)}/`;
  return null;
}

function applyPreservedAliasSeoHeaders(response: NextResponse, pathname: string) {
  const canonical = preservedContentAliasCanonical(pathname);
  if (!canonical) return response;
  response.headers.set('X-Robots-Tag', 'noindex, follow');
  response.headers.append('Link', `<${canonical}>; rel="canonical"`);
  return response;
}

export async function updateSession(request: NextRequest) {
  // Canonical host enforcement must happen before auth and database redirect work.
  // Preserve path/query while permanently consolidating www signals into healthrenewal.org.
  if (request.nextUrl.hostname.toLowerCase() === 'www.healthrenewal.org') {
    const canonicalHost = request.nextUrl.clone();
    canonicalHost.protocol = 'https:';
    canonicalHost.hostname = 'healthrenewal.org';
    canonicalHost.port = '';
    return NextResponse.redirect(canonicalHost, 308);
  }

  const trustedPathname = decodedPathname(request.nextUrl.pathname);
  const forwardedHeaders = () => {
    const headers = new Headers(request.headers);
    headers.set('x-rawafid-pathname', headerSafePathname(trustedPathname));
    return headers;
  };
  let response = NextResponse.next({ request: { headers: forwardedHeaders() } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: forwardedHeaders() } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  const pathname = trustedPathname;
  // The preservation lookup treats `/legacy` and `/legacy/` as the same historical
  // production route, matching the database function. Normalizing the cache/RPC key
  // keeps both boundary variants protected without using noindex for slash handling.
  const legacyLookupPathname = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
  let legacyExists: boolean | null = null;
  async function isLegacyProductionRoute() {
    if (legacyExists !== null) return legacyExists;
    const cached = legacyRouteCache.get(legacyLookupPathname);
    if (cached && cached.expiresAt > Date.now()) {
      legacyExists = cached.exists;
      return legacyExists;
    }
    const { data, error } = await supabase.rpc('legacy_preserved_route_exists', { p_route: legacyLookupPathname });
    legacyExists = !error && data === true;
    if (legacyRouteCache.size >= LEGACY_ROUTE_CACHE_LIMIT) legacyRouteCache.clear();
    legacyRouteCache.set(legacyLookupPathname, { exists: legacyExists, expiresAt: Date.now() + LEGACY_ROUTE_TTL_MS });
    return legacyExists;
  }

  if (canResolveRedirect(request)) {
    const cached = redirectCache.get(request.nextUrl.pathname);
    let destination = cached && cached.expiresAt > Date.now() ? cached.destination : null;
    let status: 301 | 302 | 307 | 308 = cached && cached.expiresAt > Date.now() ? cached.status : 301;

    if (!cached || cached.expiresAt <= Date.now()) {
      const { data, error } = await supabase
        .from('redirects')
        .select('destination_path,status_code')
        .eq('source_path', request.nextUrl.pathname)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && data) {
        destination = typeof data.destination_path === 'string' ? data.destination_path : null;
        status = validRedirectStatus(Number(data.status_code)) ? Number(data.status_code) as 301 | 302 | 307 | 308 : 301;
      }

      if (redirectCache.size >= REDIRECT_CACHE_LIMIT) redirectCache.clear();
      redirectCache.set(request.nextUrl.pathname, { destination, status, expiresAt: Date.now() + REDIRECT_TTL_MS });
    }

    if (destination && destination.startsWith('/') && !destination.startsWith('//')) {
      if (!(await isLegacyProductionRoute())) {
        const target = request.nextUrl.clone();
        target.pathname = destination;
        return NextResponse.redirect(target, status);
      }
    }
  }

  const isProtected = protectedPrefixes.some((prefix) => isPrefix(request.nextUrl.pathname, prefix));
  const shouldCheckAuth = isProtected || hasSupabaseAuthCookie(request.cookies.getAll());
  const claimsResult = shouldCheckAuth ? await supabase.auth.getClaims() : null;
  const claims = claimsResult?.data?.claims;

  if (isProtected && !claims?.sub) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url, 307);
  }

  if (isProtected && claims?.sub) {
    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const factors = assurance.error ? null : await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp = (factors?.data?.totp ?? []).some((factor) => factor.status === 'verified');
    if (assurance.error || factors?.error || (hasVerifiedTotp && assurance.data.currentLevel !== 'aal2')) {
      const url = request.nextUrl.clone();
      url.pathname = '/mfa';
      url.search = '';
      url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
      if (assurance.error || factors?.error) url.searchParams.set('error', 'assurance_check');
      return NextResponse.redirect(url);
    }
  }

  // Do not use noindex as a URL-normalization mechanism. Several first-class public
  // routes intentionally use a trailing slash as their self-canonical URL. Duplicate
  // variants are consolidated by each page's canonical tag instead of risking a
  // contradictory X-Robots-Tag on the canonical URL itself.
  return applyPreservedAliasSeoHeaders(response, request.nextUrl.pathname);
}
