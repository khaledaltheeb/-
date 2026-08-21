'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buildContentPayload, field, validUuid } from '@/lib/content-editor-payload';

const WORKFLOW_TARGETS = new Set(['draft','scientific_review','editorial_review','seo_review','accessibility_review','approved','scheduled','published','archived']);
const CONTENT_STAFF = new Set(['owner','admin','editor','scientific_reviewer','seo_manager']);
const CONTENT_EDITORS = new Set(['owner','admin','editor']);

async function requireRoleSet(roles: Set<string>) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !roles.has(profile.role)) redirect('/account');
  return supabase;
}
async function requireAdmin() { return requireRoleSet(new Set(['owner','admin'])); }
async function requireContentStaff() { return requireRoleSet(CONTENT_STAFF); }
async function requireContentEditor() { return requireRoleSet(CONTENT_EDITORS); }
function refresh(slug?: string) { revalidatePath('/admin'); revalidatePath('/admin/content'); revalidatePath('/admin/seo'); revalidatePath('/sitemap.xml'); revalidatePath('/sitemaps/content.xml'); if (slug) revalidatePath(`/content/${slug}`); }

export async function createDraft(formData: FormData) {
  const supabase = await requireContentEditor(); const data = buildContentPayload(formData); if (!data) redirect('/admin/content/new?error=invalid-input');
  const { data: id, error } = await supabase.rpc('create_content_draft_v4', data); if (error || !id) redirect('/admin/content/new?error=create-failed'); refresh(data.p_slug); redirect(`/admin/content/${id}?ok=created`);
}
export async function updateDraft(formData: FormData) {
  const supabase = await requireContentEditor(); const id = field(formData, 'id', 60); const data = buildContentPayload(formData); if (!validUuid(id) || !data) redirect('/admin/content?error=invalid-input');
  const { error } = await supabase.rpc('update_content_draft_v4', { p_id: id, ...data }); if (error) redirect(`/admin/content/${id}?error=update-failed`); refresh(data.p_slug); redirect(`/admin/content/${id}?ok=saved`);
}
export async function transitionStatus(formData: FormData) {
  const supabase = await requireContentStaff(); const id = field(formData, 'id', 60); const target = field(formData, 'target', 40); const slug = field(formData, 'slug', 140);
  if (!validUuid(id) || !WORKFLOW_TARGETS.has(target) || target==='scheduled' || target==='published') redirect('/admin/content?error=invalid-transition');
  const { error } = await supabase.rpc('transition_content_status', { p_id: id, p_target: target }); if (error) redirect(`/admin/content/${id}?error=transition-failed`); refresh(slug || undefined); redirect(`/admin/content/${id}?ok=transitioned`);
}
export async function scheduleContent(formData: FormData) {
  const supabase=await requireAdmin(); const id=field(formData,'id',60); const slug=field(formData,'slug',140); const raw=field(formData,'scheduled_at',80);
  const date=new Date(raw); if(!validUuid(id)||!raw||Number.isNaN(date.getTime())||date.getTime()<=Date.now()+30_000) redirect(`/admin/content/${id}?error=invalid-schedule`);
  const {error}=await supabase.rpc('schedule_content',{p_id:id,p_scheduled_at:date.toISOString()}); if(error)redirect(`/admin/content/${id}?error=schedule-failed`); refresh(slug||undefined); redirect(`/admin/content/${id}?ok=scheduled`);
}
export async function restoreVersion(formData:FormData){
  const supabase=await requireAdmin(); const id=field(formData,'id',60); const slug=field(formData,'slug',140); const version=Number(field(formData,'version',20));
  if(!validUuid(id)||!Number.isInteger(version)||version<1)redirect(`/admin/content/${id}?error=invalid-version`);
  const {error}=await supabase.rpc('restore_content_version',{p_content_id:id,p_version:version}); if(error)redirect(`/admin/content/${id}?error=restore-failed`); refresh(slug||undefined); redirect(`/admin/content/${id}?ok=restored`);
}
export async function deleteDraft(formData: FormData) {
  const supabase = await requireAdmin(); const id = field(formData, 'id', 60); if (!validUuid(id)) redirect('/admin/content?error=invalid-input');
  const { error } = await supabase.rpc('delete_content_draft', { p_id: id }); if (error) redirect(`/admin/content/${id}?error=delete-failed`); refresh(); redirect('/admin/content?ok=deleted');
}
