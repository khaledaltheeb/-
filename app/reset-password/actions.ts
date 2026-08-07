'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirm_password') ?? '');

  if (password.length < 10 || password.length > 128) redirect('/reset-password?error=password_length');
  if (password !== confirmPassword) redirect('/reset-password?error=password_mismatch');

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect('/forgot-password?error=session_expired');

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect('/reset-password?error=update_failed');

  revalidatePath('/', 'layout');
  redirect('/login?status=password_updated');
}
