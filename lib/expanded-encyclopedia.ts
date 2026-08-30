import { getCloudflareContext } from '@opennextjs/cloudflare';
import categoriesJson from '@/data/expanded-encyclopedia/categories.json';
import { publicContentHref } from '@/lib/public-content-routing';
import { createClient } from '@/lib/supabase/server';

export type ExpandedEncyclopediaCategory = {
  slug: string;
  name: string;
  description: string;
};

export type ExpandedEncyclopediaContentType = 'glossary_term' | 'intervention' | 'assessment' | 'condition';
export type ExpandedEncyclopediaCanonicalSource = 'static' | 'database';

export type ExpandedEncyclopediaIndexRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  canonical_url: string;
  canonical_source: ExpandedEncyclopediaCanonicalSource;
  content_type: ExpandedEncyclopediaContentType;
  category_slug: string;
  category_name: string;
  canonical_term: string;
  english_name: string | null;
  aliases: string[];
  primary_keyword: string;
  secondary_keywords: string[];
  semantic_terms: string[];
  updated_at: string;
};

export type ExpandedEncyclopediaRecord = Omit<ExpandedEncyclopediaIndexRecord, 'canonical_source'> & {
  body_json: unknown;
  body_text: string;
  schema_json: Record<string, unknown>;
  audience: string[];
  seo_title: string;
  seo_description: string;
  robots_index: true;
  robots_follow: boolean;
  published_at: string;
  featured_image_url: null;
  featured_image_alt: null;
  search_intent: string;
  author_display_name: string;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: unknown[];
  medical_disclaimer: string;
};

export const EXPANDED_ENCYCLOPEDIA_RELEASE_ID = 'expanded-encyclopedia-wave-001-v1';
export const EXPANDED_ENCYCLOPEDIA_RELEASED_AT = '2026-08-22T19:30:00.000Z';
const ASSET_ROOT = '/expanded-encyclopedia-data';
const VALID_CONTENT_TYPES = new Set<ExpandedEncyclopediaContentType>(['glossary_term', 'intervention', 'assessment', 'condition']);
const OWNER_BATCH_SIZE = 100;

const categories = (categoriesJson as ExpandedEncyclopediaCategory[]).map((item) => ({ ...item }));
const categoryBySlug = new Map(categories.map((item) => [item.slug, item]));

type AssetBinding = { fetch(input: Request | string | URL): Promise<Response> };
type AssetEnvironment = { ASSETS?: AssetBinding };
type PublishedCanonicalOwnerRow = { slug: string; canonical_url: string | null };

const validSlug = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const clean = (value: unknown) => typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';

