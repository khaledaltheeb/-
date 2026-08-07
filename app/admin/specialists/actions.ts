'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(['unverified','pending','verified','rejected','suspended']);

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}

export async function setSpecialistStatus(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner','admin'].includes(profile.role)) redirect('/account');

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
