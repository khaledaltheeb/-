import { createClient } from '@/lib/supabase/server';

type JsonRecord = Record<string, unknown>;

export type CapabilityReference = {
  title?: string;
  url?: string;
  publisher?: string;
  year?: string | number;
};

export type CapabilityFaq = { question: string; answer: string };

export type CapabilityRegistryItem = {
  rank: number;
  slug: string;
  title: string;
  titleEn: string;
  href: string;
  category: string;
  categoryKey: string;
  evidenceRoute: string;
  evidenceRouteKey: string;
};

export type CapabilityRecord = {
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

const CATEGORY_LABELS: Record<string, string> = {
  'neurodevelopmental-learning': 'النمو العصبي والتعلم والتواصل',
  'genetic-metabolic': 'المتلازمات الجينية والكروموسومية والاستقلابية',
  'motor-neurological': 'الحركة والأعصاب والإصابات',
  'sensory-communication': 'الحواس والوصول والتواصل',
  'chronic-health': 'الحالات الصحية المزمنة والمتقطعة',
  'progressive-psychosocial': 'الحالات التقدمية والنفسية ذات الأثر الوظيفي',
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function capabilityContentSlug(routeSlug?: string) {
  return routeSlug ? `capabilities-${routeSlug}` : 'capabilities-hub';
}

export async function getCapabilityRecord(routeSlug?: string): Promise<CapabilityRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select(
      'id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json',
    )
    .eq('slug', capabilityContentSlug(routeSlug))
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  return (data as CapabilityRecord | null) ?? null;
}

export async function getCapabilityRegistryItems(): Promise<CapabilityRegistryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('slug,title,canonical_url,schema_json,published_at')
    .like('slug', 'capabilities-%')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .limit(200);

  const rows = Array.isArray(data) ? data : [];
  return rows
    .flatMap((row) => {
      const schema = asRecord(row.schema_json);
      const rank = Number(schema?.legacy_rank);
      if (!Number.isInteger(rank) || rank < 1 || rank > 100) return [];
      const canonical = asString(row.canonical_url);
      const categoryKey = asString(schema?.legacy_category);
      const evidenceRouteKey = asString(schema?.evidence_route);
      return [
        {
          rank,
          slug: asString(row.slug).replace(/^capabilities-/, ''),
          title: asString(row.title),
          titleEn: asString(schema?.legacy_title_en),
          href: canonical || `/capabilities/${asString(row.slug).replace(/^capabilities-/, '')}/`,
          category: CATEGORY_LABELS[categoryKey] || categoryKey,
          categoryKey,
          evidenceRoute: asString(schema?.evidence_route_label) || evidenceRouteKey,
          evidenceRouteKey,
        },
      ];
    })
    .sort((a, b) => a.rank - b.rank);
}

export function safeCapabilityReferences(value: unknown): CapabilityReference[] {
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

export function visibleCapabilityFaq(value: unknown): CapabilityFaq[] {
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

export function capabilityBodyWithoutRegistryCards(value: unknown) {
  const root = asRecord(value);
  if (!root || !Array.isArray(root.blocks)) return value;
  return {
    ...root,
    blocks: root.blocks.filter((block) => {
      const row = asRecord(block);
      if (!row || row.type !== 'resource') return true;
      const url = asString(row.url);
      return !/^https:\/\/healthrenewal\.org\/capabilities\/[^/]+\/$/i.test(url);
    }),
  };
}
