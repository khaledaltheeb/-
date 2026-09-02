import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSearchBackendClient } from '@/lib/supabase/search-backend';
import { searchSocialWorkStaticPages } from '@/lib/social-work-search-index';
import { buildExtractiveAnswer, buildFreeQueryVariants } from '@/lib/free-search-intelligence';

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

type EvidenceRow = {
  entity_id: string;
  destination: string;
  title: string;
  heading: string;
  evidence_text: string;
  evidence_score: number;
};

type EdgeSearchResponse = {
  mode?: string;
  results?: SearchRow[];
  evidence?: EvidenceRow[];
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

async function searchViaPublicEdge(q: string, limit: number): Promise<{ rows: SearchRow[]; evidence: EvidenceRow[] }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!supabaseUrl) return { rows: [], evidence: [] };
  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/rawafid-public-search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ q, limit: Math.min(limit, 20) }),
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return { rows: [], evidence: [] };
    const data = await response.json() as EdgeSearchResponse;
    return {
      rows: Array.isArray(data.results) ? data.results : [],
      evidence: Array.isArray(data.evidence) ? data.evidence : [],
    };
  } catch {
    return { rows: [], evidence: [] };
  }
}

async function backendEvidence(q: string, rows: SearchRow[]): Promise<EvidenceRow[]> {
  const backend = createSearchBackendClient();
  if (!backend) return [];
  const ids = rows.map((row) => row.entity_id).filter(Boolean).slice(0, 8);
  if (!ids.length) return [];
  const { data, error } = await backend.rpc('search_platform_v4_evidence_for_pages', {
    p_query: q,
    p_entity_ids: ids,
    p_limit: Math.min(6, ids.length),
  });
  return !error && Array.isArray(data) ? data as EvidenceRow[] : [];
}

async function searchDatabaseVariant(q: string, limit: number) {
  const backend = createSearchBackendClient();
  if (backend) {
    const { data, error } = await backend.rpc('search_platform_v3_lexical', {
      p_query: q,
      p_limit: Math.min(limit, 100),
    });
    if (!error && Array.isArray(data) && data.length > 0) {
      const rows = data as SearchRow[];
      return { mode: 'v4-backend', rows, evidence: await backendEvidence(q, rows) };
    }
  }

  const edge = await searchViaPublicEdge(q, Math.min(limit, 20));
  if (edge.rows.length > 0) return { mode: 'v4-edge', rows: edge.rows, evidence: edge.evidence };

  const publicClient = await createClient();
  const { data, error } = await publicClient.rpc('search_platform', {
    p_query: q,
    p_limit: Math.min(limit, 100),
  });
  return { mode: 'legacy-fallback', rows: !error ? (data ?? []) as SearchRow[] : [], evidence: [] as EvidenceRow[] };
}

function evidenceAsResults(evidence: EvidenceRow[]): SearchRow[] {
  return evidence.map((row) => ({
    entity_type: 'content',
    entity_id: row.entity_id,
    slug: `evidence-${row.entity_id}`,
    title: row.title,
    subtitle: row.heading || null,
    excerpt: row.evidence_text,
    destination: row.destination,
    score: Number(row.evidence_score) + 10000,
  }));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = normalizeQuery(url.searchParams.get('q'));
  const limit = boundedLimit(url.searchParams.get('limit'));

  if (q.length < 2) {
    return NextResponse.json({ query: q, mode: 'empty', results: [], answer: null }, { status: 200 });
  }

  const variants = buildFreeQueryVariants(q);
  const dbGroups: SearchRow[][] = [];
  const evidenceGroups: EvidenceRow[][] = [];
  const modes = new Set<string>();

  for (const [index, variant] of variants.entries()) {
    const searched = await searchDatabaseVariant(variant, Math.min(limit * 3, 60));
    modes.add(searched.mode);
    dbGroups.push(searched.rows.map((row) => ({
      ...row,
      score: Number(row.score) + (index === 0 ? 140 : 0),
    })));
    evidenceGroups.push(searched.evidence);
  }

  const staticGroups = variants.map((variant, index) =>
    searchSocialWorkStaticPages(variant, Math.min(limit * 2, 100)).map((row) => ({
      ...row,
      score: Number(row.score) + (index === 0 ? 140 : 0),
    })) as SearchRow[],
  );

  const results = mergeResults([...dbGroups, ...staticGroups], limit);
  const rankedEvidence = evidenceGroups.flat()
    .sort((a, b) => Number(b.evidence_score) - Number(a.evidence_score))
    .filter((row, index, rows) => rows.findIndex((candidate) => candidate.destination === row.destination) === index)
    .slice(0, 6);
  const answerSource = rankedEvidence.length ? evidenceAsResults(rankedEvidence) : results;
  const answer = buildExtractiveAnswer(q, answerSource);
  const mode = variants.length > 1
    ? `zero-api-expanded:${[...modes].join('+') || 'local'}`
    : `zero-api:${[...modes].join('+') || 'local'}`;

  return NextResponse.json(
    { query: q, variants, mode, count: results.length, evidence_count: rankedEvidence.length, answer, results },
    {
      status: 200,
      headers: {
        'cache-control': 'private, max-age=0, no-store',
        'x-content-type-options': 'nosniff',
      },
    },
  );
}
