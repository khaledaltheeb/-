import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';

export const dynamic = 'force-dynamic';
type Params = Promise<{ legacyPath: string[] }>;

function preservedRoute(segments: string[]) {
  const path = segments.filter(Boolean).join('/');
  return path.toLowerCase().endsWith('.html') ? `/${path}` : `/${path}/`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { legacyPath } = await params;
  const route = preservedRoute(legacyPath);
  return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
}

export default async function LegacyPreservedCatchAll({ params }: { params: Params }) {
  const { legacyPath } = await params;
  const route = preservedRoute(legacyPath);
  const page = await getLegacyPreservedPage(route);
  if (!page) notFound();
  return <LegacyPreservedPageView page={page} route={route} />;
}
