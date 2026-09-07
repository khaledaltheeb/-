import 'server-only';
import { ExternalServiceError } from '@/lib/research-integrations/http';
import { createSearchBackendClient } from '@/lib/supabase/search-backend';

export type LensQuotaWindow = {
  limit: number;
  remaining: number;
  reset_at: string;
};

export type LensQuotaState = {
  allowed: boolean;
  reason?: 'minute_limit' | 'month_limit' | string;
  minute?: LensQuotaWindow;
  month?: LensQuotaWindow;
};

function validWindow(value: unknown): value is LensQuotaWindow {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return Number.isInteger(row.limit)
    && Number.isInteger(row.remaining)
    && typeof row.reset_at === 'string'
    && Boolean(row.reset_at);
}

export async function acquireLensScholarlyQuota(): Promise<LensQuotaState> {
  const client = createSearchBackendClient();
  if (!client) {
    throw new ExternalServiceError('Lens Scholarly API', 'Lens quota guard is unavailable.', 503, true);
  }

  const { data, error } = await client.rpc('acquire_lens_scholarly_quota');
  if (error || !data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ExternalServiceError('Lens Scholarly API', 'Lens quota guard failed closed.', 503, true);
  }

  const state = data as unknown as LensQuotaState;
  if (state.allowed !== true) {
    throw new ExternalServiceError('Lens Scholarly API', 'Lens Scholarly API allocation is temporarily exhausted.', 429, true);
  }
  if (!validWindow(state.minute) || !validWindow(state.month)) {
    throw new ExternalServiceError('Lens Scholarly API', 'Lens quota guard returned an invalid state.', 503, true);
  }
  return state;
}
