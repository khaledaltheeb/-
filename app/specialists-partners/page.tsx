import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/specialists-partners/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function SpecialistsPartnersLanding(){return <LegacyPreservedRoute route={route}/>;}
