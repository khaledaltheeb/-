import { createClient } from '@/lib/supabase/server';

export type MagazineReference = { title?: string; url?: string; publisher?: string; year?: string | number };
export type MagazineRecord = {
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
  published_at: string | null;
  updated_at: string;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  semantic_terms: string[] | null;
  author_display_name: string | null;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: MagazineReference[] | null;
  medical_disclaimer: string | null;
  schema_json: Record<string, unknown> | null;
};

export type MagazineListingRecord = Pick<
  MagazineRecord,
  'id' | 'slug' | 'title' | 'excerpt' | 'canonical_url' | 'published_at' | 'updated_at' | 'schema_json' | 'primary_keyword' | 'secondary_keywords' | 'semantic_terms'
>;

const FIELDS = 'id,slug,title,excerpt,body_json,body_text,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json';
const LISTING_FIELDS = 'id,slug,title,excerpt,canonical_url,published_at,updated_at,schema_json,primary_keyword,secondary_keywords,semantic_terms';

function isPublishedNow(value: string | null) {
  return !value || new Date(value).getTime() <= Date.now();
}

export function evidenceKind(item: Pick<MagazineRecord, 'schema_json'>) {
  const value = item.schema_json?.evidence_kind;
  return typeof value === 'string' && value.trim() ? value.trim() : 'دراسة بحثية';
}

export function sourceUrl(item: Pick<MagazineRecord, 'references_json' | 'schema_json'>) {
  const ref = item.references_json?.find((entry) => typeof entry?.url === 'string' && /^https:\/\//i.test(entry.url));
  if (ref?.url) return ref.url;
  const value = item.schema_json?.source_url;
  return typeof value === 'string' && /^https:\/\//i.test(value) ? value : null;
}

const RELATED_STOP_WORDS = new Set([
  'التي', 'الذي', 'هذه', 'هذا', 'ذلك', 'لدى', 'على', 'إلى', 'الى', 'عن', 'من', 'في', 'مع', 'هل', 'ما', 'كيف', 'لماذا',
  'الأطفال', 'الطفل', 'المراهقين', 'الشباب', 'الأشخاص', 'دراسة', 'بحثية', 'مراجعة', 'تحليل', 'الأدلة', 'العلمية', 'الصحة', 'النفسية', 'علم', 'النفس',
  'the', 'and', 'for', 'with', 'from', 'review', 'study', 'analysis',
]);

function topicTokens(values: Array<string | null | undefined>) {
  const tokens = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    for (const token of value
      .toLocaleLowerCase('ar')
      .normalize('NFKD')
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length >= 3 && !RELATED_STOP_WORDS.has(part))) {
      tokens.add(token);
    }
  }
  return tokens;
}

function overlapSize(left: Set<string>, right: Set<string>) {
  let count = 0;
  for (const value of left) if (right.has(value)) count += 1;
  return count;
}

type RelatedProfile = {
  tokens: Set<string>;
  semanticTerms: Set<string>;
  secondaryKeywords: Set<string>;
  evidenceKind: string;
};

function relatedProfile(record: MagazineRecord): RelatedProfile {
  return {
    tokens: topicTokens([
      record.title,
      record.primary_keyword,
      ...(record.secondary_keywords ?? []),
      ...(record.semantic_terms ?? []),
    ]),
    semanticTerms: new Set(record.semantic_terms ?? []),
    secondaryKeywords: new Set(record.secondary_keywords ?? []),
    evidenceKind: evidenceKind(record),
  };
}

function relatedScore(profile: RelatedProfile, candidate: MagazineListingRecord) {
  const candidateTokens = topicTokens([
    candidate.title,
    candidate.primary_keyword,
    ...(candidate.secondary_keywords ?? []),
    ...(candidate.semantic_terms ?? []),
  ]);
  const tokenOverlap = overlapSize(profile.tokens, candidateTokens);
  const semanticOverlap = overlapSize(profile.semanticTerms, new Set(candidate.semantic_terms ?? []));
  const secondaryOverlap = overlapSize(profile.secondaryKeywords, new Set(candidate.secondary_keywords ?? []));
  const sameEvidenceKind = profile.evidenceKind === evidenceKind(candidate) ? 1 : 0;
  return (tokenOverlap * 10) + (semanticOverlap * 2) + secondaryOverlap + sameEvidenceKind;
}

export async function getMagazineItems(): Promise<MagazineListingRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(LISTING_FIELDS)
    .eq('content_type', 'research')
    .eq('status', 'published')
    .like('canonical_url', '/magazine/%')
    .order('published_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return ((data ?? []) as unknown as MagazineListingRecord[]).filter((item) => isPublishedNow(item.published_at));
}

export async function getMagazineRecord(routeSlug: string): Promise<MagazineRecord | null> {
  const safeSlug = decodeURIComponent(routeSlug).replace(/^\/+/, '');
  if (!safeSlug || safeSlug.includes('/') || !safeSlug.endsWith('.html')) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(FIELDS)
    .eq('content_type', 'research')
    .eq('status', 'published')
    .eq('canonical_url', `/magazine/${safeSlug}`)
    .maybeSingle();
  if (error) throw error;
  const record = data as unknown as MagazineRecord | null;
  return record && isPublishedNow(record.published_at) ? record : null;
}

export async function getPediatricOncologyEvidenceRecord(
  kind: 'studies' | 'theses',
  routeSlug: string,
): Promise<MagazineRecord | null> {
  const safeSlug = decodeURIComponent(routeSlug).trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(safeSlug)) return null;
  const canonical = `/magazine/pediatric-oncology/${kind}/${safeSlug}/`;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(FIELDS)
    .eq('content_type', 'research')
    .eq('status', 'published')
    .eq('canonical_url', canonical)
    .maybeSingle();
  if (error) throw error;
  const record = data as unknown as MagazineRecord | null;
  return record && isPublishedNow(record.published_at) ? record : null;
}

export async function getRelatedMagazine(record: MagazineRecord, limit = 4): Promise<MagazineListingRecord[]> {
  const boundedLimit = Math.max(1, Math.min(limit, 12));
  // Keep a meaningful semantic candidate pool without turning every indexed
  // magazine request into an unnecessarily large database read during crawls.
  const candidateLimit = Math.min(96, Math.max(48, boundedLimit * 12));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(LISTING_FIELDS)
    .eq('content_type', 'research')
    .eq('status', 'published')
    .like('canonical_url', '/magazine/%')
    .neq('id', record.id)
    .order('published_at', { ascending: false })
    .limit(candidateLimit);
  if (error) throw error;

  const profile = relatedProfile(record);
  return ((data ?? []) as unknown as MagazineListingRecord[])
    .filter((item) => isPublishedNow(item.published_at))
    .sort((a, b) => {
      const scoreDifference = relatedScore(profile, b) - relatedScore(profile, a);
      if (scoreDifference !== 0) return scoreDifference;
      return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
    })
    .slice(0, boundedLimit);
}