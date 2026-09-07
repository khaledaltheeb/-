import { notFound } from 'next/navigation';
import { getMemoryActivity, memoryActivities } from '@/lib/capabilities/memory-lab';
import { renderMemoryWorksheet } from '@/lib/capabilities/memory-svg-final';

type Params = Promise<{ series: string; activity: string }>;

export function generateStaticParams() {
  return memoryActivities.map((item) => ({ series: item.seriesSlug, activity: item.slug }));
}

export async function GET(_: Request, { params }: { params: Params }) {
  const { series, activity } = await params;
  const item = getMemoryActivity(series, activity);
  if (!item) notFound();

  return new Response(renderMemoryWorksheet(item), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="memory-${series}-${activity}.svg"`,
    },
  });
}
