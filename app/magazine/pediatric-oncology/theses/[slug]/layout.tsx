import type { ReactNode } from 'react';
import { getPediatricOncologyEvidenceRecord } from '@/lib/magazine';

type Params = Promise<{ slug: string }>;

export default async function PediatricOncologyThesisLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Params;
}) {
  const { slug } = await params;
  const record = await getPediatricOncologyEvidenceRecord('theses', slug);
  const token = typeof record?.schema_json?.release_token === 'string'
    ? record.schema_json.release_token
    : null;

  return <>
    {token ? <meta name="rawafid-release-token" content={token} /> : null}
    {children}
  </>;
}
