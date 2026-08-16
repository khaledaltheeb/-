import type { Metadata } from 'next';
import PublishedContentPage,{generateMetadata as contentMetadata} from '@/app/content/[slug]/page';
const contentSlug='legacy-landing-hubs';
export async function generateMetadata():Promise<Metadata>{const base=await contentMetadata({params:Promise.resolve({slug:contentSlug})});return{...base,robots:{index:false,follow:true,noarchive:true}}}
export default function LegacyHubsPage(){return PublishedContentPage({params:Promise.resolve({slug:contentSlug})})}
