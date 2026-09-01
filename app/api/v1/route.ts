import { apiDiscovery, jsonResponse, optionsResponse } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return jsonResponse(request, {
    ...apiDiscovery(),
    resources: [
      'content','articles','guides','research','conditions','comparisons','tools','courses','learning-paths',
      'resources','protocols','interventions','assessments','glossary','sectors','categories','tags','search','changes','stats',
    ],
  }, { cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' });
}

export const OPTIONS = optionsResponse;
