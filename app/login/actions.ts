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
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/account';
}

export async function login(formData: FormData) {
  const data = credentials(formData);
  const next = safeNext(formData);
  if (!data) redirect(`/login?error=invalid_input&next=${encodeURIComponent(next)}`);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) redirect(`/login?error=login_failed&next=${encodeURIComponent(next)}`);
  revalidatePath('/', 'layout');
  redirect(next);
}
