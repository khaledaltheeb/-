import { jsonResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

const resources = [
  { resource: 'person', scope: 'people:submit', purpose: 'Person records submitted for governed review.' },
  { resource: 'specialist', scope: 'specialists:submit', purpose: 'Professional/provider records requiring verification before publication.' },
  { resource: 'organization', scope: 'organizations:submit', purpose: 'Institution records staged for identity and ROR resolution where applicable.' },
  { resource: 'course', scope: 'courses:submit', purpose: 'Courses and training offers staged for editorial and rights review.' },
  { resource: 'page', scope: 'pages:submit', purpose: 'Partner-supplied page candidates staged for editorial review.' },
  { resource: 'learning_path', scope: 'learning:submit', purpose: 'Structured learning paths staged for educational review.' },
  { resource: 'event', scope: 'events:submit', purpose: 'Events staged for date, organizer, and source validation.' },
  { resource: 'schedule', scope: 'schedules:submit', purpose: 'Schedules or course/session availability staged for validation.' },
] as const;

export async function GET(request: Request) {
  return jsonResponse(request, {
    name: 'Rawafid Institutional Data Exchange',
    api_version: PUBLIC_API_VERSION,
    status: 'preview',
    model: 'governed_staging',
    resources,
    submission: {
      endpoint_template: '/api/v1/integrations/{resource}',
      method: 'POST',
      authentication: 'Rawafid Partner API key using X-API-Key or Bearer authorization.',
      idempotency: 'Idempotency-Key is mandatory and scoped to the partner, with serialized concurrent handling.',
      body: { external_id: 'partner-stable identifier', data: 'resource object', provenance: 'optional provenance object' },
      success_status: 202,
    },
    status_lookup: {
      endpoint_template: '/api/v1/integrations/{resource}?external_id={external_id}',
      method: 'GET',
      required_scope: 'imports:read',
    },
    lifecycle: ['received', 'needs_review', 'accepted', 'rejected', 'published', 'failed'],
    guarantees: [
      'Partner credentials never publish directly to live content or provider tables.',
      'Every accepted submission carries partner identity, external identity, payload fingerprint, provenance, and audit history.',
      'Reusing an Idempotency-Key with different input returns a conflict rather than mutating the earlier request.',
      'Published status can only be recorded through an administrator-guarded publication step after acceptance.',
    ],
    limits: { http_request_bytes: 327680, payload_bytes_database: 262144, provenance_bytes_database: 65536 },
  }, { cacheControl: 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600' });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Accept,Authorization,Content-Type,X-API-Key,X-Request-Id',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
