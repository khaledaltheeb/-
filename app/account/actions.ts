'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}

export async function updateMyProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');

  const displayName = text(formData, 'display_name', 160);
  const phone = text(formData, 'phone', 80);
  const locale = text(formData, 'locale', 10).toLowerCase();
  if (!['ar', 'en'].includes(locale)) redirect('/account?error=invalid-locale');

  const { error } = await supabase.rpc('update_my_profile', {
    p_display_name: displayName || null,
    p_phone: phone || null,
    p_locale: locale,
  });
  if (error) redirect('/account?error=save-failed');

  revalidatePath('/account');
  revalidatePath('/admin');
  redirect('/account?ok=saved');
}
