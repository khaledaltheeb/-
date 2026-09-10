import type { Metadata } from 'next';
import PublishedContentPage,{generateMetadata as contentMetadata} from '@/app/content/[slug]/page';

type Params=Promise<{slug:string}>;

export async function generateMetadata({params}:{params:Params}):Promise<Metadata>{
  const {slug}=await params;
  // Preserve the published page and its canonical target without adding a noindex override.
  // The canonical content metadata is database-controlled and all published content is indexable.
  return contentMetadata({params:Promise.resolve({slug})});
}

export default async function HistoricalResourcePage({params}:{params:Params}){
  const {slug}=await params;
  return PublishedContentPage({params:Promise.resolve({slug})});
}
