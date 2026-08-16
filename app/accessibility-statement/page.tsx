import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
const route='/accessibility-statement/';
export const dynamic='force-dynamic';
export async function generateMetadata(){return preservedRouteMetadata(route);}
export default function AccessibilityStatementLanding(){return <LegacyPreservedRoute route={route}/>;}
