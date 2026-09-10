import type { Metadata } from 'next';
import SpecialistJoinPage from '../join/page';
import { buildSeoMetadata } from '@/lib/seo';

// Preserve the literal legacy .html URL without letting static export map it
// onto the same join.html output path used by the canonical /join route.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildSeoMetadata({
  title: 'الانضمام إلى شبكة المختصين والشراكات المهنية',
  description: 'المسار التاريخي العام للانضمام إلى شبكة المختصين والشراكات المهنية في روافد، مع توحيد الإشارة إلى صفحة الانضمام الحالية.',
  path: '/specialists-partners/join/',
  index: true,
  follow: true,
  type: 'website',
  keywords: ['الانضمام إلى روافد','شبكة المختصين','الشراكات المهنية'],
});

export default SpecialistJoinPage;
