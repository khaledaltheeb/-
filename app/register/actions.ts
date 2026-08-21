'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function safeNext(formData: FormData) {
  const value = String(formData.get('next') ?? '').trim().slice(0, 500);
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/account';
}

async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  const requestHeaders = await headers();
  const origin = requestHeaders.get('origin');
  if (origin) return origin.replace(/\/$/, '');
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  const proto = requestHeaders.get('x-forwarded-proto') || 'https';
  return host ? `${proto}://${host}` : 'https://rawafid-platform-staging.khaledaltheeb.workers.dev';
}

export async function register(formData: FormData) {
  const fullName = String(formData.get('full_name') ?? '').trim().replace(/\s+/g, ' ').slice(0, 160);
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirm_password') ?? '');
  const next = safeNext(formData);

  if (fullName.length < 2 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(`/register?error=invalid_input&next=${encodeURIComponent(next)}`);
  }
  if (password.length < 10 || password.length > 128) {
    redirect(`/register?error=password_length&next=${encodeURIComponent(next)}`);
  }
  if (password !== confirmPassword) {
    redirect(`/register?error=password_mismatch&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  // Keep the public response intentionally generic so registration cannot be used as an account-enumeration oracle.
  if (error) redirect(`/register?status=check_email&next=${encodeURIComponent(next)}`);
  redirect(`/register?status=check_email&next=${encodeURIComponent(next)}`);
}
