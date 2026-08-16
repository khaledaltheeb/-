'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function credentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) return null;
  return { email, password };
}
function safeNext(formData: FormData) {
  const value = String(formData.get('next') ?? '').trim().slice(0, 500);
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && value !== '/mfa' && !value.startsWith('/mfa?') ? value : '/account';
}

export async function login(formData: FormData) {
  const data = credentials(formData);
  const next = safeNext(formData);
  if (!data) redirect(`/login?error=invalid_input&next=${encodeURIComponent(next)}`);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) redirect(`/login?error=login_failed&next=${encodeURIComponent(next)}`);
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const factors = assurance.error ? null : await supabase.auth.mfa.listFactors();
  revalidatePath('/', 'layout');
  if (assurance.error || factors?.error) redirect(`/mfa?error=assurance_check&next=${encodeURIComponent(next)}`);
  const hasVerifiedTotp = (factors?.data.totp ?? []).some((factor) => factor.status === 'verified');
  if (hasVerifiedTotp && assurance.data.currentLevel !== 'aal2') redirect(`/mfa?next=${encodeURIComponent(next)}`);
  redirect(next);
}