export function normalizeExpandedTermIdentity(value: string) {
  return clean(value)
    .normalize('NFKC')
    .toLocaleLowerCase('ar')
    .replace(/[\u064B-\u065F\u0670\u0640]/gu, '')
    .replace(/[أإآٱ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .replace(/[’'"`´]/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

export function getExpandedEncyclopediaCategories(): ExpandedEncyclopediaCategory[] {
  return categories.map((item) => ({ ...item }));
}

export function getExpandedEncyclopediaCategory(slug: string): ExpandedEncyclopediaCategory | null {
  return categoryBySlug.get(slug) ?? null;
}

async function readCloudflareAsset<T>(pathname: string): Promise<T | null> {
  try {
    const context = getCloudflareContext();
    const assets = (context.env as unknown as AssetEnvironment).ASSETS;
    if (!assets) return null;
    const response = await assets.fetch(`https://assets.local${pathname}`);
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

async function readLocalAsset<T>(pathname: string): Promise<T | null> {
  try {
    const [{ readFile }, path] = await Promise.all([
      import('node:fs/promises'),
      import('node:path'),
    ]);
    const segments = pathname.split('/').filter(Boolean);
    const filename = path.join(process.cwd(), 'public', ...segments);
    return JSON.parse(await readFile(filename, 'utf8')) as T;
  } catch {
    return null;
  }
}

async function readAsset<T>(pathname: string): Promise<T | null> {
  return await readCloudflareAsset<T>(pathname) ?? await readLocalAsset<T>(pathname);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : [];
}

function validateIndex(value: unknown): ExpandedEncyclopediaIndexRecord[] {
  if (!Array.isArray(value)) return [];
  const result: ExpandedEncyclopediaIndexRecord[] = [];
  const slugs = new Set<string>();
  const identities = new Set<string>();
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
    const row = raw as Record<string, unknown>;
    const slug = clean(row.slug).toLowerCase();
    const canonicalTerm = clean(row.canonical_term);
    const categorySlug = clean(row.category_slug);
    const contentType = clean(row.content_type) as ExpandedEncyclopediaContentType;
    const canonical = clean(row.canonical_url);
    const identity = normalizeExpandedTermIdentity(canonicalTerm);
    if (!validSlug(slug) || !canonicalTerm || !identity || slugs.has(slug) || identities.has(identity)) return [];
    if (canonical !== `/content/${slug}` || !VALID_CONTENT_TYPES.has(contentType) || !categoryBySlug.has(categorySlug)) return [];
    slugs.add(slug);
    identities.add(identity);
    result.push({
      id: clean(row.id),
      slug,
      title: clean(row.title),
      excerpt: clean(row.excerpt),
      canonical_url: canonical,
      canonical_source: 'static',
      content_type: contentType,
      category_slug: categorySlug,
      category_name: clean(row.category_name) || categoryBySlug.get(categorySlug)?.name || '',
      canonical_term: canonicalTerm,
      english_name: clean(row.english_name) || null,
      aliases: stringArray(row.aliases),
      primary_keyword: clean(row.primary_keyword) || canonicalTerm,
      secondary_keywords: stringArray(row.secondary_keywords),
      semantic_terms: stringArray(row.semantic_terms),
      updated_at: clean(row.updated_at),
    });
  }
  return result;
}

async function reconcilePublishedCanonicalOwners(records: ExpandedEncyclopediaIndexRecord[]) {
  if (records.length === 0) return records;
  const supabase = await createClient();
  const now = new Date().toISOString();
  const slugs = [...new Set(records.map((item) => item.slug))];
  const owners = new Map<string, string>();

  for (let start = 0; start < slugs.length; start += OWNER_BATCH_SIZE) {
    const batch = slugs.slice(start, start + OWNER_BATCH_SIZE);
    const { data, error } = await supabase
      .from('content')
      .select('slug,canonical_url')
      .in('slug', batch)
      .eq('status', 'published')
      .eq('robots_index', true)
      .lte('published_at', now);

    if (error) {
      throw new Error(`expanded encyclopedia canonical ownership lookup failed: ${error.message}`);
    }

    for (const row of (data ?? []) as PublishedCanonicalOwnerRow[]) {
      const ownerPath = publicContentHref({ slug: row.slug, canonical_url: row.canonical_url });
      const existing = owners.get(row.slug);
      if (existing && existing !== ownerPath) {
        throw new Error(`conflicting published canonical owners for expanded encyclopedia slug: ${row.slug}`);
      }
      owners.set(row.slug, ownerPath);
    }
  }

  return records.map((record) => {
    const ownerPath = owners.get(record.slug);
    return ownerPath
      ? { ...record, canonical_url: ownerPath, canonical_source: 'database' as const }
      : record;
  });
}

export async function getExpandedEncyclopediaIndex(): Promise<ExpandedEncyclopediaIndexRecord[]> {
  const value = await readAsset<unknown>(`${ASSET_ROOT}/index.json`);
  return reconcilePublishedCanonicalOwners(validateIndex(value));
}

export async function getExpandedEncyclopediaIndexItem(slugValue: string): Promise<ExpandedEncyclopediaIndexRecord | null> {
  const slug = slugValue.trim().toLowerCase();
  if (!validSlug(slug)) return null;
  const index = await getExpandedEncyclopediaIndex();
  return index.find((item) => item.slug === slug) ?? null;
}

export async function getExpandedEncyclopediaRecord(slugValue: string): Promise<ExpandedEncyclopediaRecord | null> {
  const slug = slugValue.trim().toLowerCase();
  if (!validSlug(slug)) return null;
  const record = await readAsset<ExpandedEncyclopediaRecord>(`${ASSET_ROOT}/records/${slug}.json`);
  if (!record || record.slug !== slug || record.canonical_url !== `/content/${slug}` || record.robots_index !== true) return null;
  if (!VALID_CONTENT_TYPES.has(record.content_type) || !categoryBySlug.has(record.category_slug)) return null;
  const canonicalTerm = clean(record.canonical_term);
  if (!canonicalTerm || !normalizeExpandedTermIdentity(canonicalTerm)) return null;
  return record;
}
