import { familyGuideOgImage } from '@/components/family-guide-og-image';
import { createClient } from '@/lib/supabase/server';

type Params = Promise<{ slug: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const contentSlug = slug === 'hub' ? 'family-guide-hub' : `family-guide-${slug}`;
  const supabase = await createClient();
  const { data } = await supabase.from('content').select('title').eq('slug', contentSlug).maybeSingle();
  return familyGuideOgImage(data?.title || 'دليل الأسرة');
}
