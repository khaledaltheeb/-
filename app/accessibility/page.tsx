import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/accessibility/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function AccessibilityLanding(){return <LegacyPreservedRoute route={route}/>;}
