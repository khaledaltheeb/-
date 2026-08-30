import { NextRequest, NextResponse } from 'next/server';

import { aggregateLensLandscape, type LensLandscapeDimension } from '@/lib/lens/aggregation';
import { isLensConfigured } from '@/lib/lens/client';

export const dynamic = 'force-dynamic';

const DIMENSIONS = new Set<LensLandscapeDimension>([
  'year',
  'field',
  'country',
  'institution',
  'publication_type',
  'open_access',
]);

function parseIntParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  if (!isLensConfigured()) {
    return NextResponse.json(
      { status: 'not_configured', provider: 'the-lens' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const dimension = request.nextUrl.searchParams.get('dimension') as LensLandscapeDimension | null;
  if (query.length < 2 || !dimension || !DIMENSIONS.has(dimension)) {
    return NextResponse.json(
      {
        status: 'invalid_request',
        message: 'q and a supported dimension are required.',
        supported_dimensions: [...DIMENSIONS],
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const result = await aggregateLensLandscape({
      query,
      dimension,
      size: parseIntParam(request.nextUrl.searchParams.get('size')),
      yearFrom: parseIntParam(request.nextUrl.searchParams.get('year_from')),
      yearTo: parseIntParam(request.nextUrl.searchParams.get('year_to')),
    });

    return NextResponse.json(
      {
        status: 'ok',
        provider: 'the-lens',
        attribution: { label: 'Data sourced from The Lens', url: 'https://www.lens.org/' },
        query,
        dimension,
        result,
      },
      {
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
      { status: 'upstream_error', provider: 'the-lens', message: error instanceof Error ? error.message : 'Lens request failed.' },
      { status: status >= 400 && status < 600 ? status : 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
