import { listPublicContent, optionsResponse } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const access = await withOptionalPartnerAccess(request, 'content:read');
  if (access.error) return access.error;
  return decoratePartnerResponse(await listPublicContent(request), access.headers);
}

export const OPTIONS = optionsResponse;
