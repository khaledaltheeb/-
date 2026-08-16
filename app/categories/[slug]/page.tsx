import type { Metadata } from 'next';
import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
type Params=Promise<{slug:string}>;
export const dynamic='force-dynamic';
function route(slug:string){return `/categories/${slug}/`;}
export async function generateMetadata({params}:{params:Params}):Promise<Metadata>{const {slug}=await params;return preservedRouteMetadata(route(slug));}
export default async function CategoryLanding({params}:{params:Params}){const {slug}=await params;return <LegacyPreservedRoute route={route(slug)}/>;}
