'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONTENT_TYPES = new Set([
  'article','guide','condition','research','comparison','tool','news','sector_page','landing_page',
  'assessment','intervention','protocol','course','learning_path','resource','calendar','glossary_term','faq','directory_page',
]);

function value(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}

function list(formData: FormData, key: string, maxItems = 40) {
  return value(formData, key, 3000)
    .split(/[،,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function optionalUuid(formData: FormData, key: string) {
  const raw = value(formData, key, 60);
  return raw && UUID_RE.test(raw) ? raw : null;
}

function canonical(formData: FormData) {
  const raw = value(formData, 'canonical_url', 500);
  if (!raw) return null;
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === 'https:' && parsed.hostname === 'healthrenewal.org') return parsed.toString();
  } catch {
    return null;
  }
  return null;
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');
  return supabase;
}

function payload(formData: FormData) {
  const contentType = value(formData, 'content_type', 60);
  const slug = value(formData, 'slug', 140).toLowerCase();
  const title = value(formData, 'title', 300);
  if (!CONTENT_TYPES.has(contentType) || !SLUG_RE.test(slug) || title.length < 3) return null;

  return {
    p_content_type: contentType,
    p_slug: slug,
    p_title: title,
    p_excerpt: value(formData, 'excerpt', 1200) || null,
    p_body_text: value(formData, 'body_text', 250000) || null,
    p_sector_id: optionalUuid(formData, 'sector_id'),
    p_category_id: optionalUuid(formData, 'category_id'),
    p_audience: list(formData, 'audience'),
    p_search_aliases: list(formData, 'search_aliases'),
    p_seo_title: value(formData, 'seo_title', 180) || null,
    p_seo_description: value(formData, 'seo_description', 500) || null,
    p_canonical_url: canonical(formData),
    p_robots_index: formData.get('robots_index') === 'on',
    p_robots_follow: formData.get('robots_follow') === 'on',
  };
}

function refresh(slug?: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/content');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/content/${slug}`);
}

export async function createDraft(formData: FormData) {
  const supabase = await requireAdmin();
  const data = payload(formData);
  if (!data) redirect('/admin/content/new?error=invalid-input');

  const { data: id, error } = await supabase.rpc('create_content_draft', data);
  if (error || !id) redirect('/admin/content/new?error=create-failed');
  refresh(data.p_slug);
  redirect(`/admin/content/${id}?ok=created`);
}

export async function updateDraft(formData: FormData) {
  const supabase = await requireAdmin();
  const id = value(formData, 'id', 60);
  const data = payload(formData);
  if (!UUID_RE.test(id) || !data) redirect('/admin/content?error=invalid-input');

  const { error } = await supabase.rpc('update_content_draft', { p_id: id, ...data });
  if (error) redirect(`/admin/content/${id}?error=update-failed`);
  refresh(data.p_slug);
  redirect(`/admin/content/${id}?ok=saved`);
}
