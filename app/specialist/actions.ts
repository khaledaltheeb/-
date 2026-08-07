'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}

function list(formData: FormData, key: string, maxItems = 40) {
  return text(formData, key, 5000)
    .split(/[،,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function optionalNumber(formData: FormData, key: string, min: number, max: number) {
  const raw = text(formData, key, 40);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function optionalInteger(formData: FormData, key: string, min: number, max: number) {
  const raw = text(formData, key, 20);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function safeWebsite(formData: FormData) {
  const raw = text(formData, 'website_url', 500);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function saveSpecialistProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || profile.role !== 'specialist') redirect('/account');

  const slug = text(formData, 'slug', 140).toLowerCase();
  const fullName = text(formData, 'full_name', 200);
  if (!SLUG_RE.test(slug) || fullName.length < 3) redirect('/specialist?error=invalid-input');

  const email = text(formData, 'email', 254) || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect('/specialist?error=invalid-email');

  const websiteRaw = text(formData, 'website_url', 500);
  const website = safeWebsite(formData);
  if (websiteRaw && !website) redirect('/specialist?error=invalid-website');

  const latitudeRaw = text(formData, 'latitude', 40);
  const longitudeRaw = text(formData, 'longitude', 40);
  const latitude = optionalNumber(formData, 'latitude', -90, 90);
  const longitude = optionalNumber(formData, 'longitude', -180, 180);
  if ((latitudeRaw && latitude === null) || (longitudeRaw && longitude === null)) redirect('/specialist?error=invalid-location');

  const experienceRaw = text(formData, 'years_experience', 20);
  const experience = optionalInteger(formData, 'years_experience', 0, 80);
  if (experienceRaw && experience === null) redirect('/specialist?error=invalid-experience');

  const { error } = await supabase.rpc('upsert_my_specialist_profile', {
    p_slug: slug,
    p_full_name: fullName,
    p_professional_title: text(formData, 'professional_title', 240) || null,
    p_bio: text(formData, 'bio', 10000) || null,
    p_email: email,
    p_phone: text(formData, 'phone', 80) || null,
    p_website_url: website,
    p_country: text(formData, 'country', 120) || null,
    p_region: text(formData, 'region', 120) || null,
    p_city: text(formData, 'city', 120) || null,
    p_latitude: latitude,
    p_longitude: longitude,
    p_languages: list(formData, 'languages'),
    p_specialties: list(formData, 'specialties'),
    p_qualifications: text(formData, 'qualifications', 12000).split('\n').map((item) => item.trim()).filter(Boolean).slice(0, 30),
    p_license_number: text(formData, 'license_number', 160) || null,
    p_years_experience: experience,
    p_offers_remote: formData.get('offers_remote') === 'on',
    p_offers_in_person: formData.get('offers_in_person') === 'on',
    p_show_email: formData.get('show_email') === 'on',
    p_show_phone: formData.get('show_phone') === 'on',
    p_show_map: formData.get('show_map') === 'on',
  });

  if (error) redirect('/specialist?error=save-failed');
  revalidatePath('/specialist');
  revalidatePath('/specialists');
  revalidatePath(`/specialists/${slug}`);
  revalidatePath('/sitemap.xml');
  redirect('/specialist?ok=saved');
}
