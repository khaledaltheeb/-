import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSearchBackendClient } from '@/lib/supabase/search-backend';
import { searchSocialWorkStaticPages } from '@/lib/social-work-search-index';
import {
  analyzeAssistantQuery,
  buildAssistantAnswer,
  buildAssistantQueryVariants,
  rerankAssistantResults,
} from '@/lib/assistant-intelligence-v2';

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

const EXPLICIT_TOPIC_PATTERN = /(توحد|autism|adhd|فرط\s*الحرك|تشتت|ديسلكس|عسر\s*القراء|تأخر\s*(?:الكلام|النطق)|وسواس|ocd|erp|aac|قلق\s*اجتماعي|رهاب\s*اجتماعي|اكتئاب|ادمان|إدمان|انسحاب|مرض\s*نادر|علاج\s*جيني|سرطان|صرع|عمل\s*اجتماعي|خدمه\s*اجتماعي|خدمة\s*اجتماعي|تربيه\s*دامج|تربية\s*دامج|تعليم\s*دامج|متلازمه\s*داون|متلازمة\s*داون|شلل\s*دماغي|صعوبات\s*التعلم)/iu;
const FOLLOW_UP_PATTERN = /^(?:و?ماذا(?:\s+عن)?|و?ما(?:\s+عن)?|طيب|تمام|و?كيف|و?هل|و?العلاج|و?التشخيص|و?التقييم|و?الاعراض|و?الأعراض|و?الدعم|و?المدرسه|و?المدرسة|و?الدواء|و?الادويه|و?الأدوية|و?الاسره|و?الأسرة|و?المضاعفات|و?الاسباب|و?الأسباب|و?الفرق)(?:\s|$)/iu;

function boundedLimit(value: string | null) {
  const n = Number(value ?? 30);
  return Number.isFinite(n) ? Math.max(1, Math.min(Math.trunc(n), 100)) : 30;
}

function normalizeQuery(value: string | null, maxLength = 220) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function contextualizeQuery(query: string, context: string) {
  if (!context || context === query || EXPLICIT_TOPIC_PATTERN.test(query)) return query;
  const tokenCount = query.split(/\s+/u).filter(Boolean).length;
  const looksLikeFollowUp = FOLLOW_UP_PATTERN.test(query) || tokenCount <= 4;
  if (!looksLikeFollowUp) return query;
  const recentContext = context
    .split('||')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(-2)
    .join(' ');
  return `${recentContext} ${query}`.replace(/\s+/g, ' ').trim().slice(0, 320);
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
  const context = normalizeQuery(url.searchParams.get('context'), 660);
  const resolvedQuery = contextualizeQuery(q, context);
  const limit = boundedLimit(url.searchParams.get('limit'));

  if (q.length < 2) {
    return NextResponse.json({ query: q, resolved_query: q, mode: 'empty', results: [], answer: null }, { status: 200 });
  }

  const analysis = analyzeAssistantQuery(resolvedQuery);
  if (analysis.clarification_question && analysis.topics.length === 0) {
    return NextResponse.json(
      {
        query: q,
        resolved_query: resolvedQuery,
        contextual: resolvedQuery !== q,
        mode: 'zero-api-clarification',
        analysis,
        count: 0,
        evidence_count: 0,
        answer: null,
        results: [],
      },
      { status: 200, headers: { 'cache-control': 'private, max-age=0, no-store', 'x-content-type-options': 'nosniff' } },
    );
  }

  const variants = buildAssistantQueryVariants(resolvedQuery, analysis).slice(0, 4);
  const searchedVariants = await Promise.all(
    variants.map((variant) => searchDatabaseVariant(variant, Math.min(limit * 3, 60))),
  );
  const modes = new Set(searchedVariants.map((searched) => searched.mode));
  const dbGroups = searchedVariants.map((searched, index) => searched.rows.map((row) => ({
    ...row,
    score: Number(row.score) + (index === 0 ? 160 : Math.max(0, 90 - index * 20)),
  })));
  const evidenceGroups = searchedVariants.map((searched) => searched.evidence);

  const staticGroups = variants.map((variant, index) =>
    searchSocialWorkStaticPages(variant, Math.min(limit * 2, 100)).map((row) => ({
      ...row,
      score: Number(row.score) + (index === 0 ? 160 : Math.max(0, 90 - index * 20)),
    })) as SearchRow[],
  );

  const candidates = mergeResults([...dbGroups, ...staticGroups], Math.min(limit * 4, 80));
  const results = rerankAssistantResults(resolvedQuery, analysis, candidates).slice(0, limit);
  const rankedEvidence = evidenceGroups.flat()
    .sort((a, b) => Number(b.evidence_score) - Number(a.evidence_score))
    .filter((row, index, rows) => rows.findIndex((candidate) => candidate.destination === row.destination) === index)
    .slice(0, 8);
  const answerSource = rankedEvidence.length
    ? rerankAssistantResults(resolvedQuery, analysis, evidenceAsResults(rankedEvidence))
    : results;
  const answer = buildAssistantAnswer(resolvedQuery, analysis, answerSource);
  const contextual = resolvedQuery !== q;
  const modePrefix = contextual ? 'zero-api-v2-contextual' : variants.length > 1 ? 'zero-api-v2-expanded' : 'zero-api-v2';
  const mode = `${modePrefix}:${[...modes].join('+') || 'local'}`;

  return NextResponse.json(
    {
      query: q,
      resolved_query: resolvedQuery,
      contextual,
      variants,
      mode,
      analysis,
      count: results.length,
      evidence_count: rankedEvidence.length,
      answer,
      results,
    },
    {
      status: 200,
      headers: {
        'cache-control': 'private, max-age=0, no-store',
        'x-content-type-options': 'nosniff',
      },
    },
  );
}
