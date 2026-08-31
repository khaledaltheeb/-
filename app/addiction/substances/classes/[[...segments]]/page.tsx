import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';

type Params = Promise<{ segments?: string[] }>;
const routeFor = (segments: string[] = []) => `/addiction/substances/classes/${segments.filter(Boolean).join('/')}${segments.length ? '/' : ''}`;

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { segments = [] } = await params;
  const route = routeFor(segments);
  return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
}

export default async function AddictionLegacyClassPage({ params }: { params: Params }) {
  const { segments = [] } = await params;
  const route = routeFor(segments);
  const page = await getLegacyPreservedPage(route);
  if (!page) notFound();
  return <LegacyPreservedPageView page={page} route={route} />;
}
