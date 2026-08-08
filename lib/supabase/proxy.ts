import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const protectedPrefixes = ['/account', '/admin', '/dashboard', '/specialist', '/center', '/messages', '/appointments', '/notifications'];
const redirectExcludedPrefixes = ['/account', '/admin', '/auth', '/login', '/forgot-password', '/reset-password', '/dashboard', '/specialist', '/center', '/messages', '/appointments', '/notifications', '/api'];
const REDIRECT_TTL_MS = 60_000;
const REDIRECT_CACHE_LIMIT = 500;

type RedirectCacheItem = { destination: string | null; status: 301 | 302 | 307 | 308; expiresAt: number };
const redirectCache = new Map<string, RedirectCacheItem>();

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

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  if (canResolveRedirect(request)) {
    const pathname = request.nextUrl.pathname;
    const cached = redirectCache.get(pathname);
    let destination = cached && cached.expiresAt > Date.now() ? cached.destination : null;
    let status: 301 | 302 | 307 | 308 = cached && cached.expiresAt > Date.now() ? cached.status : 301;

    if (!cached || cached.expiresAt <= Date.now()) {
      const { data, error } = await supabase
        .from('redirects')
        .select('destination_path,status_code')
        .eq('source_path', pathname)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && data) {
        destination = typeof data.destination_path === 'string' ? data.destination_path : null;
        status = validRedirectStatus(Number(data.status_code)) ? Number(data.status_code) as 301 | 302 | 307 | 308 : 301;
      }

      if (redirectCache.size >= REDIRECT_CACHE_LIMIT) redirectCache.clear();
      redirectCache.set(pathname, { destination, status, expiresAt: Date.now() + REDIRECT_TTL_MS });
    }

    if (destination && destination.startsWith('/') && !destination.startsWith('//')) {
      const target = request.nextUrl.clone();
      target.pathname = destination;
      return NextResponse.redirect(target, status);
    }
  }

  const { data } = await supabase.auth.getClaims();
  const isProtected = protectedPrefixes.some((prefix) => isPrefix(request.nextUrl.pathname, prefix));

  if (isProtected && !data?.claims?.sub) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  return response;
}
