import { resolveSectorAccent } from '@/lib/theme';

export type PublicSector = {
  slug: string;
  name_ar: string;
  description: string | null;
  accent: string | null;
  sort_order: number | null;
};

const PUBLIC_SECTOR_FETCH_LIMIT = 50;
const PUBLIC_SECTOR_SUMMARY_LIMIT = 160;

function summarizeSectorDescription(value: unknown) {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  return clean.length > PUBLIC_SECTOR_SUMMARY_LIMIT
    ? `${clean.slice(0, PUBLIC_SECTOR_SUMMARY_LIMIT - 1).trimEnd()}…`
    : clean;
}

export async function getPublicSectors(limit = 12): Promise<PublicSector[]> {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey) return [];

  const normalizedLimit = Math.max(1, Math.min(limit, PUBLIC_SECTOR_FETCH_LIMIT));
  // Keep one stable fetch URL for all callers so Next can reuse the same cached
  // taxonomy response between the global header and the homepage render.
  const params = new URLSearchParams({
    select: 'slug,name_ar,description,accent,sort_order',
    is_active: 'eq.true',
    visibility: 'eq.public',
    order: 'sort_order.asc,name_ar.asc',
    limit: String(PUBLIC_SECTOR_FETCH_LIMIT),
  });

  try {
    const response = await fetch(`${projectUrl}/rest/v1/sectors?${params.toString()}`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        Accept: 'application/json',
      },
      cache: 'force-cache',
      next: { revalidate: false, tags: ['public-taxonomy'] },
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      const item = row as Record<string, unknown>;
      if (typeof item.slug !== 'string' || typeof item.name_ar !== 'string') return [];
      const accent = resolveSectorAccent(typeof item.accent === 'string' ? item.accent : null);
      return [{
        slug: item.slug,
        name_ar: item.name_ar,
        description: summarizeSectorDescription(item.description),
        accent,
        sort_order: typeof item.sort_order === 'number' ? item.sort_order : null,
      }];
    }).slice(0, normalizedLimit);
  } catch {
    return [];
  }
}
