import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
  getPediatricOncologyEvidenceRecord,
  type MagazineRecord,
} from '@/lib/magazine';

const FIELDS = 'id,slug,title,excerpt,body_json,body_text,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json';
const RELEASE_TOKEN_RE = /^[a-f0-9]{32}$/;
const RELEASE_VISIBLE_STATUSES = ['approved', 'scheduled', 'published'] as const;

function normalizeReleaseToken(value?: string | null) {
  const token = value?.trim().toLowerCase() || '';
  return RELEASE_TOKEN_RE.test(token) ? token : null;
}

function createReleasePreviewClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase release preview configuration is missing');

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'x-rawafid-release-token': token,
      },
    },
  });
}

function hasMatchingReleaseToken(record: MagazineRecord | null, token: string) {
  return record?.schema_json?.release_token === token;
}

export async function getPediatricOncologyEvidenceRecordForRequest(
  kind: 'studies' | 'theses',
  routeSlug: string,
  releaseVerify?: string | null,
): Promise<MagazineRecord | null> {
  const safeSlug = decodeURIComponent(routeSlug).trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(safeSlug)) return null;

  const token = normalizeReleaseToken(releaseVerify);
  if (!token) return getPediatricOncologyEvidenceRecord(kind, safeSlug);

  const canonical = `/magazine/pediatric-oncology/${kind}/${safeSlug}/`;
  const supabase = createReleasePreviewClient(token);
  const { data, error } = await supabase
    .from('content')
    .select(FIELDS)
    .eq('content_type', 'research')
    .in('status', [...RELEASE_VISIBLE_STATUSES])
    .eq('canonical_url', canonical)
    .maybeSingle();

  if (error) throw error;
  const record = data as unknown as MagazineRecord | null;
  return hasMatchingReleaseToken(record, token) ? record : null;
}

export async function getPediatricOncologyReleasePreviewByToken(
  releaseVerify?: string | null,
): Promise<MagazineRecord | null> {
  const token = normalizeReleaseToken(releaseVerify);
  if (!token) return null;

  const supabase = createReleasePreviewClient(token);
  const { data, error } = await supabase
    .from('content')
    .select(FIELDS)
    .eq('content_type', 'research')
    .in('status', [...RELEASE_VISIBLE_STATUSES])
    .like('canonical_url', '/magazine/pediatric-oncology/%')
    .limit(2);

  if (error) throw error;
  const records = (data ?? []) as unknown as MagazineRecord[];
  if (records.length !== 1) return null;
  return hasMatchingReleaseToken(records[0], token) ? records[0] : null;
}
