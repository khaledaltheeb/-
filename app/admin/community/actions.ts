'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(['unverified','pending','verified','rejected','suspended']);

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}
function list(formData: FormData, key: string) {
  return text(formData, key, 1200).split(/[،,\n]/).map((value) => value.trim()).filter(Boolean).slice(0, 20);
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner','admin'].includes(profile.role)) redirect('/account');
  return supabase;
}

export async function createCommunityMember(formData: FormData) {
  const supabase = await requireAdmin();
  const memberType = text(formData, 'member_type', 20);
  if (!['trainee','volunteer'].includes(memberType)) redirect('/admin/community?error=invalid-input');
  const userId = text(formData, 'user_id', 60);
  if (userId && !UUID_RE.test(userId)) redirect('/admin/community?error=invalid-user');

  const { error } = await supabase.rpc('admin_upsert_community_profile', {
    p_id: null,
    p_user_id: userId || null,
    p_slug: text(formData, 'slug', 140),
    p_member_type: memberType,
    p_full_name: text(formData, 'full_name', 200),
    p_headline: text(formData, 'headline', 220) || null,
    p_bio: text(formData, 'bio', 3000) || null,
    p_country: text(formData, 'country', 120) || null,
    p_region: text(formData, 'region', 120) || null,
    p_city: text(formData, 'city', 120) || null,
    p_training_institution: text(formData, 'training_institution', 240) || null,
    p_supervisor_name: text(formData, 'supervisor_name', 200) || null,
    p_organization: text(formData, 'organization', 240) || null,
    p_skills: list(formData, 'skills'),
    p_interests: list(formData, 'interests'),
    p_availability: text(formData, 'availability', 300) || null,
  });
  if (error) redirect('/admin/community?error=create-failed');
  revalidatePath('/admin/community');
  revalidatePath('/community');
  redirect('/admin/community?ok=created');
}

export async function setCommunityStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = text(formData, 'id', 60);
  const slug = text(formData, 'slug', 140);
  const status = text(formData, 'status', 30);
  const active = formData.get('is_active') === 'on';
  if (!UUID_RE.test(id) || !STATUSES.has(status)) redirect('/admin/community?error=invalid-input');
  const { error } = await supabase.rpc('set_community_verification', { p_id: id, p_status: status, p_is_active: active });
  if (error) redirect('/admin/community?error=update-failed');
  revalidatePath('/admin/community');
  revalidatePath('/community');
  if (slug) revalidatePath(`/community/${slug}`);
  redirect('/admin/community?ok=updated');
}
