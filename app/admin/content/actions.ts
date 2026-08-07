'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buildContentPayload, field, validUuid } from '@/lib/content-editor-payload';

const WORKFLOW_TARGETS = new Set(['draft','scientific_review','editorial_review','seo_review','accessibility_review','approved','published','archived']);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');
  return supabase;
}

function refresh(slug?: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/content');
  revalidatePath('/sitemap.xml');
  revalidatePath('/sitemaps/content.xml');
  if (slug) revalidatePath(`/content/${slug}`);
}

export async function createDraft(formData: FormData) {
  const supabase = await requireAdmin();
  const data = buildContentPayload(formData);
  if (!data) redirect('/admin/content/new?error=invalid-input');
  const { data: id, error } = await supabase.rpc('create_content_draft_v3', data);
  if (error || !id) redirect('/admin/content/new?error=create-failed');
  refresh(data.p_slug);
  redirect(`/admin/content/${id}?ok=created`);
}

export async function updateDraft(formData: FormData) {
  const supabase = await requireAdmin();
  const id = field(formData, 'id', 60);
  const data = buildContentPayload(formData);
  if (!validUuid(id) || !data) redirect('/admin/content?error=invalid-input');
  const { error } = await supabase.rpc('update_content_draft_v3', { p_id: id, ...data });
  if (error) redirect(`/admin/content/${id}?error=update-failed`);
  refresh(data.p_slug);
  redirect(`/admin/content/${id}?ok=saved`);
}

export async function transitionStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = field(formData, 'id', 60);
  const target = field(formData, 'target', 40);
  const slug = field(formData, 'slug', 140);
  if (!validUuid(id) || !WORKFLOW_TARGETS.has(target)) redirect('/admin/content?error=invalid-transition');
  const { error } = await supabase.rpc('transition_content_status', { p_id: id, p_target: target });
  if (error) redirect(`/admin/content/${id}?error=transition-failed`);
  refresh(slug || undefined);
  redirect(`/admin/content/${id}?ok=transitioned`);
}
