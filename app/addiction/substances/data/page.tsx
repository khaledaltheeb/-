import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';

const route = '/addiction/substances/data/';
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
}

export default async function AddictionLegacyDataPage() {
  const page = await getLegacyPreservedPage(route);
  if (!page) notFound();
  return <LegacyPreservedPageView page={page} route={route} />;
}
