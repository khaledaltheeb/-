'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const value=(fd:FormData,key:string,max:number)=>String(fd.get(key)??'').trim().slice(0,max);
async function adminClient(){const supabase=await createClient();const {data}=await supabase.auth.getClaims();const id=data?.claims?.sub;if(!id)redirect('/login?next=/admin/tags');const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',id).single();if(!profile?.is_active||!['owner','admin'].includes(profile.role))redirect('/account');return supabase;}
export async function upsertTag(formData:FormData){const supabase=await adminClient();const id=value(formData,'id',60);const slug=value(formData,'slug',140).toLowerCase();const name=value(formData,'name_ar',240);const description=value(formData,'description',1000);if((id&&!UUID_RE.test(id))||!SLUG_RE.test(slug)||name.length<2)redirect('/admin/tags?error=invalid');const {error}=await supabase.rpc('admin_upsert_tag',{p_id:id||null,p_slug:slug,p_name_ar:name,p_description:description||null,p_is_active:formData.get('is_active')==='on'});if(error)redirect('/admin/tags?error=save');revalidatePath('/admin/tags');redirect('/admin/tags?ok=saved');}
export async function deleteTag(formData:FormData){const supabase=await adminClient();const id=value(formData,'id',60);if(!UUID_RE.test(id))redirect('/admin/tags?error=invalid');const {error}=await supabase.rpc('admin_delete_tag_safe',{p_id:id});if(error)redirect('/admin/tags?error=in-use');revalidatePath('/admin/tags');redirect('/admin/tags?ok=deleted');}
