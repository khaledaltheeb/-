import { NextResponse } from 'next/server';
import { searchBothBookIndexes, searchOpenBooks, type BookSource } from '@/lib/scholarly-discovery';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') ?? '').trim();
  const source = (url.searchParams.get('source') ?? 'both').toLowerCase();
  const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit') ?? 10) || 10, 25));

  if (query.length < 2) {
    return NextResponse.json({ error: 'q must contain at least 2 characters' }, { status: 400 });
  }

  try {
    if (source === 'oapen' || source === 'doab') {
      const records = await searchOpenBooks(query, source as BookSource, limit);
      return NextResponse.json({ query, source, records }, {
        headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
      });
    }
    const result = await searchBothBookIndexes(query, limit);
    return NextResponse.json({ query, source: 'both', ...result }, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Open-book metadata service is temporarily unavailable' }, { status: 502 });
  }
}
