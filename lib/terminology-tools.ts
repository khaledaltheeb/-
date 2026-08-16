import { createClient } from '@/lib/supabase/server';

export type TerminologyToolTerm = {
  slug: string;
  title: string;
  excerpt: string;
  canonicalUrl: string;
};

export async function getTerminologyToolTerms(limit = 500): Promise<TerminologyToolTerm[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('content')
      .select('slug,title,excerpt,canonical_url')
      .eq('content_type', 'glossary_term')
      .eq('status', 'published')
      .order('title', { ascending: true })
      .limit(Math.min(Math.max(limit, 1), 500));
    if (error) throw error;
    return (data ?? []).flatMap((row) => {
      const slug = String(row.slug ?? '').trim();
      const title = String(row.title ?? '').trim();
      if (!slug || !title) return [];
      return [{
        slug,
        title,
        excerpt: String(row.excerpt ?? '').trim(),
        canonicalUrl: String(row.canonical_url ?? '').trim() || `/content/${slug}`,
      }];
    });
  } catch {
    return [];
  }
}
