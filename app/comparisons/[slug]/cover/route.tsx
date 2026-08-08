import { capabilityOgImage } from '@/components/capability-og-image';
import { getComparisonRecord, legacyComparisonTarget } from '@/lib/comparisons';

export const runtime = 'edge';
type Params = Promise<{ slug: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const legacyTarget = legacyComparisonTarget(slug);
  if (legacyTarget) return capabilityOgImage('موسوعة المقارنات النفسية والمنهجية', 'موسوعة المقارنات المنهجية');
  const record = await getComparisonRecord(slug);
  return capabilityOgImage(record?.title || 'موسوعة المقارنات النفسية والمنهجية', 'موسوعة المقارنات المنهجية');
}
