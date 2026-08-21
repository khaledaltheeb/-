import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string; token: string }>;

const TOKEN_RE = /^[a-f0-9]{32}$/i;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,139}$/i;
const CANONICAL_RE = /^\/(?:content\/[a-z0-9-]+\/?|care-guides\/[a-z0-9-]+\/?|magazine\/pediatric-oncology\/[a-z0-9-]+\/[a-z0-9-]+\/?)$/i;

export async function GET(request: Request, { params }: { params: Params }) {
  const { slug, token } = await params;
  if (!SLUG_RE.test(slug) || !TOKEN_RE.test(token)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const requestedCanonical = requestUrl.searchParams.get('canonical') || `/content/${slug}`;
  if (!CANONICAL_RE.test(requestedCanonical)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const canonical = `https://healthrenewal.org${requestedCanonical}`;
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="index,follow"><meta name="rawafid-release-token" content="${token}"><link rel="canonical" href="${canonical}"><title>Rawafid release verification</title></head><body><main data-release-verification="pediatric-oncology">${canonical}</main></body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}
