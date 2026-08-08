'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES=new Set(['unverified','pending','verified','rejected','suspended']);

export async function setCenterStatus(formData:FormData){
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect('/login');
 const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');
 const id=String(formData.get('id')??'').trim(),slug=String(formData.get('slug')??'').trim().slice(0,140),status=String(formData.get('status')??'').trim(),active=formData.get('is_active')==='on',note=String(formData.get('verification_note')??'').trim().slice(0,2000)||null;
 if(!UUID_RE.test(id)||!STATUSES.has(status))redirect('/admin/centers?error=invalid-input');
 if((status==='rejected'||status==='suspended')&&!note)redirect('/admin/centers?error=note-required');
 const {error}=await supabase.rpc('set_center_verification_v2',{p_id:id,p_status:status,p_is_active:active,p_note:note});if(error)redirect('/admin/centers?error=update-failed');
 revalidatePath('/admin');revalidatePath('/admin/centers');revalidatePath('/centers');revalidatePath('/account');revalidatePath('/join/center');revalidatePath('/notifications');if(slug)revalidatePath(`/centers/${slug}`);revalidatePath('/sitemap.xml');redirect('/admin/centers?ok=updated');
}
