import { notFound } from 'next/navigation';
import { capabilityOgImage } from '@/components/capability-og-image';
import { getCapabilityRecord } from '@/lib/capabilities';

export const dynamic = 'force-dynamic';

export async function GET() {
  const record = await getCapabilityRecord();
  if (!record) notFound();
  const response = capabilityOgImage(record.title, 'مرجع القدرات والوصول');
  response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  return response;
}
