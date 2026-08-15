import { getCloudflareContext } from '@opennextjs/cloudflare';

export type PsychEncyclopediaReleaseIndexRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  canonical_url: string;
  primary_keyword: string | null;
  secondary_keywords: string[];
  semantic_terms: string[];
  search_aliases: string[];
  search_intent: string | null;
  search_intent_questions: string[];
  updated_at: string;
};

export type PsychEncyclopediaReleaseRecord = PsychEncyclopediaReleaseIndexRecord & {
  body_json: unknown;
  body_text: string | null;
  schema_json: unknown;
  content_type: 'condition';
  audience: string[];
  seo_title: string | null;
  seo_description: string | null;
  robots_index: true;
  robots_follow: boolean;
  published_at: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  author_display_name: string;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: unknown[];
  medical_disclaimer: string;
};

export const PSYCH_ENCYCLOPEDIA_RELEASE_ID = 'psych-encyclopedia-public-50-v1';
export const PSYCH_ENCYCLOPEDIA_RELEASED_AT = '2026-08-15T19:20:00.000Z';
export const PSYCH_ENCYCLOPEDIA_RELEASE_EXPECTED_RECORDS = 50;
const ASSET_ROOT = '/encyclopedia-data';

type AssetBinding = { fetch(input: Request | string | URL): Promise<Response> };
type AssetEnvironment = { ASSETS?: AssetBinding };

function validSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
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

async function readReleaseAsset<T>(pathname: string): Promise<T | null> {
  return await readCloudflareAsset<T>(pathname) ?? await readLocalAsset<T>(pathname);
}

let indexPromise: Promise<PsychEncyclopediaReleaseIndexRecord[]> | null = null;
const recordPromises = new Map<string, Promise<PsychEncyclopediaReleaseRecord | null>>();

function validateIndex(value: unknown): PsychEncyclopediaReleaseIndexRecord[] {
  if (!Array.isArray(value) || value.length !== PSYCH_ENCYCLOPEDIA_RELEASE_EXPECTED_RECORDS) return [];
  const result: PsychEncyclopediaReleaseIndexRecord[] = [];
  const seen = new Set<string>();
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
    const row = raw as Record<string, unknown>;
    const slug = typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : '';
    const title = typeof row.title === 'string' ? row.title.trim() : '';
    const canonical = typeof row.canonical_url === 'string' ? row.canonical_url : '';
    if (!validSlug(slug) || !title || canonical !== `/encyclopedia/${slug}/` || seen.has(slug)) return [];
    seen.add(slug);
    result.push(raw as PsychEncyclopediaReleaseIndexRecord);
  }
  return result;
}

export async function getPsychEncyclopediaReleaseIndex(): Promise<PsychEncyclopediaReleaseIndexRecord[]> {
  indexPromise ??= readReleaseAsset<unknown>(`${ASSET_ROOT}/index.json`).then(validateIndex);
  return indexPromise;
}

export async function getPsychEncyclopediaReleaseRecord(slugValue: string): Promise<PsychEncyclopediaReleaseRecord | null> {
  const slug = slugValue.trim().toLowerCase();
  if (!validSlug(slug)) return null;
  let pending = recordPromises.get(slug);
  if (!pending) {
    pending = readReleaseAsset<PsychEncyclopediaReleaseRecord>(`${ASSET_ROOT}/records/${slug}.json`).then((record) => {
      if (!record || record.slug !== slug || record.canonical_url !== `/encyclopedia/${slug}/` || record.content_type !== 'condition' || record.robots_index !== true) return null;
      return record;
    });
    recordPromises.set(slug, pending);
  }
  return pending;
}
