'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function credentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || email.length > 254 || password.length < 8 || password.length > 128) return null;
  return { email, password };
}

export async function login(formData: FormData) {
  const data = credentials(formData);
  if (!data) redirect('/login?error=invalid_input');
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) redirect('/login?error=login_failed');
  revalidatePath('/', 'layout');
  redirect('/account');
}

export async function signup(formData: FormData) {
  const data = credentials(formData);
  if (!data) redirect('/login?error=invalid_input');
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(data);
  if (error) redirect('/login?error=signup_failed');
  revalidatePath('/', 'layout');
  redirect('/login?status=check_email');
}
