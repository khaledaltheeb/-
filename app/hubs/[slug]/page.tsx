import type { Metadata } from 'next';
import PublishedContentPage,{generateMetadata as contentMetadata} from '@/app/content/[slug]/page';
type Params=Promise<{slug:string}>;
function contentSlug(slug:string){return `legacy-hub-${slug}`}
export async function generateMetadata({params}:{params:Params}):Promise<Metadata>{const {slug}=await params;const base=await contentMetadata({params:Promise.resolve({slug:contentSlug(slug)})});return{...base,robots:{index:false,follow:true,noarchive:true}}}
export default async function LegacyHubPage({params}:{params:Params}){const {slug}=await params;return PublishedContentPage({params:Promise.resolve({slug:contentSlug(slug)})})}
