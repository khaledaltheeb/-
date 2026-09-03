import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSearchBackendClient } from '@/lib/supabase/search-backend';
import { searchSocialWorkStaticPages } from '@/lib/social-work-search-index';
import {
  analyzeFreeQuery,
  buildExtractiveAnswer,
  buildFreeQueryVariants,
  rerankFreeResults,
  type QueryUnderstanding,
} from '@/lib/free-search-intelligence';

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
const CONTEXT_RESOLVED_BUDGET = 320;

function boundedLimit(value: string | null) {
  const n = Number(value ?? 30);
  return Number.isFinite(n) ? Math.max(1, Math.min(Math.trunc(n), 100)) : 30;
}

function normalizeQuery(value: string | null, maxLength = 220) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function contextualizeQuery(query: string, context: string) {
  if (!context || context === query) return query;
  const tokenCount = query.split(/\s+/u).filter(Boolean).length;
  const explicitTopic = EXPLICIT_TOPIC_PATTERN.test(query);
  const explicitFollowUp = FOLLOW_UP_PATTERN.test(query);
  const looksLikeFollowUp = explicitFollowUp || (!explicitTopic && tokenCount <= 4);
  if (!looksLikeFollowUp) return query;

  const recentContext = context
    .split('||')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(-3)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  // The current turn is authoritative and must never be truncated by older
  // context. Spend only the remaining budget on the most recent context tail.
  const contextBudget = Math.max(0, CONTEXT_RESOLVED_BUDGET - query.length - 1);
  if (!contextBudget || !recentContext) return query;
  const boundedContext = recentContext.slice(-contextBudget).trim();
  return boundedContext ? `${boundedContext} ${query}` : query;
}

function comparisonSubjectsFromTurn(query: string) {
  const cleaned = query.replace(/[؟?]/g, ' ').replace(/\s+/g, ' ').trim();
  const between = cleaned.match(/(?:الفرق|مقارن(?:ة|ه))\s+بين\s+(.{2,55}?)\s+و(?:بين\s+)?(.{2,55})/iu);
  if (!between) return [];
  return [between[1], between[2]].map((item) => item.trim()).filter(Boolean).slice(0, 2);
}

function analyzeWithCurrentTurn(query: string, resolvedQuery: string): QueryUnderstanding {
  const contextualAnalysis = analyzeFreeQuery(resolvedQuery);
  if (resolvedQuery === query) {
    const betweenSubjects = comparisonSubjectsFromTurn(query);
    return betweenSubjects.length === 2
      ? { ...contextualAnalysis, comparison_subjects: betweenSubjects }
      : contextualAnalysis;
  }

  const turnAnalysis = analyzeFreeQuery(query);
  const currentIntentIsSpecific = turnAnalysis.intent !== 'general';
  const betweenSubjects = comparisonSubjectsFromTurn(query);

  return {
    ...contextualAnalysis,
    intent: currentIntentIsSpecific ? turnAnalysis.intent : contextualAnalysis.intent,
    question_parts: turnAnalysis.question_parts.length ? turnAnalysis.question_parts : contextualAnalysis.question_parts,
    comparison_subjects: betweenSubjects.length === 2
      ? betweenSubjects
      : turnAnalysis.comparison_subjects.length
        ? turnAnalysis.comparison_subjects
        : contextualAnalysis.comparison_subjects,
    confidence: Math.max(contextualAnalysis.confidence, turnAnalysis.confidence),
    suggested_questions: currentIntentIsSpecific ? turnAnalysis.suggested_questions : contextualAnalysis.suggested_questions,
  };
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

function understoodLabel(analysis: QueryUnderstanding) {
  const parts: string[] = [];
  if (analysis.topic_labels.length) parts.push(analysis.topic_labels.slice(0, 2).join(' + '));
  if (analysis.age !== null) parts.push(`العمر ${analysis.age} سنة`);
  if (analysis.setting === 'school') parts.push('السياق المدرسي');
  if (analysis.setting === 'home') parts.push('السياق المنزلي');
  if (analysis.subject === 'child') parts.push('السؤال عن طفل');
  if (analysis.intent === 'comparison') parts.push('المطلوب مقارنة');
  if (analysis.intent === 'assessment') parts.push('المطلوب فهم العلامات/التقييم');
  if (analysis.intent === 'treatment') parts.push('المطلوب علاج أو تدخل');
  return parts.length ? parts.join(' · ') : null;
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

  const analysis = analyzeWithCurrentTurn(q, resolvedQuery);
  if (analysis.clarifying_question && analysis.topics.length === 0) {
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

  const variants = buildFreeQueryVariants(resolvedQuery, analysis).slice(0, 4);
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
  const results = rerankFreeResults(resolvedQuery, candidates, analysis).slice(0, limit);
  const rankedEvidence = evidenceGroups.flat()
    .sort((a, b) => Number(b.evidence_score) - Number(a.evidence_score))
    .filter((row, index, rows) => rows.findIndex((candidate) => candidate.destination === row.destination) === index)
    .slice(0, 8);
  const answerSource = rankedEvidence.length
    ? rerankFreeResults(resolvedQuery, evidenceAsResults(rankedEvidence), analysis)
    : results;
  const baseAnswer = buildExtractiveAnswer(resolvedQuery, answerSource, analysis);
  const answer = baseAnswer ? {
    ...baseAnswer,
    summary: baseAnswer.points[0]?.text ?? null,
    understood: understoodLabel(analysis),
    clarifying_question: analysis.clarifying_question,
    follow_ups: analysis.suggested_questions,
  } : null;
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
