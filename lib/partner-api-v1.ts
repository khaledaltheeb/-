import { createHash } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';

export type PartnerScope = 'content:read' | 'sources:read' | 'search:read' | 'changes:read' | 'stats:read';

export type PartnerAuthorization = {
  authorized: boolean;
  reason?: string;
  partner_id?: string;
  partner_slug?: string;
  plan?: string;
  key_id?: string;
  key_prefix?: string;
  scope?: PartnerScope;
  scopes?: PartnerScope[];
  minute?: { limit: number; remaining: number; reset_at: string };
  day?: { limit: number; remaining: number; reset_at: string };
};

function readApiKey(request: Request) {
  const explicit = request.headers.get('x-api-key')?.trim();
  if (explicit) return explicit;
  const authorization = request.headers.get('authorization')?.trim() || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function scopeHeader(authorization: PartnerAuthorization) {
  const minute = authorization.minute;
  const day = authorization.day;
  return {
    ...(authorization.partner_slug ? { 'X-Rawafid-Partner': authorization.partner_slug } : {}),
    ...(authorization.key_prefix ? { 'X-Rawafid-Key-Prefix': authorization.key_prefix } : {}),
    ...(minute ? {
      'X-RateLimit-Minute-Limit': String(minute.limit),
      'X-RateLimit-Minute-Remaining': String(minute.remaining),
      'X-RateLimit-Minute-Reset': minute.reset_at,
    } : {}),
    ...(day ? {
      'X-RateLimit-Day-Limit': String(day.limit),
      'X-RateLimit-Day-Remaining': String(day.remaining),
      'X-RateLimit-Day-Reset': day.reset_at,
    } : {}),
  };
}

export async function authorizePartnerRequest(request: Request, scope: PartnerScope) {
  const rawKey = readApiKey(request);
  if (!rawKey) return { authorization: null as PartnerAuthorization | null, headers: {} as Record<string, string> };
  if (!/^rawafid_live_[0-9a-f]{64}$/.test(rawKey)) {
    return { authorization: { authorized: false, reason: 'invalid_key' } as PartnerAuthorization, headers: {} as Record<string, string> };
  }
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('api_partner_authorize', { p_key_hash: keyHash, p_scope: scope });
  if (error) return { authorization: { authorized: false, reason: 'authorization_unavailable' } as PartnerAuthorization, headers: {} as Record<string, string> };
  const authorization = (data || { authorized: false, reason: 'invalid_key' }) as PartnerAuthorization;
  return { authorization, headers: authorization.authorized ? scopeHeader(authorization) : {} };
}

export function partnerAuthError(request: Request, authorization: PartnerAuthorization) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  if (authorization.reason === 'rate_limited') {
    const reset = String((authorization as unknown as { reset_at?: string }).reset_at || '');
    const retryAfter = reset ? Math.max(1, Math.ceil((new Date(reset).getTime() - Date.now()) / 1000)) : 60;
    return new Response(JSON.stringify({ error: { code: 'rate_limited', message: 'Partner API quota exceeded.', request_id: requestId } }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Retry-After': String(retryAfter),
        'X-Request-Id': requestId,
      },
    });
  }
  const status = authorization.reason === 'scope_denied' ? 403 : authorization.reason === 'authorization_unavailable' ? 503 : 401;
  const code = authorization.reason === 'scope_denied' ? 'insufficient_scope' : authorization.reason === 'authorization_unavailable' ? 'authorization_unavailable' : 'invalid_api_key';
  const message = authorization.reason === 'scope_denied' ? 'The supplied API key does not grant this scope.' : authorization.reason === 'authorization_unavailable' ? 'Partner authorization is temporarily unavailable.' : 'A valid Rawafid Partner API key is required.';
  return new Response(JSON.stringify({ error: { code, message, request_id: requestId } }), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'WWW-Authenticate': status === 401 ? 'Bearer realm="Rawafid Partner API"' : '',
      'X-Request-Id': requestId,
    },
  });
}

export async function withOptionalPartnerAccess(request: Request, scope: PartnerScope) {
  const result = await authorizePartnerRequest(request, scope);
  if (result.authorization && !result.authorization.authorized) return { error: partnerAuthError(request, result.authorization), headers: {} as Record<string, string> };
  return { error: null as Response | null, headers: result.headers, authorization: result.authorization };
}
