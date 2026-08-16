import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/sectors/calendars/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function CalendarSectorLanding(){return <LegacyPreservedRoute route={route}/>;}
