export type HomepageContent = {
  slug: string;
  title: string;
  excerpt: string | null;
  content_type: string;
  canonical_url: string | null;
  published_at: string | null;
  updated_at: string;
};

const HOMEPAGE_CONTENT_FETCH_LIMIT = 12;
const HOMEPAGE_EXCERPT_LIMIT = 180;
const HOMEPAGE_CACHE_WINDOW_MS = 5 * 60 * 1000;

function compactHomepageExcerpt(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return null;
  if (normalized.length <= HOMEPAGE_EXCERPT_LIMIT) return normalized;
  return `${normalized.slice(0, HOMEPAGE_EXCERPT_LIMIT - 1).trimEnd()}…`;
}

export async function getHomepageContent(limit = 6): Promise<HomepageContent[]> {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey) return [];

  const normalizedLimit = Math.max(1, Math.min(limit, HOMEPAGE_CONTENT_FETCH_LIMIT));
  const publishedBefore = new Date(
    Math.floor(Date.now() / HOMEPAGE_CACHE_WINDOW_MS) * HOMEPAGE_CACHE_WINDOW_MS,
  ).toISOString();

  const params = new URLSearchParams({
    select: 'slug,title,excerpt,content_type,canonical_url,published_at,updated_at',
    status: 'eq.published',
    robots_index: 'eq.true',
    published_at: `lte.${publishedBefore}`,
    order: 'published_at.desc.nullslast,updated_at.desc',
    limit: String(HOMEPAGE_CONTENT_FETCH_LIMIT),
  });

  try {
    const response = await fetch(`${projectUrl}/rest/v1/content?${params.toString()}`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        Accept: 'application/json',
      },
      next: { revalidate: 300, tags: ['homepage-content'] },
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      const item = row as Record<string, unknown>;
      if (typeof item.slug !== 'string' || typeof item.title !== 'string' || typeof item.updated_at !== 'string') return [];
      return [{
        slug: item.slug,
        title: item.title,
        excerpt: compactHomepageExcerpt(item.excerpt),
        content_type: typeof item.content_type === 'string' ? item.content_type : 'article',
        canonical_url: typeof item.canonical_url === 'string' ? item.canonical_url : null,
        published_at: typeof item.published_at === 'string' ? item.published_at : null,
        updated_at: item.updated_at,
      }];
    }).slice(0, normalizedLimit);
  } catch {
    return [];
  }
}
