import type { Metadata } from 'next';
import SpecialistContactPage from '../contact/page';
import { buildSeoMetadata } from '@/lib/seo';

// Preserve the literal legacy .html URL without letting static export map it
// onto the same contact.html output path used by the canonical /contact route.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildSeoMetadata({
  title: 'تواصل مع مختص | محادثة خاصة داخل المنصة',
  description: 'المحتوى العام لمسار التواصل مع المختص داخل روافد، مع الخصوصية والحد الأدنى من المعلومات وحدود الطوارئ.',
  path: '/specialists-partners/contact/',
  index: true,
  follow: true,
  type: 'website',
  keywords: ['التواصل مع مختص','دليل المختصين','رسائل مهنية'],
});

export default SpecialistContactPage;
