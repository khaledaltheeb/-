import { notFound } from 'next/navigation';
import { capabilityOgImage } from '@/components/capability-og-image';
import { getCapabilityRecord } from '@/lib/capabilities';

type Params = Promise<{ slug: string }>;
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const record = await getCapabilityRecord(slug);
  if (!record) notFound();
  const response = capabilityOgImage(record.title, 'دليل قدرات ووصول');
  response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  return response;
}
