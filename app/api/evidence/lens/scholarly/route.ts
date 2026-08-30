import { NextRequest, NextResponse } from 'next/server';

import { normalizeLensRecords } from '@/lib/evidence/normalize-lens';
import { isLensConfigured, searchLensScholarly } from '@/lib/lens/client';

export const dynamic = 'force-dynamic';

function parseIntParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolParam(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === '1' || value.toLowerCase() === 'true') return true;
  if (value === '0' || value.toLowerCase() === 'false') return false;
  return undefined;
}

function parseListParam(value: string | null): string[] | undefined {
  if (!value) return undefined;
  const values = value.split(',').map((item) => item.trim()).filter(Boolean);
  return values.length ? values : undefined;
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
      publicationTypes: parseListParam(request.nextUrl.searchParams.get('publication_type')),
      openAccessOnly: parseBoolParam(request.nextUrl.searchParams.get('open_access')),
      includeRetracted: parseBoolParam(request.nextUrl.searchParams.get('include_retracted')),
    });

    const records = normalizeLensRecords(result.data ?? []);

    return NextResponse.json(
      {
        status: 'ok',
        provider: 'the-lens',
        attribution: {
          label: 'Data sourced from The Lens',
          url: 'https://www.lens.org/',
        },
        query,
        total: result.total ?? records.length,
        records,
        limits: result._rawafid ?? null,
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
