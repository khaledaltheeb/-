import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/family/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function FamilyLanding(){return <LegacyPreservedRoute route={route}/>;}
