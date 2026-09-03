import registry from '@/data/cochrane/resources-v1.json';

export const dynamic = 'force-static';

export async function GET() {
  return Response.json(registry, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'Content-Language': 'ar',
      'X-Rawafid-Schema': registry.schema_version,
    },
  });
}
