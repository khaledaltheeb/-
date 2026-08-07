'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-f]{6}$/i;
const VISIBILITY = new Set(['public', 'authenticated', 'hidden']);

function text(formData: FormData, key: string, max = 200) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}

function list(formData: FormData, key: string, maxItems = 20) {
  return text(formData, key, 1000)
    .split(/[،,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function orderValue(formData: FormData) {
  const value = Number.parseInt(String(formData.get('sort_order') ?? '0'), 10);
  return Number.isFinite(value) ? Math.max(-9999, Math.min(9999, value)) : 0;
}

function activeValue(formData: FormData) {
  return formData.get('is_active') === 'on' || formData.get('is_active') === 'true';
}

function visibilityValue(formData: FormData) {
  const value = text(formData, 'visibility', 30);
  return VISIBILITY.has(value) ? value : 'public';
}

function taxonomyMeta(formData: FormData) {
  const seoTitle = text(formData, 'seo_title', 180) || null;
  const seoDescription = text(formData, 'seo_description', 500) || null;
  const iconKey = text(formData, 'icon_key', 80) || null;
  return {
    seo_title: seoTitle,
    seo_description: seoDescription,
    visibility: visibilityValue(formData),
    audience: list(formData, 'audience'),
    icon_key: iconKey,
  };
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role,is_active')
    .eq('id', userId)
    .single();

  if (!profile?.is_active || !['owner', 'admin'].includes(profile.role)) redirect('/account');
  return supabase;
}

function refresh(slug?: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/taxonomy');
  revalidatePath('/');
  revalidatePath('/sectors');
  revalidatePath('/sections');
  revalidatePath('/sitemap.xml');
  revalidatePath('/sitemaps/taxonomy.xml');
  if (slug) {
    revalidatePath(`/sectors/${slug}`);
    revalidatePath(`/sections/${slug}`);
  }
}

export async function createSector(formData: FormData) {
  const supabase = await requireAdmin();
  const slug = text(formData, 'slug', 100).toLowerCase();
  const nameAr = text(formData, 'name_ar', 160);
  const description = text(formData, 'description', 1200) || null;
  const accentRaw = text(formData, 'accent', 20);
  const accent = accentRaw && HEX_RE.test(accentRaw) ? accentRaw.toLowerCase() : null;

  if (!SLUG_RE.test(slug) || nameAr.length < 2) redirect('/admin/taxonomy?error=invalid-sector');

  const { error } = await supabase.from('sectors').insert({
    slug,
    name_ar: nameAr,
    description,
    accent,
    sort_order: orderValue(formData),
    is_active: activeValue(formData),
    ...taxonomyMeta(formData),
  });

  if (error) redirect('/admin/taxonomy?error=sector-write');
  refresh(slug);
  redirect('/admin/taxonomy?ok=sector-created');
}

export async function updateSector(formData: FormData) {
  const supabase = await requireAdmin();
  const id = text(formData, 'id', 50);
  const slug = text(formData, 'slug', 100).toLowerCase();
  const nameAr = text(formData, 'name_ar', 160);
  const description = text(formData, 'description', 1200) || null;
  const accentRaw = text(formData, 'accent', 20);
  const accent = accentRaw && HEX_RE.test(accentRaw) ? accentRaw.toLowerCase() : null;

  if (!UUID_RE.test(id) || !SLUG_RE.test(slug) || nameAr.length < 2) redirect('/admin/taxonomy?error=invalid-sector');

  const { error } = await supabase.from('sectors').update({
    slug,
    name_ar: nameAr,
    description,
    accent,
    sort_order: orderValue(formData),
    is_active: activeValue(formData),
    ...taxonomyMeta(formData),
  }).eq('id', id);

  if (error) redirect('/admin/taxonomy?error=sector-write');
  refresh(slug);
  redirect('/admin/taxonomy?ok=sector-updated');
}

export async function deleteSector(formData: FormData) {
  const supabase = await requireAdmin();
  const id = text(formData, 'id', 50);
  if (!UUID_RE.test(id)) redirect('/admin/taxonomy?error=invalid-sector');
  const { error } = await supabase.rpc('delete_sector_safe', { p_id: id });
  if (error) redirect('/admin/taxonomy?error=sector-not-empty');
  refresh();
  redirect('/admin/taxonomy?ok=sector-deleted');
}

export async function createCategory(formData: FormData) {
  const supabase = await requireAdmin();
  const sectorId = text(formData, 'sector_id', 50);
  const parentId = text(formData, 'parent_id', 50) || null;
  const slug = text(formData, 'slug', 100).toLowerCase();
  const nameAr = text(formData, 'name_ar', 160);
  const description = text(formData, 'description', 1200) || null;

  if (!UUID_RE.test(sectorId) || (parentId && !UUID_RE.test(parentId)) || !SLUG_RE.test(slug) || nameAr.length < 2) {
    redirect('/admin/taxonomy?error=invalid-category');
  }

  if (parentId) {
    const { data: parent } = await supabase.from('categories').select('sector_id').eq('id', parentId).single();
    if (!parent || parent.sector_id !== sectorId) redirect('/admin/taxonomy?error=parent-sector-mismatch');
  }

  const { error } = await supabase.from('categories').insert({
    sector_id: sectorId,
    parent_id: parentId,
    slug,
    name_ar: nameAr,
    description,
    sort_order: orderValue(formData),
    is_active: activeValue(formData),
    ...taxonomyMeta(formData),
  });

  if (error) redirect('/admin/taxonomy?error=category-write');
  refresh(slug);
  redirect('/admin/taxonomy?ok=category-created');
}

export async function updateCategory(formData: FormData) {
  const supabase = await requireAdmin();
  const id = text(formData, 'id', 50);
  const sectorId = text(formData, 'sector_id', 50);
  const parentId = text(formData, 'parent_id', 50) || null;
  const slug = text(formData, 'slug', 100).toLowerCase();
  const nameAr = text(formData, 'name_ar', 160);
  const description = text(formData, 'description', 1200) || null;

  if (!UUID_RE.test(id) || !UUID_RE.test(sectorId) || (parentId && !UUID_RE.test(parentId)) || !SLUG_RE.test(slug) || nameAr.length < 2 || parentId === id) {
    redirect('/admin/taxonomy?error=invalid-category');
  }

  if (parentId) {
    const { data: parent } = await supabase.from('categories').select('sector_id').eq('id', parentId).single();
    if (!parent || parent.sector_id !== sectorId) redirect('/admin/taxonomy?error=invalid-parent');
  }

  const { error } = await supabase.from('categories').update({
    sector_id: sectorId,
    parent_id: parentId,
    slug,
    name_ar: nameAr,
    description,
    sort_order: orderValue(formData),
    is_active: activeValue(formData),
    ...taxonomyMeta(formData),
  }).eq('id', id);

  if (error) redirect('/admin/taxonomy?error=category-write');
  refresh(slug);
  redirect('/admin/taxonomy?ok=category-updated');
}

export async function deleteCategory(formData: FormData) {
  const supabase = await requireAdmin();
  const id = text(formData, 'id', 50);
  if (!UUID_RE.test(id)) redirect('/admin/taxonomy?error=invalid-category');
  const { error } = await supabase.rpc('delete_category_safe', { p_id: id });
  if (error) redirect('/admin/taxonomy?error=category-not-empty');
  refresh();
  redirect('/admin/taxonomy?ok=category-deleted');
}
