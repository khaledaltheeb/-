import type { Metadata } from 'next';
import SpecialistJoinPage from '../join/page';

export const metadata: Metadata = {
  title: 'الانضمام إلى شبكة المختصين والشراكات المهنية',
  alternates: { canonical: '/specialists-partners/join/' },
  robots: { index: false, follow: true, noarchive: true },
};

export default SpecialistJoinPage;
