'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i;
function text(fd:FormData,key:string,max:number){return String(fd.get(key)??'').trim().slice(0,max)}
export async function saveRedirect(formData:FormData){
 const id=text(formData,'id',60);if(id&&!UUID_RE.test(id))redirect('/admin/redirects?error=invalid-id');const source=text(formData,'source_path',1800);const destination=text(formData,'destination_path',1800);const status=Number(text(formData,'status_code',4));if(![301,302,307,308].includes(status))redirect('/admin/redirects?error=invalid-status');
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();if(!claims?.claims?.sub)redirect('/login?next=/admin/redirects');const {error}=await supabase.rpc('admin_upsert_redirect',{p_id:id||null,p_source_path:source,p_destination_path:destination,p_status_code:status,p_is_active:formData.get('is_active')==='on',p_note:text(formData,'note',1000)||null});if(error)redirect(`/admin/redirects?error=${encodeURIComponent(error.message.includes('loop')?'loop':'save')}`);revalidatePath('/admin/redirects');redirect('/admin/redirects?ok=saved');
}
export async function deleteRedirect(formData:FormData){const id=text(formData,'id',60);if(!UUID_RE.test(id))redirect('/admin/redirects');const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();if(!claims?.claims?.sub)redirect('/login?next=/admin/redirects');const {error}=await supabase.rpc('admin_delete_redirect',{p_id:id});if(error)redirect('/admin/redirects?error=delete');revalidatePath('/admin/redirects');redirect('/admin/redirects?ok=deleted');}
