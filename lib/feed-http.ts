import { createHash, randomUUID } from 'node:crypto';

const DEFAULT_CACHE = 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600';

function weakTag(value: string) {
  return value.trim().replace(/^W\//i, '');
}

function matchesEtag(header: string | null, etag: string) {
  if (!header) return false;
  if (header.trim() === '*') return true;
  const expected = weakTag(etag);
  return header.split(',').some((candidate) => weakTag(candidate) === expected);
}

function validDate(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

export type FeedResponseOptions = {
  contentType: string;
  cacheControl?: string;
  lastModified?: string | null;
};

export function feedResponse(request: Request, body: string, options: FeedResponseOptions) {
  const etag = `"${createHash('sha256').update(body).digest('base64url')}"`;
  const lastModified = validDate(options.lastModified);
  const headers = new Headers({
    'Content-Type': options.contentType,
    'Cache-Control': options.cacheControl || DEFAULT_CACHE,
    'Content-Language': 'ar',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    ETag: etag,
    'X-Request-Id': request.headers.get('x-request-id')?.slice(0, 120) || randomUUID(),
  });
  if (lastModified) headers.set('Last-Modified', lastModified.toUTCString());

  const ifNoneMatch = request.headers.get('if-none-match');
  const notModifiedByTag = matchesEtag(ifNoneMatch, etag);
  let notModifiedByDate = false;
  if (!ifNoneMatch && lastModified) {
    const ifModifiedSince = validDate(request.headers.get('if-modified-since'));
    if (ifModifiedSince) notModifiedByDate = lastModified.getTime() <= ifModifiedSince.getTime() + 999;
  }
  if (notModifiedByTag || notModifiedByDate) return new Response(null, { status: 304, headers });
  return new Response(body, { status: 200, headers });
}

export function feedUnavailable(request: Request, detail: string) {
  const requestId = request.headers.get('x-request-id')?.slice(0, 120) || randomUUID();
  return new Response(JSON.stringify({
    type: 'about:blank',
    title: 'Feed temporarily unavailable',
    status: 503,
    detail,
    request_id: requestId,
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/problem+json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': '60',
      'X-Content-Type-Options': 'nosniff',
      'X-Request-Id': requestId,
    },
  });
}
