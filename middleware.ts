import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

const legacyTrailingSlashExact = new Set([
  '/about/',
  '/accessibility-statement/',
  '/accessibility/',
  '/audiences/',
  '/capabilities/expanded/',
  '/categories/الدافعية-والسلوك/',
  '/cochrane/evidence-academy/',
  '/cochrane/',
  '/en/',
  '/encyclopedia/all/',
  '/es/',
  '/family/',
  '/iris/cited-guides/',
  '/iris/',
  '/learning-paths/',
  '/library/',
  '/magazine/',
  '/outside-the-box/',
  '/quick-info/',
  '/schools/',
  '/sections/',
  '/sectors/all-pages/',
  '/sectors/calendars/',
  '/sectors/home/',
  '/sectors/',
  '/sectors/women/',
  '/sectors/youth/',
  '/services/',
  '/source-registry/',
  '/specialists-partners/',
  '/start-here/',
  '/terms/',
  '/tips/',
  '/trust/',
  '/verified-resources/',
]);

const legacyTrailingSlashPrefixes = [
  '/assessments/',
  '/cognitive-tests/',
  '/daily-tools/',
];

function decodedPathname(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function preserveHistoricalTrailingSlash(pathname: string) {
  if (!pathname.endsWith('/')) return false;
  const candidate = decodedPathname(pathname);
  if (legacyTrailingSlashExact.has(candidate)) return true;
  return legacyTrailingSlashPrefixes.some((prefix) => candidate.startsWith(prefix));
}

function normalizeModernTrailingSlash(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.length <= 1 || !pathname.endsWith('/') || preserveHistoricalTrailingSlash(pathname)) return null;
  const url = request.nextUrl.clone();
  url.pathname = pathname.replace(/\/+$/, '');
  return NextResponse.redirect(url, 308);
}

export async function middleware(request: NextRequest) {
  const normalization = normalizeModernTrailingSlash(request);
  if (normalization) return normalization;
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
