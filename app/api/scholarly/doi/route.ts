import { NextResponse } from 'next/server';
import { resolveCrossrefDoi } from '@/lib/crossref-discovery';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const doi = (url.searchParams.get('doi') ?? '').trim();
  if (!doi) return NextResponse.json({ error: 'doi is required' }, { status: 400 });

  try {
    const record = await resolveCrossrefDoi(doi);
    if (!record) return NextResponse.json({ error: 'DOI not found in Crossref' }, { status: 404 });
    return NextResponse.json(record, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
    });
  } catch {
    return NextResponse.json({ error: 'Crossref metadata service is temporarily unavailable' }, { status: 502 });
  }
}
