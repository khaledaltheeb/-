import { notFound } from 'next/navigation';
import { capabilityCover } from '@/lib/capability-cover';
import { getCapabilityPage } from '@/lib/capabilities';

export const dynamic = 'force-dynamic';

export async function GET() {
  const record = await getCapabilityPage();
  if (!record) notFound();
  return capabilityCover(record);
}
