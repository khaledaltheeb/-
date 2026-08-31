import { getMagazineRecord, type MagazineRecord } from '@/lib/magazine';
import { createClient } from '@/lib/supabase/server';

const productionOrigin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').replace(/\/+$/, '');

function isPublishedNow(value: string | null) {
  return !value || new Date(value).getTime() <= Date.now();
}

/**
 * Resolve a public magazine route while preserving immutable published canonicals.
 *
 * Current magazine rows use route-relative canonicals. A small historical batch
 * was published with the same public route stored as an absolute Health Renewal
 * URL. The database correctly prevents rewriting canonicals after publication,
 * so routing must accept both representations without changing the public URL.
 */
export async function getMagazineRouteRecord(routeSlug: string): Promise<MagazineRecord | null> {
  const current = await getMagazineRecord(routeSlug);
  if (current) return current;

  const safeSlug = decodeURIComponent(routeSlug).replace(/^\/+/, '');
  if (!safeSlug || safeSlug.includes('/') || !safeSlug.endsWith('.html')) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('content_type', 'research')
    .eq('status', 'published')
    .eq('canonical_url', `${productionOrigin}/magazine/${safeSlug}`)
    .maybeSingle();

  if (error) throw error;
  const record = data as unknown as MagazineRecord | null;
  return record && isPublishedNow(record.published_at) ? record : null;
}
