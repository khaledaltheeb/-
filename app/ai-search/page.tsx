import type { Metadata } from 'next';
import { PlatformSearchExperience, type PlatformSearchParams } from '@/app/search/page';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'البحث الذكي في منصة روافد',
  description: 'المسار التاريخي للبحث الدلالي العربي بعد نقله إلى محرك البحث الحالي في روافد دون تحويل الرابط.',
  alternates: { canonical: '/ai-search' },
  robots: { index: false, follow: true, noarchive: true },
};

export default async function LegacyAiSearchPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  return <PlatformSearchExperience searchParams={searchParams} routeBase="/ai-search" legacyIntro />;
}
