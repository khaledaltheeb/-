import { createClient } from '@/lib/supabase/server';

export type CapabilityReference = {
  title?: string;
  url?: string;
  publisher?: string;
  year?: string | number;
};

export type CapabilityFaq = { question: string; answer: string };

export type CapabilityRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  semantic_terms: string[] | null;
  audience: string[] | null;
  author_display_name: string | null;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  published_at: string | null;
  updated_at: string | null;
  references_json: unknown;
  medical_disclaimer: string | null;
  schema_json: unknown;
};

export type CapabilityRegistryItem = {
  slug: string;
  href: string;
  titleAr: string;
  titleEn: string;
  category: string;
  categoryLabel: string;
  route: string;
  routeLabel: string;
  rank: number;
};

type JsonRecord = Record<string, unknown>;

const CAPABILITY_SELECT = [
  'id', 'slug', 'title', 'excerpt', 'body_json', 'body_text', 'seo_title', 'seo_description',
  'canonical_url', 'robots_index', 'robots_follow', 'featured_image_url', 'featured_image_alt',
  'primary_keyword', 'secondary_keywords', 'semantic_terms', 'audience', 'author_display_name',
  'reviewer_display_name', 'reviewer_credentials', 'last_reviewed_at', 'published_at', 'updated_at',
  'references_json', 'medical_disclaimer', 'schema_json',
].join(',');

const CATEGORY_LABELS: Record<string, string> = {
  'neurodevelopmental-learning': 'النمو العصبي والتعلم والتواصل',
  'genetic-metabolic': 'المتلازمات الجينية والكروموسومية والاستقلابية',
  'motor-neurological': 'الحركة والأعصاب والإصابات',
  'sensory-communication': 'الحواس والوصول والتواصل',
  'chronic-health': 'الحالات الصحية المزمنة والمتقطعة',
  'progressive-psychosocial': 'الحالات التقدمية والنفسية ذات الأثر الوظيفي',
};

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 9999;
}

export function capabilityDatabaseSlug(routeSlug?: string) {
  return routeSlug ? `capabilities-${routeSlug}` : 'capabilities-hub';
}

export async function getCapabilityPage(routeSlug?: string): Promise<CapabilityRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select(CAPABILITY_SELECT)
    .eq('slug', capabilityDatabaseSlug(routeSlug))
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();
  return (data as CapabilityRecord | null) ?? null;
}

export function capabilityReferences(value: unknown): CapabilityReference[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const url = /^https:\/\//i.test(asString(row.url)) ? asString(row.url) : undefined;
    const title = asString(row.title) || undefined;
    const publisher = asString(row.publisher) || undefined;
    const year = typeof row.year === 'number' || typeof row.year === 'string' ? row.year : undefined;
    return title || url ? [{ title, url, publisher, year }] : [];
  });
}

export function capabilityFaq(value: unknown): CapabilityFaq[] {
  const root = asRecord(value);
  const blocks = Array.isArray(root?.blocks) ? root.blocks : [];
  return blocks.flatMap((blockValue) => {
    const block = asRecord(blockValue);
    if (!block || block.type !== 'faq' || !Array.isArray(block.items)) return [];
    return block.items.flatMap((item) => {
      const row = asRecord(item);
      if (!row) return [];
      const question = asString(row.question).slice(0, 500);
      const answer = asString(row.answer).slice(0, 6000);
      return question.length >= 3 && answer.length >= 3 ? [{ question, answer }] : [];
    });
  }).slice(0, 40);
}

function conditionDisplayTitle(title: string) {
  return title.replace(/^قدرات\s+/, '').replace(/:\s*دليل عملي.*$/u, '').trim();
}

export async function getCapabilityRegistryItems(): Promise<CapabilityRegistryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('slug,title,canonical_url,schema_json')
    .like('slug', 'capabilities-%')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('title', { ascending: true });

  const rows = Array.isArray(data) ? data : [];
  return rows.flatMap((row) => {
    const schema = asRecord(row.schema_json);
    if (!schema || schema.legacy_rank === undefined) return [];
    const category = asString(schema.legacy_category);
    const href = asString(row.canonical_url);
    if (!href.startsWith('/capabilities/')) return [];
    const route = asString(schema.evidence_route);
    return [{
      slug: asString(row.slug).replace(/^capabilities-/, ''),
      href,
      titleAr: conditionDisplayTitle(asString(row.title)),
      titleEn: asString(schema.legacy_title_en),
      category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      route,
      routeLabel: asString(schema.evidence_route_label) || 'مسار دليل فردي',
      rank: asNumber(schema.legacy_rank),
    }];
  }).sort((a, b) => a.rank - b.rank || a.titleAr.localeCompare(b.titleAr, 'ar'));
}
