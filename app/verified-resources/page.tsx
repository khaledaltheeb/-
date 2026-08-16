import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/verified-resources/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function VerifiedResourcesLanding(){return <LegacyPreservedRoute route={route}/>;}
