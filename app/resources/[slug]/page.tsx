import type { Metadata } from 'next';
import PublishedContentPage,{generateMetadata as contentMetadata} from '@/app/content/[slug]/page';

type Params=Promise<{slug:string}>;

function canonicalPath(value:unknown):string{
  if(!value)return'';
  const raw=value instanceof URL?value.toString():typeof value==='string'?value:'';
  if(!raw)return'';
  try{
    const pathname=new URL(raw,'https://healthrenewal.org').pathname;
    return pathname==='/'?'/':`${pathname.replace(/\/+$/u,'')}/`;
  }catch{return'';}
}

export async function generateMetadata({params}:{params:Params}):Promise<Metadata>{
  const {slug}=await params;
  const base=await contentMetadata({params:Promise.resolve({slug})});
  const canonical=canonicalPath(base.alternates?.canonical);
  const resourcePath=`/resources/${slug}/`;

  // Canonical published resources inherit their database-controlled robots policy.
  // Only historical aliases that point to a different canonical remain noindex.
  if(canonical===resourcePath)return base;
  return{...base,robots:{index:false,follow:true,noarchive:true}};
}

export default async function HistoricalResourcePage({params}:{params:Params}){
  const {slug}=await params;
  return PublishedContentPage({params:Promise.resolve({slug})});
}
