import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSearchBackendClient } from '@/lib/supabase/search-backend';
import { searchSocialWorkStaticPages } from '@/lib/social-work-search-index';

export const dynamic = 'force-dynamic';

type SearchRow = {
  entity_type: string;
  entity_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  destination: string;
  score: number;
};

function boundedLimit(value: string | null) {
  const n = Number(value ?? 30);
  return Number.isFinite(n) ? Math.max(1, Math.min(Math.trunc(n), 100)) : 30;
}

function normalizeQuery(value: string | null) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, 160);
}

function mergeResults(groups: SearchRow[][], limit: number) {
  const byDestination = new Map<string, SearchRow>();
  for (const row of groups.flat()) {
    if (!row?.destination || !row?.title) continue;
    const previous = byDestination.get(row.destination);
    if (!previous || Number(row.score) > Number(previous.score)) byDestination.set(row.destination, row);
  }
  return [...byDestination.values()]
    .sort((a, b) => Number(b.score) - Number(a.score) || a.title.localeCompare(b.title, 'ar'))
    .slice(0, limit);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = normalizeQuery(url.searchParams.get('q'));
  const limit = boundedLimit(url.searchParams.get('limit'));

  if (q.length < 2) {
    return NextResponse.json({ query: q, mode: 'empty', results: [] }, { status: 200 });
  }

  const staticRows = searchSocialWorkStaticPages(q, Math.min(limit * 2, 100)) as SearchRow[];
  let dbRows: SearchRow[] = [];
  let mode = 'legacy-fallback';

  const backend = createSearchBackendClient();
  if (backend) {
    const { data, error } = await backend.rpc('search_platform_v3_lexical', {
      p_query: q,
      p_limit: Math.min(limit * 3, 100),
    });
    if (!error) {
      dbRows = (data ?? []) as SearchRow[];
      mode = 'v3';
    }
  }

  if (dbRows.length === 0) {
    const publicClient = await createClient();
    const { data, error } = await publicClient.rpc('search_platform', {
      p_query: q,
      p_limit: Math.min(limit * 3, 100),
    });
    if (!error) dbRows = (data ?? []) as SearchRow[];
  }

  const results = mergeResults([dbRows, staticRows], limit);
  return NextResponse.json(
    { query: q, mode, count: results.length, results },
    {
      status: 200,
      headers: {
        'cache-control': 'private, max-age=0, no-store',
        'x-content-type-options': 'nosniff',
      },
    },
  );
}
