import type { Metadata } from 'next';
import SpecialistContactPage from '../contact/page';

// Preserve the literal legacy .html URL without letting static export map it
// onto the same contact.html output path used by the canonical /contact route.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'تواصل مع مختص | محادثة خاصة داخل المنصة',
  alternates: { canonical: '/specialists-partners/contact/' },
  robots: { index: false, follow: true, noarchive: true },
};

export default SpecialistContactPage;
