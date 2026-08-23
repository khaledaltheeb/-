import { resolveSectorAccent } from '@/lib/theme';

export type PublicSector = {
  slug: string;
  name_ar: string;
  description: string | null;
  accent: string | null;
  sort_order: number | null;
};

const MAX_PUBLIC_SECTORS = 50;
const FAILURE_BACKOFF_MS = 30_000;

let inFlightPublicSectors: Promise<PublicSector[]> | null = null;
let lastGoodPublicSectors: PublicSector[] = [];
let retryAfter = 0;

function parsePublicSectors(data: unknown): PublicSector[] | null {
  if (!Array.isArray(data)) return null;

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
}

async function loadPublicSectors(): Promise<PublicSector[]> {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey) return lastGoodPublicSectors;

  if (Date.now() < retryAfter) return lastGoodPublicSectors;
  if (inFlightPublicSectors) return inFlightPublicSectors;

  const params = new URLSearchParams({
    select: 'slug,name_ar,description,accent,sort_order',
    is_active: 'eq.true',
    visibility: 'eq.public',
    order: 'sort_order.asc,name_ar.asc',
    limit: String(MAX_PUBLIC_SECTORS),
  });

  const request = (async (): Promise<PublicSector[]> => {
    try {
      const response = await fetch(`${projectUrl}/rest/v1/sectors?${params.toString()}`, {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
          Accept: 'application/json',
        },
        next: { revalidate: 300, tags: ['public-taxonomy'] },
      });

      if (!response.ok) {
        retryAfter = Date.now() + FAILURE_BACKOFF_MS;
        return lastGoodPublicSectors;
      }

      const parsed = parsePublicSectors(await response.json());
      if (!parsed) {
        retryAfter = Date.now() + FAILURE_BACKOFF_MS;
        return lastGoodPublicSectors;
      }

      lastGoodPublicSectors = parsed;
      retryAfter = 0;
      return parsed;
    } catch {
      retryAfter = Date.now() + FAILURE_BACKOFF_MS;
      return lastGoodPublicSectors;
    }
  })();

  inFlightPublicSectors = request;
  try {
    return await request;
  } finally {
    if (inFlightPublicSectors === request) inFlightPublicSectors = null;
  }
}

export async function getPublicSectors(limit = 12): Promise<PublicSector[]> {
  const normalizedLimit = Math.max(1, Math.min(limit, MAX_PUBLIC_SECTORS));
  const sectors = await loadPublicSectors();
  return sectors.slice(0, normalizedLimit);
}
