'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ROLES = new Set(['owner','admin','editor','scientific_reviewer','seo_manager','specialist','center_manager','user']);
function text(fd:FormData,key:string,max:number){return String(fd.get(key)??'').trim().slice(0,max)}
function list(fd:FormData,key:string,maxItems=30){return text(fd,key,1800).split(/[،,\n]/).map(v=>v.trim()).filter(Boolean).slice(0,maxItems)}

async function requireAdmin(){
  const supabase=await createClient();
  const {data:claimsData}=await supabase.auth.getClaims();
  const userId=claimsData?.claims?.sub;
  if(!userId)redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).single();
  if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');
  return {supabase,profile};
}

export async function setUserAccess(formData: FormData) {
  const {supabase}=await requireAdmin();
  const targetId = String(formData.get('user_id') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim();
  const isActive = formData.get('is_active') === 'on';
  if (!UUID_RE.test(targetId) || !ROLES.has(role)) redirect('/admin/users?error=invalid-input');

  const { error } = await supabase.rpc('admin_set_user_access', {
    p_user_id: targetId,
    p_role: role,
    p_is_active: isActive,
  });
  if (error) redirect('/admin/users?error=update-failed');

  revalidatePath('/admin/users');
  revalidatePath('/admin');
  redirect('/admin/users?ok=updated');
}

export async function assignSpecialistDirect(formData:FormData){
  const {supabase,profile}=await requireAdmin();
  if(profile.role!=='owner')redirect('/admin/users?error=owner-required');
  const targetId=text(formData,'user_id',60);
  if(!UUID_RE.test(targetId))redirect('/admin/users?error=invalid-user');
  const expRaw=text(formData,'years_experience',3);
  const experience=expRaw?Number(expRaw):null;
  if(experience!==null&&(!Number.isInteger(experience)||experience<0||experience>80))redirect('/admin/users?error=invalid-experience');
  const {error}=await supabase.rpc('owner_assign_specialist_direct',{
    p_user_id:targetId,
    p_professional_title:text(formData,'professional_title',240)||null,
    p_specialties:list(formData,'specialties'),
    p_license_number:text(formData,'license_number',160)||null,
    p_years_experience:experience,
  });
  if(error)redirect('/admin/users?error=direct-specialist-failed');
  revalidatePath('/admin/users');
  revalidatePath('/admin/specialists');
  revalidatePath('/admin');
  revalidatePath('/specialists');
  revalidatePath('/account');
  revalidatePath('/specialist');
  revalidatePath('/notifications');
  revalidatePath('/sitemap.xml');
  redirect('/admin/users?ok=specialist-direct');
}
