'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function field(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}
function list(formData: FormData, key: string, maxItems = 20) {
  return field(formData, key, 1200).split(/[،,\n]/).map((v) => v.trim()).filter(Boolean).slice(0, maxItems);
}

export async function saveCommunityApplication(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect('/login?next=/community/join');

  const memberType = field(formData, 'member_type', 20);
  if (!['trainee', 'volunteer'].includes(memberType)) redirect('/community/join?error=invalid_type');

  const payload = {
    p_slug: field(formData, 'slug', 140),
    p_member_type: memberType,
    p_full_name: field(formData, 'full_name', 200),
    p_headline: field(formData, 'headline', 220) || null,
    p_bio: field(formData, 'bio', 3000) || null,
    p_country: field(formData, 'country', 120) || null,
    p_region: field(formData, 'region', 120) || null,
    p_city: field(formData, 'city', 120) || null,
    p_training_institution: field(formData, 'training_institution', 240) || null,
    p_supervisor_name: field(formData, 'supervisor_name', 200) || null,
    p_organization: field(formData, 'organization', 240) || null,
    p_skills: list(formData, 'skills'),
    p_interests: list(formData, 'interests'),
    p_availability: field(formData, 'availability', 300) || null,
  };

  if (!payload.p_slug || !payload.p_full_name) redirect('/community/join?error=required');
  const { error } = await supabase.rpc('upsert_my_community_profile', payload);
  if (error) redirect('/community/join?error=save_failed');

  revalidatePath('/community');
  revalidatePath('/community/join');
  redirect('/community/join?ok=submitted');
}
