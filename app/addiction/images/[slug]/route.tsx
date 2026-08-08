import { addictionOgImage } from '@/components/addiction-og-image';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
type Params = Promise<{ slug: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const contentSlug = slug === 'hub' ? 'addiction-hub' : `addiction-${slug}`;
  const supabase = await createClient();
  const { data } = await supabase.from('content').select('title').eq('slug', contentSlug).maybeSingle();
  return addictionOgImage(data?.title || 'الإدمان والتعافي');
}
