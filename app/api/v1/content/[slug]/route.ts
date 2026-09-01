import { getPublicContent, optionsResponse } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const access = await withOptionalPartnerAccess(request, 'content:read');
  if (access.error) return access.error;
  const { slug } = await context.params;
  return decoratePartnerResponse(await getPublicContent(request, slug), access.headers);
}

export const OPTIONS = optionsResponse;
