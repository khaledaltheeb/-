import { NextRequest, NextResponse } from 'next/server';

const PAVS_HPO_ENDPOINT = 'https://pavs.phenomebrowser.net/api/search/hpo';
const HPO_ID = /^HP:\d{7}$/;

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').trim();
  if (q.length < 2 || q.length > 120) {
    return NextResponse.json({ error: 'query_must_be_2_to_120_characters' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const upstream = await fetch(`${PAVS_HPO_ENDPOINT}?q=${encodeURIComponent(q)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'Rawafid-Rare-Phenotype-Navigator/1.0' },
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: 'hpo_source_unavailable' }, { status: 502 });
    }
    const raw = await upstream.json() as unknown;
    const rows = Array.isArray(raw) ? raw : [];
    const items = rows
      .map((row) => {
        const record = row && typeof row === 'object' ? row as Record<string, unknown> : {};
        const id = String(record.id || '').trim();
        const label = String(record.label || record.name || id).trim();
        if (!HPO_ID.test(id) || !label) return null;
        return { id, label };
      })
      .filter((row): row is { id: string; label: string } => Boolean(row))
      .slice(0, 30);

    return NextResponse.json({ items, source: 'PAVS', sourceUrl: 'https://pavs.phenomebrowser.net/' }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' },
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json({ error: aborted ? 'hpo_source_timeout' : 'hpo_source_error' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
