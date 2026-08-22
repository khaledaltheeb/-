'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REVISION_CREATORS=new Set(['owner','admin','editor']);

function field(formData:FormData,key:string,max:number){return String(formData.get(key)??'').trim().slice(0,max);}
async function requireRoles(roles:Set<string>){
  const supabase=await createClient();
  const {data:claimsData}=await supabase.auth.getClaims();
  const userId=claimsData?.claims?.sub;
  if(!userId)redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).single();
  if(!profile?.is_active||!roles.has(profile.role))redirect('/account');
  return supabase;
}
function refreshContent(id:string,slug?:string){
  revalidatePath('/admin/content');
  revalidatePath(`/admin/content/${id}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/sitemaps/content.xml');
  if(slug)revalidatePath(`/content/${slug}`);
}

export async function beginPublishedRevision(formData:FormData){
  const supabase=await requireRoles(REVISION_CREATORS);
  const id=field(formData,'id',60);
  if(!UUID_RE.test(id))redirect('/admin/content?error=invalid-revision-target');
  const {data:revisionId,error}=await supabase.rpc('create_published_content_revision',{p_content_id:id});
  if(error||!revisionId)redirect(`/admin/content/${id}?error=revision-create-failed`);
  refreshContent(id);
  redirect(`/admin/content/${revisionId}?ok=revision-started`);
}

export async function applyPublishedRevision(formData:FormData){
  const supabase=await requireRoles(new Set(['owner','admin']));
  const revisionId=field(formData,'revision_id',60);
  const targetId=field(formData,'target_id',60);
  const targetSlug=field(formData,'target_slug',140);
  if(!UUID_RE.test(revisionId)||!UUID_RE.test(targetId))redirect('/admin/content?error=invalid-revision-target');
  const {error}=await supabase.rpc('apply_published_content_revision',{p_revision_id:revisionId});
  if(error)redirect(`/admin/content/${revisionId}?error=revision-apply-failed`);
  refreshContent(revisionId);
  refreshContent(targetId,targetSlug||undefined);
  redirect(`/admin/content/${targetId}?ok=revision-applied`);
}
