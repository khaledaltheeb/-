export type HomepageContent = {
  slug: string;
  title: string;
  excerpt: string | null;
  content_type: string;
  canonical_url: string | null;
  published_at: string | null;
  updated_at: string;
};

const MAX_HOMEPAGE_CONTENT = 12;
const CONTENT_CACHE_WINDOW_MS = 300_000;
const FAILURE_BACKOFF_MS = 30_000;

let inFlightHomepageContent: Promise<HomepageContent[]> | null = null;
let lastGoodHomepageContent: HomepageContent[] = [];
let retryAfter = 0;

function currentCacheCutoff() {
  const bucketStart = Math.floor(Date.now() / CONTENT_CACHE_WINDOW_MS) * CONTENT_CACHE_WINDOW_MS;
  return new Date(bucketStart).toISOString();
}

function parseHomepageContent(data: unknown): HomepageContent[] | null {
  if (!Array.isArray(data)) return null;

  return data.flatMap((row) => {
    if (!row || typeof row !== 'object') return [];
    const item = row as Record<string, unknown>;
    if (typeof item.slug !== 'string' || typeof item.title !== 'string' || typeof item.updated_at !== 'string') return [];
    return [{
      slug: item.slug,
      title: item.title,
      excerpt: typeof item.excerpt === 'string' ? item.excerpt : null,
      content_type: typeof item.content_type === 'string' ? item.content_type : 'article',
      canonical_url: typeof item.canonical_url === 'string' ? item.canonical_url : null,
      published_at: typeof item.published_at === 'string' ? item.published_at : null,
      updated_at: item.updated_at,
    }];
  });
}

async function loadHomepageContent(): Promise<HomepageContent[]> {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey) return lastGoodHomepageContent;

  if (Date.now() < retryAfter) return lastGoodHomepageContent;
  if (inFlightHomepageContent) return inFlightHomepageContent;

  const params = new URLSearchParams({
    select: 'slug,title,excerpt,content_type,canonical_url,published_at,updated_at',
    status: 'eq.published',
    robots_index: 'eq.true',
    published_at: `lte.${currentCacheCutoff()}`,
    order: 'published_at.desc.nullslast,updated_at.desc',
    limit: String(MAX_HOMEPAGE_CONTENT),
  });

  const request = (async (): Promise<HomepageContent[]> => {
    try {
      const response = await fetch(`${projectUrl}/rest/v1/content?${params.toString()}`, {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
          Accept: 'application/json',
        },
        next: { revalidate: 300, tags: ['homepage-content'] },
      });

      if (!response.ok) {
        retryAfter = Date.now() + FAILURE_BACKOFF_MS;
        return lastGoodHomepageContent;
      }

      const parsed = parseHomepageContent(await response.json());
      if (!parsed) {
        retryAfter = Date.now() + FAILURE_BACKOFF_MS;
        return lastGoodHomepageContent;
      }

      lastGoodHomepageContent = parsed;
      retryAfter = 0;
      return parsed;
    } catch {
      retryAfter = Date.now() + FAILURE_BACKOFF_MS;
      return lastGoodHomepageContent;
    }
  })();

  inFlightHomepageContent = request;
  try {
    return await request;
  } finally {
    if (inFlightHomepageContent === request) inFlightHomepageContent = null;
  }
}

export async function getHomepageContent(limit = 6): Promise<HomepageContent[]> {
  const normalizedLimit = Math.max(1, Math.min(limit, MAX_HOMEPAGE_CONTENT));
  const content = await loadHomepageContent();
  return content.slice(0, normalizedLimit);
}
