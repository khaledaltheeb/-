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
const WORKFLOW_TARGETS = new Set(['draft','scientific_review','editorial_review','seo_review','accessibility_review','approved','published','archived']);
const BLOCK_TYPES = new Set(['paragraph','heading','list','quote','callout','table','resource','divider']);
const CALLOUT_TONES = new Set(['info','success','warning','danger']);

type JsonRecord = Record<string, unknown>;
type CleanBlock = Record<string, unknown>;

function value(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}
function list(formData: FormData, key: string, maxItems = 40) {
  return value(formData, key, 3000).split(/[،,\n]/).map((item) => item.trim()).filter(Boolean).slice(0, maxItems);
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
  } catch { return null; }
  return null;
}
function object(value: unknown): JsonRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}
function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
function strings(value: unknown, maxItems: number, maxLength: number) {
  return Array.isArray(value) ? value.slice(0, maxItems).map((item) => text(item, maxLength)).filter(Boolean) : [];
}
function sanitizeBody(formData: FormData) {
  const raw = String(formData.get('body_json') ?? '');
  if (!raw || raw.length > 1_000_000) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return null; }
  const root = object(parsed);
  if (!root || !Array.isArray(root.blocks) || root.blocks.length > 500) return null;

  const blocks: CleanBlock[] = [];
  const searchable: string[] = [];
  for (const entry of root.blocks) {
    const block = object(entry); if (!block) continue;
    const type = text(block.type, 30); if (!BLOCK_TYPES.has(type)) continue;

    if (type === 'paragraph') {
      const body = text(block.text, 20000); blocks.push({ type, text: body }); if (body) searchable.push(body); continue;
    }
    if (type === 'heading') {
      const body = text(block.text, 500); const level = [2,3,4].includes(Number(block.level)) ? Number(block.level) : 2;
      blocks.push({ type, level, text: body }); if (body) searchable.push(body); continue;
    }
    if (type === 'list') {
      const items = strings(block.items, 100, 1000); blocks.push({ type, ordered: block.ordered === true, items }); searchable.push(...items); continue;
    }
    if (type === 'quote') {
      const body = text(block.text, 5000); const cite = text(block.cite, 500); blocks.push({ type, text: body, cite }); if (body) searchable.push(body); if (cite) searchable.push(cite); continue;
    }
    if (type === 'callout') {
      const title = text(block.title, 300); const body = text(block.text, 7000); const toneRaw = text(block.tone, 20); const tone = CALLOUT_TONES.has(toneRaw) ? toneRaw : 'info';
      blocks.push({ type, tone, title, text: body }); if (title) searchable.push(title); if (body) searchable.push(body); continue;
    }
    if (type === 'table') {
      const caption = text(block.caption, 300); const headers = strings(block.headers, 12, 300);
      const rows = Array.isArray(block.rows) ? block.rows.slice(0,100).map((row) => strings(row,12,1000)).filter((row) => row.length) : [];
      blocks.push({ type, caption, headers, rows }); if (caption) searchable.push(caption); searchable.push(...headers,...rows.flat()); continue;
    }
    if (type === 'resource') {
      const label = text(block.label, 500); const description = text(block.description, 2000); const urlRaw = text(block.url, 2000); const url = /^https:\/\//i.test(urlRaw) ? urlRaw : '';
      if (!label || !url) continue;
      blocks.push({ type, label, url, description }); searchable.push(label); if (description) searchable.push(description); continue;
    }
    blocks.push({ type: 'divider' });
  }

  if (!blocks.length) blocks.push({ type: 'paragraph', text: '' });
  return {
    json: { version: 2, format: 'blocks', blocks },
    text: searchable.join('\n\n').slice(0, 250000) || null,
  };
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
  const structuredBody = sanitizeBody(formData);
  if (!CONTENT_TYPES.has(contentType) || !SLUG_RE.test(slug) || title.length < 3 || !structuredBody) return null;
  const seoTitle = value(formData, 'seo_title', 47);
  const seoDescription = value(formData, 'seo_description', 160);
  if (seoDescription && seoDescription.length < 150) return null;

  return {
    p_content_type: contentType,
    p_slug: slug,
    p_title: title,
    p_body_json: structuredBody.json,
    p_excerpt: value(formData, 'excerpt', 1200) || null,
    p_body_text: structuredBody.text,
    p_sector_id: optionalUuid(formData, 'sector_id'),
    p_category_id: optionalUuid(formData, 'category_id'),
    p_audience: list(formData, 'audience'),
    p_search_aliases: list(formData, 'search_aliases'),
    p_seo_title: seoTitle || null,
    p_seo_description: seoDescription || null,
    p_canonical_url: canonical(formData),
    p_robots_index: formData.get('robots_index') === 'on',
    p_robots_follow: formData.get('robots_follow') === 'on',
  };
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
  const data = payload(formData);
  if (!data) redirect('/admin/content/new?error=invalid-input');
  const { data: id, error } = await supabase.rpc('create_content_draft_v3', data);
  if (error || !id) redirect('/admin/content/new?error=create-failed');
  refresh(data.p_slug);
  redirect(`/admin/content/${id}?ok=created`);
}

export async function updateDraft(formData: FormData) {
  const supabase = await requireAdmin();
  const id = value(formData, 'id', 60);
  const data = payload(formData);
  if (!UUID_RE.test(id) || !data) redirect('/admin/content?error=invalid-input');
  const { error } = await supabase.rpc('update_content_draft_v3', { p_id: id, ...data });
  if (error) redirect(`/admin/content/${id}?error=update-failed`);
  refresh(data.p_slug);
  redirect(`/admin/content/${id}?ok=saved`);
}

export async function transitionStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = value(formData, 'id', 60);
  const target = value(formData, 'target', 40);
  const slug = value(formData, 'slug', 140);
  if (!UUID_RE.test(id) || !WORKFLOW_TARGETS.has(target)) redirect('/admin/content?error=invalid-transition');
  const { error } = await supabase.rpc('transition_content_status', { p_id: id, p_target: target });
  if (error) redirect(`/admin/content/${id}?error=transition-failed`);
  refresh(slug || undefined);
  redirect(`/admin/content/${id}?ok=transitioned`);
}
