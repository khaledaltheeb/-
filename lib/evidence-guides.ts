export type EvidenceGuideReference = { title?: string; url?: string; publisher?: string; year?: string | number };
export type EvidenceGuideRecord = {
  id: string; slug: string; title: string; excerpt: string | null; body_json: unknown; body_text: string | null;
  seo_title: string | null; seo_description: string | null; canonical_url: string | null; robots_index: boolean; robots_follow: boolean;
  published_at: string | null; updated_at: string; primary_keyword: string | null; secondary_keywords: string[] | null; semantic_terms: string[] | null;
  author_display_name: string | null; reviewer_display_name: string | null; reviewer_credentials: string | null; last_reviewed_at: string | null;
  references_json: EvidenceGuideReference[] | null; medical_disclaimer: string | null; schema_json: Record<string, unknown> | null;
};
export type EvidenceGuideListItem = Pick<EvidenceGuideRecord, 'id' | 'slug' | 'title' | 'excerpt' | 'canonical_url' | 'published_at' | 'updated_at' | 'references_json' | 'schema_json'>;

const DETAIL_FIELDS='id,slug,title,excerpt,body_json,body_text,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json';
const LIST_FIELDS='id,slug,title,excerpt,canonical_url,published_at,updated_at,references_json,schema_json';
function isPublishedNow(value:string|null){return !value||new Date(value).getTime()<=Date.now();}
export function evidenceGuideCategory(record:Pick<EvidenceGuideRecord,'schema_json'>){const v=record.schema_json?.category;return typeof v==='string'&&v.trim()?v.trim():'أدلة مبنية على المصادر';}
export function safeEvidenceReferences(value:EvidenceGuideReference[]|null){return (value??[]).filter((r)=>typeof r?.url==='string'&&/^https:\/\//i.test(r.url));}

async function restRows<T>(params:URLSearchParams):Promise<T[]>{
 const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||'').replace(/\/$/,'');
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'';
 if(!base||!key) return [];
 try{
  const response=await fetch(`${base}/rest/v1/content?${params.toString()}`,{headers:{apikey:key,Authorization:`Bearer ${key}`,Accept:'application/json'},next:{revalidate:300,tags:['evidence-guides']}});
  if(!response.ok) return [];
  const data:unknown=await response.json();
  return Array.isArray(data)?data as T[]:[];
 }catch{return []}
}

export async function getEvidenceGuideItems():Promise<EvidenceGuideListItem[]>{
 const params=new URLSearchParams({select:LIST_FIELDS,content_type:'eq.guide',status:'eq.published',canonical_url:'like./evidence-guides/%',order:'title.asc',limit:'500'});
 const rows=await restRows<EvidenceGuideListItem>(params);
 return rows.filter((r)=>isPublishedNow(r.published_at));
}
export async function getEvidenceGuideHub():Promise<EvidenceGuideRecord|null>{
 const params=new URLSearchParams({select:DETAIL_FIELDS,slug:'eq.evidence-guides-hub',status:'eq.published',limit:'1'});
 const [r]=await restRows<EvidenceGuideRecord>(params);
 return r&&isPublishedNow(r.published_at)?r:null;
}
export async function getEvidenceGuideRecord(routeSlug:string):Promise<EvidenceGuideRecord|null>{
 const safe=decodeURIComponent(routeSlug).replace(/^\/+|\/+$/g,''); if(!safe||safe.includes('/')) return null;
 const params=new URLSearchParams({select:DETAIL_FIELDS,content_type:'eq.guide',status:'eq.published',canonical_url:`eq./evidence-guides/${safe}/`,limit:'1'});
 const [r]=await restRows<EvidenceGuideRecord>(params);
 return r&&isPublishedNow(r.published_at)?r:null;
}
export async function getRelatedEvidenceGuides(record:EvidenceGuideRecord,limit=4){
 const items=await getEvidenceGuideItems(); const category=evidenceGuideCategory(record);
 return items.filter((i)=>i.id!==record.id).sort((a,b)=>Number(evidenceGuideCategory(b)===category)-Number(evidenceGuideCategory(a)===category)).slice(0,limit);
}
