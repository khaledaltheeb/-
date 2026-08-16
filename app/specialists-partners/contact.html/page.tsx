import type { Metadata } from 'next';
import SpecialistContactPage from '../contact/page';

export const metadata: Metadata = {
  title: 'تواصل مع مختص | محادثة خاصة داخل المنصة',
  alternates: { canonical: '/specialists-partners/contact/' },
  robots: { index: false, follow: true, noarchive: true },
};

export default SpecialistContactPage;
