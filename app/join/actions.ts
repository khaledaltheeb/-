'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const SLUG_RE=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function text(fd:FormData,key:string,max:number){return String(fd.get(key)??'').trim().slice(0,max)}
function list(fd:FormData,key:string,maxItems=40){return text(fd,key,5000).split(/[،,\n]/).map(v=>v.trim()).filter(Boolean).slice(0,maxItems)}
function optionalNumber(fd:FormData,key:string,min:number,max:number){const raw=text(fd,key,40);if(!raw)return null;const value=Number(raw);return Number.isFinite(value)&&value>=min&&value<=max?value:null}
function optionalInteger(fd:FormData,key:string,min:number,max:number){const raw=text(fd,key,20);if(!raw)return null;const value=Number.parseInt(raw,10);return Number.isInteger(value)&&value>=min&&value<=max?value:null}
function validEmail(raw:string){return !raw||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)}
function safeWebsite(raw:string){if(!raw)return null;try{const url=new URL(raw);return ['http:','https:'].includes(url.protocol)?url.toString():null}catch{return null}}
function parseHours(raw:string){const result:Record<string,string>={};for(const line of raw.split('\n').map(v=>v.trim()).filter(Boolean).slice(0,14)){const split=line.indexOf(':');if(split<1)continue;const day=line.slice(0,split).trim().slice(0,60);const hours=line.slice(split+1).trim().slice(0,120);if(day&&hours)result[day]=hours;}return result;}
function generatedSpecialistSlug(){return `specialist-${crypto.randomUUID().replace(/-/g,'').slice(0,12)}`;}

async function requireStandardUser(next:string){
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect(`/login?next=${encodeURIComponent(next)}`);
 const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();if(!profile?.is_active)redirect('/account');
 if(profile.role==='specialist')redirect('/specialist');if(profile.role==='center_manager')redirect('/center');if(profile.role==='owner'||profile.role==='admin')redirect('/admin');if(profile.role!=='user')redirect('/account');
 return supabase;
}

export async function submitSpecialistApplication(formData:FormData){
 const supabase=await requireStandardUser('/join/specialist');
 const submittedSlug=text(formData,'slug',140).toLowerCase();
 const slug=submittedSlug||generatedSpecialistSlug();
 const fullName=text(formData,'full_name',200),email=text(formData,'email',254),websiteRaw=text(formData,'website_url',500);
 const latitudeRaw=text(formData,'latitude',40),longitudeRaw=text(formData,'longitude',40),experienceRaw=text(formData,'years_experience',20);
 const latitude=optionalNumber(formData,'latitude',-90,90),longitude=optionalNumber(formData,'longitude',-180,180),experience=optionalInteger(formData,'years_experience',0,80),website=safeWebsite(websiteRaw);
 if(!SLUG_RE.test(slug)||fullName.length<3||!validEmail(email)||(websiteRaw&&!website)||(latitudeRaw&&latitude===null)||(longitudeRaw&&longitude===null)||(experienceRaw&&experience===null))redirect('/join/specialist?error=invalid-input');
 const {error}=await supabase.rpc('submit_specialist_application',{
  p_slug:slug,p_full_name:fullName,p_professional_title:text(formData,'professional_title',240)||null,p_bio:text(formData,'bio',10000)||null,
  p_email:email||null,p_phone:text(formData,'phone',80)||null,p_website_url:website,p_country:text(formData,'country',120)||null,p_region:text(formData,'region',120)||null,p_city:text(formData,'city',120)||null,
  p_latitude:latitude,p_longitude:longitude,p_languages:list(formData,'languages'),p_specialties:list(formData,'specialties'),p_qualifications:text(formData,'qualifications',12000).split('\n').map(v=>v.trim()).filter(Boolean).slice(0,30),
  p_license_number:text(formData,'license_number',160)||null,p_years_experience:experience,p_offers_remote:formData.get('offers_remote')==='on',p_offers_in_person:formData.get('offers_in_person')==='on'
 });
 if(error)redirect('/join/specialist?error=submit-failed');
 revalidatePath('/join/specialist');revalidatePath('/account');revalidatePath('/admin/specialists');revalidatePath('/admin');redirect('/join/specialist?status=submitted');
}

export async function submitCenterApplication(formData:FormData){
 const supabase=await requireStandardUser('/join/center');
 const slug=text(formData,'slug',140).toLowerCase(),name=text(formData,'name',220),email=text(formData,'email',254),websiteRaw=text(formData,'website_url',500);
 const latitudeRaw=text(formData,'latitude',40),longitudeRaw=text(formData,'longitude',40),latitude=optionalNumber(formData,'latitude',-90,90),longitude=optionalNumber(formData,'longitude',-180,180),website=safeWebsite(websiteRaw);
 const expiryRaw=text(formData,'license_expiry_date',20);const expiry=expiryRaw&&/^\d{4}-\d{2}-\d{2}$/.test(expiryRaw)?expiryRaw:null;
 const type=text(formData,'center_type',40);const allowedTypes=new Set(['center','clinic','hospital','rehabilitation_center','association','school','other']);
 if(!SLUG_RE.test(slug)||name.length<2||!allowedTypes.has(type)||!validEmail(email)||(websiteRaw&&!website)||(latitudeRaw&&latitude===null)||(longitudeRaw&&longitude===null)||(expiryRaw&&!expiry))redirect('/join/center?error=invalid-input');
 const {error}=await supabase.rpc('submit_center_application',{
  p_slug:slug,p_name:name,p_description:text(formData,'description',12000)||null,p_email:email||null,p_phone:text(formData,'phone',80)||null,p_website_url:website,
  p_country:text(formData,'country',120)||null,p_region:text(formData,'region',120)||null,p_city:text(formData,'city',120)||null,p_address:text(formData,'address',500)||null,
  p_latitude:latitude,p_longitude:longitude,p_working_hours:parseHours(text(formData,'working_hours',6000)),p_center_type:type,p_services:list(formData,'services'),p_languages:list(formData,'languages'),
  p_offers_remote:formData.get('offers_remote')==='on',p_offers_in_person:formData.get('offers_in_person')==='on',p_license_number:text(formData,'license_number',200)||null,p_regulatory_authority:text(formData,'regulatory_authority',240)||null,p_license_expiry_date:expiry
 });
 if(error)redirect('/join/center?error=submit-failed');
 revalidatePath('/join/center');revalidatePath('/account');revalidatePath('/admin/centers');revalidatePath('/admin');redirect('/join/center?status=submitted');
}
