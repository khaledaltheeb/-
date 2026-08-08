import { capabilityOgImage, CAPABILITY_OG_SIZE } from '@/components/capability-og-image';
import { getCapabilityRecord } from '@/lib/capabilities';

export const size = CAPABILITY_OG_SIZE;
export const contentType = 'image/png';
export const alt = 'دليل القدرات — منصة روافد';

type Params = Promise<{ slug: string }>;

export default async function Image({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getCapabilityRecord(slug);
  return capabilityOgImage(record?.title || 'دليل القدرات ونقاط القوة والوصول');
}
