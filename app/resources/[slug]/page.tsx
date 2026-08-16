import type { Metadata } from 'next';
import PublishedContentPage,{generateMetadata as contentMetadata} from '@/app/content/[slug]/page';

type Params=Promise<{slug:string}>;

function canonicalPath(value: Metadata['alternates'] extends infer A
  ? A extends { canonical?: infer C } ? C : never
  : never): string {
  if (!value) return '';
  const raw = value instanceof URL ? value.toString() : typeof value === 'string' ? value : '';
  if (!raw) return '';
  try {
    const pathname = new URL(raw, 'https://healthrenewal.org').pathname;
    return pathname === '/' ? '/' : `${pathname.replace(/\/+$/u,'')}/`;
  } catch {
    return '';
  }
}

export async function generateMetadata({params}:{params:Params}):Promise<Metadata>{
  const {slug}=await params;
  const base=await contentMetadata({params:Promise.resolve({slug})});
  const canonical=canonicalPath(base.alternates?.canonical);
  const resourcePath=`/resources/${slug}/`;

  // A published record whose canonical lives under /resources/ is a first-class
  // resource page and must inherit its database-controlled robots policy. Only
  // historical aliases pointing at a different canonical remain noindex.
  if(canonical===resourcePath)return base;
  return{...base,robots:{index:false,follow:true,noarchive:true}};
}

export default async function HistoricalResourcePage({params}:{params:Params}){
  const {slug}=await params;
  return PublishedContentPage({params:Promise.resolve({slug})});
}
