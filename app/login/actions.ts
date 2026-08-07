'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function credentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) return null;
  return { email, password };
}

async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  const requestHeaders = await headers();
  const origin = requestHeaders.get('origin');
  if (origin) return origin.replace(/\/$/, '');
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  const proto = requestHeaders.get('x-forwarded-proto') || 'https';
  return host ? `${proto}://${host}` : 'https://healthrenewal.org';
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
  const origin = await siteOrigin();
  const { error } = await supabase.auth.signUp({
    ...data,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/account')}` },
  });
  if (error) redirect('/login?error=signup_failed');
  revalidatePath('/', 'layout');
  redirect('/login?status=check_email');
}
