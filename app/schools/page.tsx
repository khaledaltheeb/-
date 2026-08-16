import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/schools/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function SchoolsLanding(){return <LegacyPreservedRoute route={route}/>;}
