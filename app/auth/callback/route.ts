import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/account';
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNext(url.searchParams.get('next'));
  const destination = new URL(next, url.origin);

  if (!code) {
    destination.pathname = '/login';
    destination.search = '?error=missing_auth_code';
    return NextResponse.redirect(destination);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    destination.pathname = '/login';
    destination.search = '?error=auth_callback_failed';
    return NextResponse.redirect(destination);
  }

  return NextResponse.redirect(destination);
}
