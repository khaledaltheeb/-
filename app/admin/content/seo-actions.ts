'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTENTS = new Set(['informational','transactional','navigational','commercial','local']);
const SOURCE_TYPES = new Set(['official-definition','guideline','systematic-review','primary-research','consensus','institutional','book']);
const AUTHORITY_TIERS = new Set(['primary','authoritative','scholarly']);

function field(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}
function list(formData: FormData, key: string, maxItems = 50) {
  return field(formData, key, 4000).split(/[،,\n]/).map((value) => value.trim()).filter(Boolean).slice(0, maxItems);
}
function parseReferences(raw: string) {
  return raw.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 100).flatMap((line, index) => {
    const parts = line.split('|').map((part) => part?.trim() || '');
    const expanded = parts.length >= 5;
    const [idRaw, titleRaw, urlRaw, publisherRaw, yearRaw, sourceTypeRaw, authorityTierRaw, isbnRaw] = expanded
      ? parts
      : [`ref-${index + 1}`, parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', 'institutional', 'authoritative', ''];
    if (!titleRaw && !urlRaw && !isbnRaw) return [];
    const url = /^https:\/\//i.test(urlRaw) ? urlRaw.slice(0, 1000) : undefined;
    const source_type = SOURCE_TYPES.has(sourceTypeRaw) ? sourceTypeRaw : 'institutional';
    const authority_tier = AUTHORITY_TIERS.has(authorityTierRaw) ? authorityTierRaw : 'authoritative';
    return [{
      id: idRaw.slice(0, 120) || `ref-${index + 1}`,
      title: titleRaw.slice(0, 400) || undefined,
      url,
      publisher: publisherRaw.slice(0, 240) || undefined,
      year: yearRaw.slice(0, 20) || undefined,
      source_type,
      authority_tier,
      isbn: isbnRaw.replace(/[-\s]/g, '').slice(0, 20) || undefined,
    }];
  });
}

export async function updateSeoAuthority(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner','admin','editor','scientific_reviewer','seo_manager'].includes(profile.role)) redirect('/account');

  const id = field(formData, 'id', 60);
  const slug = field(formData, 'slug', 140);
  if (!UUID_RE.test(id)) redirect('/admin/content?error=invalid-input');
  const intent = field(formData, 'search_intent', 30);
  if (intent && !INTENTS.has(intent)) redirect(`/admin/content/${id}?error=invalid-seo-intent`);
  const reviewedAtRaw = field(formData, 'last_reviewed_at', 40);
  const reviewedDate = reviewedAtRaw ? new Date(reviewedAtRaw) : null;
  if (reviewedDate && Number.isNaN(reviewedDate.getTime())) redirect(`/admin/content/${id}?error=invalid-review-date`);

  const references = parseReferences(field(formData, 'references', 30000));
  const { error } = await supabase.rpc('set_content_seo_authority', {
    p_id: id,
    p_primary_keyword: field(formData, 'primary_keyword', 250) || null,
    p_secondary_keywords: list(formData, 'secondary_keywords'),
    p_semantic_terms: list(formData, 'semantic_terms'),
    p_search_intent: intent || null,
    p_author_display_name: field(formData, 'author_display_name', 200) || null,
    p_reviewer_display_name: field(formData, 'reviewer_display_name', 200) || null,
    p_reviewer_credentials: field(formData, 'reviewer_credentials', 300) || null,
    p_last_reviewed_at: reviewedDate ? reviewedDate.toISOString() : null,
    p_references: references,
    p_medical_disclaimer: null,
    p_featured_image_alt: field(formData, 'featured_image_alt', 500) || null,
  });
  if (error) redirect(`/admin/content/${id}?error=seo-authority-update-failed`);

  revalidatePath(`/admin/content/${id}`);
  if (slug) revalidatePath(`/content/${slug}`);
  redirect(`/admin/content/${id}?ok=seo-authority-saved`);
}
