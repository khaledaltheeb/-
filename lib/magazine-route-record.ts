import { createClient } from '@/lib/supabase/server';
import type { MagazineRecord } from '@/lib/magazine';

const FIELDS = 'id,slug,title,excerpt,body_json,body_text,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json';
const PRODUCTION_ORIGIN = 'https://healthrenewal.org';

function isPublishedNow(value: string | null) {
  return !value || new Date(value).getTime() <= Date.now();
}

/**
 * Resolve the immutable public magazine canonical contract.
 *
 * Most historical rows store a path-only canonical (`/magazine/...`). A small
 * 2026-08-30 publication batch stored the same public route as an absolute
 * healthrenewal.org URL. Published canonicals are intentionally immutable in
 * the database, so the route must accept both representations without changing
 * the public URL or weakening the preservation guard.
 */
export async function getMagazineRouteRecord(routeSlug: string): Promise<MagazineRecord | null> {
  const safeSlug = decodeURIComponent(routeSlug).replace(/^\/+/, '');
  if (!safeSlug || safeSlug.includes('/') || !safeSlug.endsWith('.html')) return null;

  const relativeCanonical = `/magazine/${safeSlug}`;
  const absoluteCanonical = `${PRODUCTION_ORIGIN}${relativeCanonical}`;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(FIELDS)
    .eq('content_type', 'research')
    .eq('status', 'published')
    .in('canonical_url', [relativeCanonical, absoluteCanonical])
    .limit(2);

  if (error) throw error;
  const rows = (data ?? []) as unknown as MagazineRecord[];
  const record = rows.find((item) => item.canonical_url === relativeCanonical) ?? rows[0] ?? null;
  return record && isPublishedNow(record.published_at) ? record : null;
}
