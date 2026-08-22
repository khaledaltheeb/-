import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';

export async function preservedRouteMetadata(route: string): Promise<Metadata> {
  return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
}

export default async function LegacyPreservedRoute({ route, lead }: { route: string; lead?: ReactNode }) {
  const page = await getLegacyPreservedPage(route);
  if (!page) notFound();
  return <LegacyPreservedPageView page={page} route={route} lead={lead} />;
}
