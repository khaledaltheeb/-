import { NextRequest, NextResponse } from 'next/server';

import { isLensConfigured, searchLensScholarly } from '@/lib/lens/client';

export const dynamic = 'force-dynamic';

function parseIntParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  if (!isLensConfigured()) {
    return NextResponse.json(
      {
        status: 'not_configured',
        provider: 'the-lens',
        message: 'Lens Scholarly API access is not configured on this environment.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (query.length < 2) {
    return NextResponse.json(
      { status: 'invalid_request', message: 'q must contain at least 2 characters.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const result = await searchLensScholarly({
      query,
      size: parseIntParam(request.nextUrl.searchParams.get('size')),
      from: parseIntParam(request.nextUrl.searchParams.get('from')),
      yearFrom: parseIntParam(request.nextUrl.searchParams.get('year_from')),
      yearTo: parseIntParam(request.nextUrl.searchParams.get('year_to')),
    });

    return NextResponse.json(
      {
        status: 'ok',
        provider: 'the-lens',
        attribution: 'Data sourced from The Lens',
        query,
        result,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, no-store',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      },
    );
  } catch (error) {
    const status =
      typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
        ? error.status
        : 502;

    return NextResponse.json(
      {
        status: 'upstream_error',
        provider: 'the-lens',
        message: error instanceof Error ? error.message : 'Lens request failed.',
      },
      {
        status: status >= 400 && status < 600 ? status : 502,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
