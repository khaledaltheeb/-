export type HomepageContent = {
  slug: string;
  title: string;
  excerpt: string | null;
  content_type: string;
  canonical_url: string | null;
  published_at: string | null;
  updated_at: string;
};

export async function getHomepageContent(limit = 6): Promise<HomepageContent[]> {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey) return [];

  const params = new URLSearchParams({
    select: 'slug,title,excerpt,content_type,canonical_url,published_at,updated_at',
    status: 'eq.published',
    robots_index: 'eq.true',
    published_at: `lte.${new Date().toISOString()}`,
    order: 'published_at.desc.nullslast,updated_at.desc',
    limit: String(Math.max(1, Math.min(limit, 12))),
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
        excerpt: typeof item.excerpt === 'string' ? item.excerpt : null,
        content_type: typeof item.content_type === 'string' ? item.content_type : 'article',
        canonical_url: typeof item.canonical_url === 'string' ? item.canonical_url : null,
        published_at: typeof item.published_at === 'string' ? item.published_at : null,
        updated_at: item.updated_at,
      }];
    });
  } catch {
    return [];
  }
}
