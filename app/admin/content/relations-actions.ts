'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function updateContentRelations(formData:FormData){
 const id=String(formData.get('id')??'').trim();if(!UUID_RE.test(id))redirect('/admin/content?error=invalid');
 const categories=formData.getAll('category_ids').map(String).filter((value)=>UUID_RE.test(value)).slice(0,50);
 const tags=formData.getAll('tag_ids').map(String).filter((value)=>UUID_RE.test(value)).slice(0,100);
 const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const userId=claims?.claims?.sub;if(!userId)redirect('/login');const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',userId).single();if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');
 const {error}=await supabase.rpc('set_content_relations',{p_content_id:id,p_category_ids:categories,p_tag_ids:tags});if(error)redirect(`/admin/content/${id}/relations?error=save`);revalidatePath(`/admin/content/${id}`);revalidatePath(`/admin/content/${id}/relations`);redirect(`/admin/content/${id}/relations?ok=saved`);
}
