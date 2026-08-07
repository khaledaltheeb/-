'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function text(fd:FormData,key:string,max:number){return String(fd.get(key)??'').trim().slice(0,max)}

export async function saveCenterLicense(formData:FormData){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();const uid=claims?.claims?.sub;if(!uid)redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',uid).single();
  if(!profile?.is_active||!['center_manager','owner','admin'].includes(profile.role))redirect('/account');
  const id=text(formData,'center_id',60),slug=text(formData,'slug',140);if(!UUID_RE.test(id))redirect('/center?error=invalid-license-center');
  const expiry=text(formData,'license_expiry_date',20);
  if(expiry&&Number.isNaN(new Date(`${expiry}T00:00:00Z`).getTime()))redirect(`/center?id=${id}&error=invalid-license-date`);
  const {error}=await supabase.rpc('set_center_license',{
    p_center_id:id,p_license_number:text(formData,'license_number',200)||null,p_regulatory_authority:text(formData,'regulatory_authority',240)||null,p_license_expiry_date:expiry||null
  });
  if(error)redirect(`/center?id=${id}&error=license-save-failed`);
  revalidatePath('/center');revalidatePath('/centers');if(slug)revalidatePath(`/centers/${slug}`);
  redirect(`/center?id=${id}&ok=license-saved`);
}
