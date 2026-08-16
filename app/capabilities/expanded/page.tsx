import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/capabilities/expanded/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function ExpandedCapabilitiesLanding(){return <LegacyPreservedRoute route={route}/>;}
