import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { partnerCredentialHash } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

const RESOURCE_TYPES = new Set(['person', 'specialist', 'organization', 'course', 'page', 'learning_path', 'event', 'schedule']);
const MAX_BODY_BYTES = 320 * 1024;

function integrationHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Accept,Authorization,Content-Type,Idempotency-Key,X-API-Key,X-Request-Id');
  headers.set('Access-Control-Expose-Headers', 'Retry-After,X-Request-Id,X-Rawafid-Partner,X-Rawafid-Key-Prefix,X-RateLimit-Minute-Limit,X-RateLimit-Minute-Remaining,X-RateLimit-Minute-Reset,X-RateLimit-Day-Limit,X-RateLimit-Day-Remaining,X-RateLimit-Day-Reset');
  headers.set('Cache-Control', 'private, no-store');
  headers.set('Vary', 'Authorization, X-API-Key');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function response(request: Request, payload: unknown, status = 200) {
  return integrationHeaders(jsonResponse(request, payload, { status, cacheControl: 'private, no-store' }));
}

function errorResponse(request: Request, status: number, code: string, message: string, parameter?: string) {
  return integrationHeaders(apiError(request, status, code, message, parameter));
}

function mapRpcFailure(request: Request, data: Record<string, unknown>) {
  const reason = typeof data.reason === 'string' ? data.reason : 'integration_unavailable';
  if (reason === 'rate_limited') {
    const result = errorResponse(request, 429, 'rate_limited', 'Partner API quota exceeded.');
    const resetAt = typeof data.reset_at === 'string' ? Date.parse(data.reset_at) : Number.NaN;
    const headers = new Headers(result.headers);
    headers.set('Retry-After', String(Number.isNaN(resetAt) ? 60 : Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))));
    return new Response(result.body, { status: result.status, headers });
  }
  if (reason === 'scope_denied') return errorResponse(request, 403, 'insufficient_scope', 'The supplied API key does not grant this integration scope.');
  if (reason === 'idempotency_conflict') return errorResponse(request, 409, 'idempotency_conflict', 'This Idempotency-Key was already used with a different resource or payload.', 'Idempotency-Key');
  if (reason === 'invalid_external_id') return errorResponse(request, 400, 'invalid_parameter', 'external_id must contain 1-200 characters.', 'external_id');
  if (reason === 'invalid_idempotency_key') return errorResponse(request, 400, 'invalid_parameter', 'Idempotency-Key must contain 8-128 safe characters.', 'Idempotency-Key');
  if (reason === 'invalid_payload' || reason === 'invalid_provenance') return errorResponse(request, 400, 'invalid_payload', 'The submitted payload or provenance object is invalid or exceeds the size limit.');
  if (reason === 'invalid_resource_type') return errorResponse(request, 404, 'not_found', 'The requested integration resource is not supported.');
  return errorResponse(request, 401, 'invalid_api_key', 'A valid Rawafid Partner API key is required.');
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  const resourceType = resource.toLowerCase();
  if (!RESOURCE_TYPES.has(resourceType)) return errorResponse(request, 404, 'not_found', 'The requested integration resource is not supported.');

  const keyHash = partnerCredentialHash(request);
  if (!keyHash) return errorResponse(request, 401, 'invalid_api_key', 'A valid Rawafid Partner API key is required.');

  const idempotencyKey = request.headers.get('idempotency-key')?.trim() || '';
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(idempotencyKey)) {
    return errorResponse(request, 400, 'invalid_parameter', 'Idempotency-Key must contain 8-128 safe characters.', 'Idempotency-Key');
  }

  const declaredLength = Number(request.headers.get('content-length') || '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return errorResponse(request, 413, 'payload_too_large', 'Integration requests are limited to 320 KiB.');
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) return errorResponse(request, 413, 'payload_too_large', 'Integration requests are limited to 320 KiB.');
    body = JSON.parse(raw);
  } catch {
    return errorResponse(request, 400, 'invalid_json', 'Request body must be valid JSON.');
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) return errorResponse(request, 400, 'invalid_payload', 'Request body must be a JSON object.');
  const record = body as Record<string, unknown>;
  const externalId = typeof record.external_id === 'string' ? record.external_id.trim() : '';
  const payload = record.data;
  const provenance = record.provenance ?? {};
  if (!externalId) return errorResponse(request, 400, 'invalid_parameter', 'external_id is required.', 'external_id');
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return errorResponse(request, 400, 'invalid_payload', 'data must be a JSON object.', 'data');
  if (!provenance || typeof provenance !== 'object' || Array.isArray(provenance)) return errorResponse(request, 400, 'invalid_payload', 'provenance must be a JSON object.', 'provenance');

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('api_partner_submit_integration', {
    p_key_hash: keyHash,
    p_resource_type: resourceType,
    p_external_id: externalId,
    p_idempotency_key: idempotencyKey,
    p_payload: payload,
    p_provenance: provenance,
  });

  if (error) return errorResponse(request, 503, 'integration_unavailable', 'The institutional integration service is temporarily unavailable.');
  const result = (data || {}) as Record<string, unknown>;
  if (result.authorized !== true || result.accepted !== true) return mapRpcFailure(request, result);

  return response(request, {
    data: {
      submission_id: result.submission_id,
      item_id: result.item_id,
      resource_type: result.resource_type,
      external_id: result.external_id,
      status: result.status,
      review_required: true,
      idempotent_replay: result.idempotent_replay === true,
      published_url: result.published_url ?? null,
    },
    meta: {
      api_version: PUBLIC_API_VERSION,
      partner: result.partner_slug ?? null,
      accepted_at: new Date().toISOString(),
      publication_boundary: 'Submissions enter governed staging and are never published directly by partner credentials.',
    },
  }, result.idempotent_replay === true ? 200 : 202);
}

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  const resourceType = resource.toLowerCase();
  if (!RESOURCE_TYPES.has(resourceType)) return errorResponse(request, 404, 'not_found', 'The requested integration resource is not supported.');

  const keyHash = partnerCredentialHash(request);
  if (!keyHash) return errorResponse(request, 401, 'invalid_api_key', 'A valid Rawafid Partner API key is required.');
  const externalId = new URL(request.url).searchParams.get('external_id')?.trim() || '';
  if (!externalId || externalId.length > 200) return errorResponse(request, 400, 'invalid_parameter', 'external_id is required and must contain at most 200 characters.', 'external_id');

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('api_partner_integration_status', {
    p_key_hash: keyHash,
    p_resource_type: resourceType,
    p_external_id: externalId,
  });

  if (error) return errorResponse(request, 503, 'integration_unavailable', 'The institutional integration service is temporarily unavailable.');
  const result = (data || {}) as Record<string, unknown>;
  if (result.authorized !== true) return mapRpcFailure(request, result);
  if (result.found !== true) return errorResponse(request, 404, 'not_found', 'No staged integration item exists for this partner and external_id.');

  return response(request, {
    data: {
      item_id: result.item_id,
      resource_type: result.resource_type,
      external_id: result.external_id,
      status: result.status,
      review_note: result.review_note ?? null,
      published_entity_type: result.published_entity_type ?? null,
      published_entity_id: result.published_entity_id ?? null,
      published_url: result.published_url ?? null,
      received_at: result.received_at,
      updated_at: result.updated_at,
      reviewed_at: result.reviewed_at ?? null,
      published_at: result.published_at ?? null,
    },
    meta: { api_version: PUBLIC_API_VERSION, partner: result.partner_slug ?? null },
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Accept,Authorization,Content-Type,Idempotency-Key,X-API-Key,X-Request-Id',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'public, max-age=86400',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
