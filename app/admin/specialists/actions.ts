'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(['unverified','pending','verified','rejected','suspended']);

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}
function list(formData: FormData, key: string, maxItems = 30) {
  return text(formData, key, 1800).split(/[،,\n]/).map((value) => value.trim()).filter(Boolean).slice(0, maxItems);
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

export async function createSpecialist(formData: FormData) {
  const supabase = await requireAdmin();
  const linkedUserId = text(formData, 'user_id', 60);
  if (linkedUserId && !UUID_RE.test(linkedUserId)) redirect('/admin/specialists?error=invalid-user');
  const experienceRaw = text(formData, 'years_experience', 3);
  const experience = experienceRaw ? Number(experienceRaw) : null;
  if (experience !== null && (!Number.isInteger(experience) || experience < 0 || experience > 80)) redirect('/admin/specialists?error=invalid-experience');

  const { error } = await supabase.rpc('admin_create_specialist', {
    p_user_id: linkedUserId || null,
    p_slug: text(formData, 'slug', 140),
    p_full_name: text(formData, 'full_name', 200),
    p_professional_title: text(formData, 'professional_title', 220) || null,
    p_bio: text(formData, 'bio', 5000) || null,
    p_email: text(formData, 'email', 254) || null,
    p_phone: text(formData, 'phone', 60) || null,
    p_website_url: text(formData, 'website_url', 500) || null,
    p_country: text(formData, 'country', 120) || null,
    p_region: text(formData, 'region', 120) || null,
    p_city: text(formData, 'city', 120) || null,
    p_languages: list(formData, 'languages'),
    p_specialties: list(formData, 'specialties'),
    p_qualifications: list(formData, 'qualifications'),
    p_license_number: text(formData, 'license_number', 180) || null,
    p_years_experience: experience,
    p_offers_remote: formData.get('offers_remote') === 'on',
    p_offers_in_person: formData.get('offers_in_person') === 'on',
  });
  if (error) redirect('/admin/specialists?error=create-failed');

  revalidatePath('/admin');
  revalidatePath('/admin/specialists');
  revalidatePath('/specialists');
  redirect('/admin/specialists?ok=created');
}

export async function setSpecialistStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = text(formData, 'id', 60);
  const slug = text(formData, 'slug', 140);
  const status = text(formData, 'status', 30);
  const active = formData.get('is_active') === 'on';
  if (!UUID_RE.test(id) || !STATUSES.has(status)) redirect('/admin/specialists?error=invalid-input');

  const { error } = await supabase.rpc('set_specialist_verification', {
    p_id: id,
    p_status: status,
    p_is_active: active,
  });
  if (error) redirect('/admin/specialists?error=update-failed');

  revalidatePath('/admin');
  revalidatePath('/admin/specialists');
  revalidatePath('/specialists');
  if (slug) revalidatePath(`/specialists/${slug}`);
  revalidatePath('/sitemap.xml');
  redirect('/admin/specialists?ok=updated');
}
