import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/es/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function SpanishLanding(){return <LegacyPreservedRoute route={route}/>;}
