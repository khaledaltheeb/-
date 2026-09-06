import { notFound } from 'next/navigation';
import { getMemoryActivity } from '@/lib/capabilities/memory-lab';
import { renderMemoryWorksheet } from '@/lib/capabilities/memory-svg';

type Params = Promise<{ series: string; activity: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  const { series, activity } = await params;
  const item = getMemoryActivity(series, activity);
  if (!item) notFound();

  return new Response(renderMemoryWorksheet(item), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      'Content-Disposition': `inline; filename="memory-${series}-${activity}.svg"`,
    },
  });
}
