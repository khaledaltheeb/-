import type { Metadata } from 'next';
import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string; segments: string[] }>;

function routeFor(slug: string, segments: string[]) {
  return `/sections/${slug}/${segments.filter(Boolean).join('/')}/`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, segments } = await params;
  return preservedRouteMetadata(routeFor(slug, segments));
}

export default async function NestedLegacySectionPage({ params }: { params: Params }) {
  const { slug, segments } = await params;
  return <LegacyPreservedRoute route={routeFor(slug, segments)} />;
}
