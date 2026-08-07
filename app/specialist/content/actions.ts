'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buildContentPayload, field, SPECIALIST_CONTENT_TYPES, validUuid } from '@/lib/content-editor-payload';

async function requireSpecialist() {
  const supabase=await createClient();
  const {data:claimsData}=await supabase.auth.getClaims();
  const userId=claimsData?.claims?.sub;
  if(!userId) redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).single();
  if(!profile?.is_active||profile.role!=='specialist') redirect('/account');
  return {supabase,userId};
}

function refresh(slug?:string){
  revalidatePath('/specialist');
  revalidatePath('/specialist/content');
  revalidatePath('/admin/content');
  if(slug) revalidatePath(`/content/${slug}`);
}

export async function createSpecialistDraft(formData:FormData){
  const {supabase}=await requireSpecialist();
  const data=buildContentPayload(formData,SPECIALIST_CONTENT_TYPES);
  if(!data) redirect('/specialist/content/new?error=invalid-input');
  const {data:id,error}=await supabase.rpc('create_content_draft_v3',data);
  if(error||!id) redirect('/specialist/content/new?error=create-failed');
  refresh(data.p_slug);
  redirect(`/specialist/content/${id}?ok=created`);
}

export async function updateSpecialistDraft(formData:FormData){
  const {supabase}=await requireSpecialist();
  const id=field(formData,'id',60);
  const data=buildContentPayload(formData,SPECIALIST_CONTENT_TYPES);
  if(!validUuid(id)||!data) redirect('/specialist/content?error=invalid-input');
  const {error}=await supabase.rpc('update_content_draft_v3',{p_id:id,...data});
  if(error) redirect(`/specialist/content/${id}?error=update-failed`);
  refresh(data.p_slug);
  redirect(`/specialist/content/${id}?ok=saved`);
}

export async function submitSpecialistDraft(formData:FormData){
  const {supabase}=await requireSpecialist();
  const id=field(formData,'id',60);
  if(!validUuid(id)) redirect('/specialist/content?error=invalid-input');
  const {error}=await supabase.rpc('transition_content_status',{p_id:id,p_target:'scientific_review'});
  if(error) redirect(`/specialist/content/${id}?error=submit-failed`);
  refresh();
  redirect(`/specialist/content/${id}?ok=submitted`);
}

export async function deleteSpecialistDraft(formData:FormData){
  const {supabase}=await requireSpecialist();
  const id=field(formData,'id',60);
  if(!validUuid(id)) redirect('/specialist/content?error=invalid-input');
  const {error}=await supabase.rpc('delete_content_draft',{p_id:id});
  if(error) redirect(`/specialist/content/${id}?error=delete-failed`);
  refresh();
  redirect('/specialist/content?ok=deleted');
}
