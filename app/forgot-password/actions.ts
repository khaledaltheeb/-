'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PRODUCTION_SITE_URL } from '@/lib/seo';

function normalizedEmail(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  const requestHeaders = await headers();
  const origin = requestHeaders.get('origin');
  if (origin) return origin.replace(/\/$/, '');
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  const proto = requestHeaders.get('x-forwarded-proto') || 'https';
  return host ? `${proto}://${host}` : PRODUCTION_SITE_URL;
}

export async function requestPasswordReset(formData: FormData) {
  const email = normalizedEmail(formData);
  if (!email) redirect('/forgot-password?error=invalid_email');

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
  });

  if (error) redirect('/forgot-password?status=sent');
  redirect('/forgot-password?status=sent');
}
