import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';

type Params = Promise<{ slug: string }>;

export default async function ContentRouteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('schema_json')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  const schema = data?.schema_json;
  const record = schema && typeof schema === 'object' && !Array.isArray(schema)
    ? schema as Record<string, unknown>
    : null;
  const releaseToken = typeof record?.release_token === 'string'
    ? record.release_token
    : null;

  return <>
    {releaseToken ? <meta name="rawafid-release-token" content={releaseToken} /> : null}
    {children}
  </>;
}
