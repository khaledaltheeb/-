import { listPublicContent, optionsResponse } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return listPublicContent(request);
}

export const OPTIONS = optionsResponse;
