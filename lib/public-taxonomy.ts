import { resolveSectorAccent } from '@/lib/theme';

export type PublicSector = {
  slug: string;
  name_ar: string;
  description: string | null;
  accent: string | null;
  sort_order: number | null;
};

const PUBLIC_SECTOR_REGISTRY_LIMIT = 50;

export async function getPublicSectors(limit = 12): Promise<PublicSector[]> {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey) return [];

  const boundedLimit = Math.max(1, Math.min(limit, PUBLIC_SECTOR_REGISTRY_LIMIT));
  const params = new URLSearchParams({
    select: 'slug,name_ar,description,accent,sort_order',
    is_active: 'eq.true',
    visibility: 'eq.public',
    order: 'sort_order.asc,name_ar.asc',
    // Always fetch the same bounded registry so callers such as the header and
    // homepage share one Next.js fetch-cache key instead of creating separate
    // Supabase requests for limit=12, limit=50, and other presentation slices.
    limit: String(PUBLIC_SECTOR_REGISTRY_LIMIT),
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
    const sectors = data.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      const item = row as Record<string, unknown>;
      if (typeof item.slug !== 'string' || typeof item.name_ar !== 'string') return [];
      const accent = resolveSectorAccent(typeof item.accent === 'string' ? item.accent : null);
      return [{
        slug: item.slug,
        name_ar: item.name_ar,
        description: typeof item.description === 'string' ? item.description : null,
        accent,
        sort_order: typeof item.sort_order === 'number' ? item.sort_order : null,
      } satisfies PublicSector];
    });
    return sectors.slice(0, boundedLimit);
  } catch {
    return [];
  }
}
