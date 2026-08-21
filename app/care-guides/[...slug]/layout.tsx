import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { careGuideCanonical } from '@/lib/care-guides';

type Params = Promise<{ slug: string[] }>;

export default async function CareGuideRouteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { slug } = await params;
  const canonical = careGuideCanonical(slug);
  let releaseToken: string | null = null;

  if (canonical) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('content')
      .select('schema_json')
      .eq('canonical_url', canonical)
      .eq('content_type', 'guide')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .maybeSingle();

    const schema = data?.schema_json;
    const record = schema && typeof schema === 'object' && !Array.isArray(schema)
      ? schema as Record<string, unknown>
      : null;
    releaseToken = typeof record?.release_token === 'string'
      ? record.release_token
      : null;
  }

  return <>
    {releaseToken ? <meta name="rawafid-release-token" content={releaseToken} /> : null}
    {children}
  </>;
}
