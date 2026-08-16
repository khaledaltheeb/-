import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
const hubRoute = (slug: string) => `/hubs/${slug}/`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const route = hubRoute(slug);
  return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
}

export default async function LegacyHubPage({ params }: { params: Params }) {
  const { slug } = await params;
  const route = hubRoute(slug);
  const page = await getLegacyPreservedPage(route);
  if (!page) notFound();
  return <LegacyPreservedPageView page={page} route={route} />;
}
