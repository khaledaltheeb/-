import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('api_public_stats');
  if (error) return apiError(request, 503, 'stats_unavailable', 'Public API statistics are temporarily unavailable.');
  const latest = data && typeof data === 'object' && 'latest_updated_at' in data ? String((data as Record<string, unknown>).latest_updated_at || '') : null;
  return jsonResponse(request, {
    data,
    meta: { api_version: PUBLIC_API_VERSION, generated_at: new Date().toISOString() },
  }, { cacheControl: 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600', lastModified: latest || null });
}

export const OPTIONS = optionsResponse;
