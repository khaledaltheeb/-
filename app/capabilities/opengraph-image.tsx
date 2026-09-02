import { capabilityOgImage, CAPABILITY_OG_SIZE } from '@/components/capability-og-image';
import { getCapabilityRecord } from '@/lib/capabilities';

export const size = CAPABILITY_OG_SIZE;
export const contentType = 'image/svg+xml';
export const alt = 'لنرتقي بقدراتهم — منصة روافد';

export default async function Image() {
  const record = await getCapabilityRecord();
  return capabilityOgImage(record?.title || 'لنرتقي بقدراتهم: اكتشاف القدرات ونقاط القوة والوصول');
}
