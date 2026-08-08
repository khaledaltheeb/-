import { createClient } from '@/lib/supabase/server';

type JsonRecord = Record<string, unknown>;

export type ComparisonReference = {
  title?: string;
  url?: string;
  publisher?: string;
  year?: string | number;
};

export type ComparisonFaq = { question: string; answer: string };

export type ComparisonItem = {
  rank: number;
  slug: string;
  title: string;
  href: string;
  category: string;
  categoryKey: string;
  conceptA: string;
  conceptB: string;
};

export type ComparisonRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
  content_type: string;
  audience: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  published_at: string | null;
  updated_at: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  semantic_terms: string[] | null;
  author_display_name: string | null;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: unknown;
  medical_disclaimer: string | null;
  schema_json: unknown;
};

export const COMPARISON_CATEGORY_LABELS: Record<string, string> = {
  'clinical-differential': 'الفروق السريرية والتشخيص التفريقي',
  'interpersonal-behavior': 'العلاقات والسلوك والمهارات النفسية',
  'therapy-professions': 'العلاج والمهن والتقييم',
  'measurement-research': 'القياس والبحث والمنهجية',
  'cognition-learning': 'الإدراك والذاكرة والتعلم',
  'thinking-skills': 'التفكير والمرونة النفسية',
};

export const CANONICAL_COMPARISON_SLUGS = [
  'anxiety-vs-fear','sadness-vs-depression','stress-vs-burnout','introversion-vs-social-anxiety','self-esteem-vs-self-confidence',
  'panic-attack-vs-panic-disorder','ocd-vs-generalized-anxiety','anxious-vs-avoidant-attachment','empathy-vs-pity','assertiveness-vs-aggression',
  'perfectionism-vs-mastery','procrastination-vs-laziness','trauma-vs-ptsd','normal-grief-vs-prolonged-grief','mood-swings-vs-bipolar-disorder',
  'psychosis-vs-schizophrenia','delusion-vs-hallucination','personality-trait-vs-personality-disorder','narcissism-vs-self-confidence','manipulation-vs-persuasion',
  'emotional-dependence-vs-love','boundaries-vs-withdrawal','emotional-intelligence-vs-emotion-regulation','concentration-vs-attention','working-memory-vs-short-term-memory',
  'autism-vs-adhd','learning-disorder-vs-low-achievement','insomnia-vs-sleep-deprivation','emotional-eating-vs-binge-eating-disorder','addiction-vs-habit',
  'physical-dependence-vs-tolerance','lapse-vs-relapse','psychotherapy-vs-counseling','psychiatrist-vs-psychologist','cbt-vs-act',
  'individual-vs-group-therapy','family-vs-couples-therapy','psychological-test-vs-clinical-interview','screening-vs-diagnosis','prevalence-vs-incidence',
  'validity-vs-reliability','correlation-vs-causation','fluid-vs-crystallized-intelligence','verbal-vs-nonverbal-reasoning','semantic-vs-episodic-memory',
  'procedural-vs-declarative-learning','confirmation-bias-vs-motivated-reasoning','catastrophizing-vs-overgeneralization','mindfulness-vs-relaxation','acceptance-vs-resignation',
] as const;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function comparisonContentSlug(routeSlug?: string) {
  return routeSlug ? `comparisons-${routeSlug}` : 'comparisons-hub';
}

export function legacyComparisonTarget(routeSlug: string) {
  const match = routeSlug.match(/^comparison-(\d{3})$/);
  if (!match) return null;
  const legacyNumber = Number(match[1]);
  if (!Number.isInteger(legacyNumber) || legacyNumber < 1 || legacyNumber > 100) return null;
  const canonicalSlug = CANONICAL_COMPARISON_SLUGS[Math.floor((legacyNumber - 1) / 2)];
  return canonicalSlug ? `/comparisons/${canonicalSlug}/` : null;
}

export async function getComparisonRecord(routeSlug?: string): Promise<ComparisonRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select(
      'id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json',
    )
    .eq('slug', comparisonContentSlug(routeSlug))
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  return (data as ComparisonRecord | null) ?? null;
}

export async function getComparisonItems(): Promise<ComparisonItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('slug,title,canonical_url,schema_json,published_at')
    .like('slug', 'comparisons-%')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .limit(100);

  const rows = Array.isArray(data) ? data : [];
  return rows
    .flatMap((row) => {
      const schema = asRecord(row.schema_json);
      if (asString(schema?.page_role) !== 'comparison') return [];
      const rank = Number(schema?.comparison_rank);
      if (!Number.isInteger(rank) || rank < 1 || rank > 50) return [];
      const categoryKey = asString(schema?.comparison_category);
      const canonical = asString(row.canonical_url);
      const slug = asString(row.slug).replace(/^comparisons-/, '');
      return [{
        rank,
        slug,
        title: asString(row.title),
        href: canonical || `/comparisons/${slug}/`,
        category: COMPARISON_CATEGORY_LABELS[categoryKey] || categoryKey,
        categoryKey,
        conceptA: asString(schema?.concept_a),
        conceptB: asString(schema?.concept_b),
      }];
    })
    .sort((a, b) => a.rank - b.rank);
}

export function comparisonPageRole(value: unknown) {
  const root = asRecord(value);
  return asString(root?.page_role);
}

export function safeComparisonReferences(value: unknown): ComparisonReference[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const url = asString(row.url);
    const title = asString(row.title);
    const publisher = asString(row.publisher);
    const year = typeof row.year === 'string' || typeof row.year === 'number' ? row.year : undefined;
    if (!title && !/^https:\/\//i.test(url)) return [];
    return [{ title: title || undefined, url: /^https:\/\//i.test(url) ? url : undefined, publisher: publisher || undefined, year }];
  });
}

export function visibleComparisonFaq(value: unknown): ComparisonFaq[] {
  const root = asRecord(value);
  const blocks = Array.isArray(root?.blocks) ? root.blocks : [];
  return blocks
    .flatMap((block) => {
      const row = asRecord(block);
      if (!row || row.type !== 'faq' || !Array.isArray(row.items)) return [];
      return row.items.flatMap((item) => {
        const faq = asRecord(item);
        const question = asString(faq?.question).slice(0, 500);
        const answer = asString(faq?.answer).slice(0, 6000);
        return question.length >= 3 && answer.length >= 3 ? [{ question, answer }] : [];
      });
    })
    .slice(0, 40);
}
