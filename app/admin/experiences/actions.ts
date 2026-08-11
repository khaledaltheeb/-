'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIONS=new Set(['approve','restrict','remove','restore','lock','unlock','seo_noindex','seo_index']);

async function requireModerator(){const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const id=claims?.claims?.sub;if(!id)redirect('/login?next=/admin/experiences');const {data:profile}=await supabase.from('profiles').select('role,is_active').eq('id',id).single();if(!profile?.is_active||!['owner','admin','editor','scientific_reviewer'].includes(profile.role))redirect('/account');return {supabase,id};}

export async function moderateExperience(formData:FormData){
 const {supabase,id}=await requireModerator();const postId=String(formData.get('post_id')??'');const slug=String(formData.get('slug')??'').trim();const action=String(formData.get('action')??'');const reason=String(formData.get('reason')??'').trim().slice(0,1500);
 if(!UUID_RE.test(postId)||!ACTIONS.has(action))redirect('/admin/experiences?error=invalid');
 const patch:Record<string,unknown>={};
 if(action==='approve')Object.assign(patch,{status:'published',moderation_state:'clean',moderation_note:reason||null,published_at:new Date().toISOString()});
 if(action==='restrict')Object.assign(patch,{moderation_state:'restricted',seo_indexable:false,moderation_note:reason||null});
 if(action==='remove')Object.assign(patch,{status:'removed',moderation_state:'removed',seo_indexable:false,moderation_note:reason||null});
 if(action==='restore')Object.assign(patch,{status:'published',moderation_state:'clean',moderation_note:reason||null});
 if(action==='lock')patch.comments_locked=true;if(action==='unlock')patch.comments_locked=false;if(action==='seo_noindex')patch.seo_indexable=false;if(action==='seo_index')patch.seo_indexable=true;
 const {error}=await supabase.from('community_posts').update(patch).eq('id',postId);if(error)redirect('/admin/experiences?error=update');
 await supabase.from('community_moderation_events').insert({actor_id:id,post_id:postId,action,reason:reason||null});
 revalidatePath('/admin/experiences');revalidatePath('/experiences');if(slug)revalidatePath(`/experiences/${slug}/`);redirect('/admin/experiences?ok=1');
}

export async function resolveExperienceReport(formData:FormData){
 const {supabase,id}=await requireModerator();const reportId=String(formData.get('report_id')??'');const status=String(formData.get('status')??'');const note=String(formData.get('resolution_note')??'').trim().slice(0,1500);
 if(!UUID_RE.test(reportId)||!['reviewing','resolved','dismissed'].includes(status))redirect('/admin/experiences?error=invalid-report');
 const {error}=await supabase.from('community_reports').update({status,resolution_note:note||null,reviewed_by:id,reviewed_at:new Date().toISOString()}).eq('id',reportId);if(error)redirect('/admin/experiences?error=report-update');revalidatePath('/admin/experiences');redirect('/admin/experiences?ok=report');
}
