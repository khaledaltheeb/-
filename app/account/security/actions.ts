'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function changePassword(formData: FormData) {
  const currentPassword = String(formData.get('current_password') ?? '');
  const newPassword = String(formData.get('new_password') ?? '');
  const confirmPassword = String(formData.get('confirm_password') ?? '');

  if (currentPassword.length < 8 || currentPassword.length > 128) redirect('/account/security?error=current_password');
  if (newPassword.length < 10 || newPassword.length > 128) redirect('/account/security?error=password_length');
  if (newPassword !== confirmPassword) redirect('/account/security?error=password_mismatch');
  if (currentPassword === newPassword) redirect('/account/security?error=password_reuse');

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const email = userData.user?.email;
  if (userError || !email) redirect('/login?next=/account/security');

  const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (reauthError) redirect('/account/security?error=current_password');

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) redirect('/account/security?error=update_failed');

  revalidatePath('/', 'layout');
  redirect('/account/security?ok=password_updated');
}
