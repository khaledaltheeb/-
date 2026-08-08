'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES=new Set(['pending','accepted','rejected']);

export async function reviewProviderDocument(formData:FormData){
  const id=String(formData.get('id')??'').trim();
  const userId=String(formData.get('user_id')??'').trim();
  const status=String(formData.get('status')??'').trim();
  const note=String(formData.get('review_note')??'').trim().slice(0,2000);
  if(!UUID_RE.test(id)||!UUID_RE.test(userId)||!STATUSES.has(status))redirect('/admin');
  if(status==='rejected'&&!note)redirect(`/admin/verification-documents/${userId}?error=note-required`);

  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect(`/login?next=${encodeURIComponent(`/admin/verification-documents/${userId}`)}`);
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();
  if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');
  const {error}=await supabase.rpc('admin_review_provider_verification_document',{p_id:id,p_status:status,p_note:note||null});
  if(error)redirect(`/admin/verification-documents/${userId}?error=review-failed`);
  revalidatePath(`/admin/verification-documents/${userId}`);revalidatePath('/admin/specialists');revalidatePath('/admin/centers');revalidatePath('/account/verification-documents');
  redirect(`/admin/verification-documents/${userId}?ok=reviewed`);
}
