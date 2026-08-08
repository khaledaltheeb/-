import { notFound } from 'next/navigation';
import { capabilityCover } from '@/lib/capability-cover';
import { getCapabilityPage } from '@/lib/capabilities';

type Params = Promise<{ slug: string }>;
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const record = await getCapabilityPage(slug);
  if (!record) notFound();
  return capabilityCover(record, slug);
}
