import type { Metadata } from 'next';
import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
type Params=Promise<{slug?:string[]}>;
export const dynamic='force-dynamic';
function route(slug:string[]=[]){return `/${['trust',...slug].join('/')}/`;}
export async function generateMetadata({params}:{params:Params}):Promise<Metadata>{const {slug}=await params;return preservedRouteMetadata(route(slug));}
export default async function TrustLanding({params}:{params:Params}){const {slug}=await params;return <LegacyPreservedRoute route={route(slug)}/>;}
