import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/encyclopedia/all/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function EncyclopediaAllLanding(){return <LegacyPreservedRoute route={route}/>;}
