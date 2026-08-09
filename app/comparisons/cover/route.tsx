import { capabilityOgImage } from '@/components/capability-og-image';
import { getComparisonRecord } from '@/lib/comparisons';

export async function GET() {
  const record = await getComparisonRecord();
  return capabilityOgImage(record?.title || 'موسوعة المقارنات النفسية والمنهجية', 'موسوعة المقارنات المنهجية');
}
