import type { Metadata } from 'next';
import SpecialistJoinPage from '../join/page';

// Preserve the literal legacy .html URL without letting static export map it
// onto the same join.html output path used by the canonical /join route.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'الانضمام إلى شبكة المختصين والشراكات المهنية',
  alternates: { canonical: '/specialists-partners/join/' },
  robots: { index: false, follow: true, noarchive: true },
};

export default SpecialistJoinPage;
