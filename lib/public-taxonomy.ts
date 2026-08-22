import { resolveSectorAccent } from '@/lib/theme';

export type PublicSector = {
  slug: string;
  name_ar: string;
  description: string | null;
  accent: string | null;
  sort_order: number | null;
};

export async function getPublicSectors(limit = 12): Promise<PublicSector[]> {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey) return [];

  const params = new URLSearchParams({
    select: 'slug,name_ar,description,accent,sort_order',
    is_active: 'eq.true',
    visibility: 'eq.public',
    order: 'sort_order.asc,name_ar.asc',
    limit: String(Math.max(1, Math.min(limit, 50))),
  });

  try {
    const response = await fetch(`${projectUrl}/rest/v1/sectors?${params.toString()}`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        Accept: 'application/json',
      },
      next: { revalidate: 300, tags: ['public-taxonomy'] },
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
        description: typeof item.description === 'string' ? item.description : null,
        accent,
        sort_order: typeof item.sort_order === 'number' ? item.sort_order : null,
      }];
    });
  } catch {
    return [];
  }
}
