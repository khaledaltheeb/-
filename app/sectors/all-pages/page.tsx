import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/sectors/all-pages/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function SectorsAllPagesLanding(){return <LegacyPreservedRoute route={route}/>;}
