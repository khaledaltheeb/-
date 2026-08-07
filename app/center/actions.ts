'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TYPES=new Set(['center','clinic','hospital','rehabilitation_center','association','school','other']);
function text(fd:FormData,key:string,max:number){return String(fd.get(key)??'').trim().slice(0,max)}
function list(fd:FormData,key:string,maxItems=60){return text(fd,key,8000).split(/[،,\n]/).map(v=>v.trim()).filter(Boolean).slice(0,maxItems)}
function bool(fd:FormData,key:string){return fd.get(key)==='on'}
function optionalNumber(fd:FormData,key:string,min:number,max:number){const raw=text(fd,key,40);if(!raw)return null;const n=Number(raw);return Number.isFinite(n)&&n>=min&&n<=max?n:null}
function safeUrl(raw:string){if(!raw)return null;try{const u=new URL(raw);return ['http:','https:'].includes(u.protocol)?u.toString():null}catch{return null}}
function hours(fd:FormData){const raw=text(fd,'working_hours',6000);const out:Record<string,string>={};for(const line of raw.split('\n').map(v=>v.trim()).filter(Boolean).slice(0,21)){const i=line.indexOf(':');if(i<=0)continue;const day=line.slice(0,i).trim().slice(0,40),value=line.slice(i+1).trim().slice(0,120);if(day&&value)out[day]=value}return out}

export async function saveCenter(formData:FormData){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();if(!profile?.is_active||profile.role!=='center_manager')redirect('/account');
  const id=text(formData,'id',60),slug=text(formData,'slug',140).toLowerCase(),name=text(formData,'name',220),type=text(formData,'center_type',60);
  if((id&&!UUID_RE.test(id))||!SLUG_RE.test(slug)||name.length<2||!TYPES.has(type))redirect('/center?error=invalid-input');
  const parent=text(formData,'parent_center_id',60);if(parent&&!UUID_RE.test(parent))redirect('/center?error=invalid-parent');
  const email=text(formData,'email',254);if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))redirect('/center?error=invalid-email');
  const websiteRaw=text(formData,'website_url',500),logoRaw=text(formData,'logo_url',500),coverRaw=text(formData,'cover_url',500);
  const website=safeUrl(websiteRaw),logo=safeUrl(logoRaw),cover=safeUrl(coverRaw);if((websiteRaw&&!website)||(logoRaw&&!logo)||(coverRaw&&!cover))redirect('/center?error=invalid-url');
  const latRaw=text(formData,'latitude',40),lngRaw=text(formData,'longitude',40),lat=optionalNumber(formData,'latitude',-90,90),lng=optionalNumber(formData,'longitude',-180,180);
  if((latRaw&&lat===null)||(lngRaw&&lng===null))redirect('/center?error=invalid-location');
  const {error}=await supabase.rpc('upsert_my_center',{
    p_id:id||null,p_slug:slug,p_name:name,p_description:text(formData,'description',12000)||null,p_logo_url:logo,p_cover_url:cover,
    p_email:email||null,p_phone:text(formData,'phone',80)||null,p_website_url:website,p_country:text(formData,'country',120)||null,
    p_region:text(formData,'region',120)||null,p_city:text(formData,'city',120)||null,p_address:text(formData,'address',500)||null,
    p_latitude:lat,p_longitude:lng,p_working_hours:hours(formData),p_parent_center_id:parent||null,p_center_type:type,
    p_services:list(formData,'services'),p_languages:list(formData,'languages'),p_offers_remote:bool(formData,'offers_remote'),
    p_offers_in_person:bool(formData,'offers_in_person'),p_show_email:bool(formData,'show_email'),p_show_phone:bool(formData,'show_phone'),p_show_map:bool(formData,'show_map')
  });
  if(error)redirect('/center?error=save-failed');
  revalidatePath('/center');revalidatePath('/centers');revalidatePath(`/centers/${slug}`);revalidatePath('/sitemap.xml');redirect('/center?ok=saved');
}
