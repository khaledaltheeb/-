import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/en/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function EnglishLanding(){return <LegacyPreservedRoute route={route}/>;}
