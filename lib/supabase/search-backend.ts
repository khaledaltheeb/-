import 'server-only';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

function resolveBackendSecret(): string | null {
  const direct = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (direct) return direct;

  const packed = process.env.SUPABASE_SECRET_KEYS;
  if (!packed) return null;
  try {
    const parsed = JSON.parse(packed) as Record<string, unknown>;
    return typeof parsed.default === 'string' && parsed.default ? parsed.default : null;
  } catch {
    return null;
  }
}

let cached: SupabaseClient | null | undefined;

export function createSearchBackendClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const secret = resolveBackendSecret();
  if (!url || !secret) {
    cached = null;
    return null;
  }

  cached = createSupabaseClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { 'x-rawafid-component': 'next-search-backend-v3' } },
  });
  return cached;
}
