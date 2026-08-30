import { addictionOgImage } from '@/components/addiction-og-image';
import { createClient } from '@/lib/supabase/server';

type Params = Promise<{ slug: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const preferredSlug = slug === 'hub' ? 'addiction-hub' : `addiction-${slug}`;
  const candidates = [...new Set([preferredSlug, slug])];
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('slug,title')
    .in('slug', candidates)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString());
  const rows = data ?? [];
  const record = rows.find((item) => item.slug === preferredSlug) ?? rows.find((item) => item.slug === slug);
  return addictionOgImage(record?.title || 'الإدمان والتعافي');
}
