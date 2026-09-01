import { getPublicContent, optionsResponse } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  return getPublicContent(request, slug);
}

export const OPTIONS = optionsResponse;
