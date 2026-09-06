import { notFound } from 'next/navigation';
import { getAttentionActivity } from '@/lib/capabilities/attention-lab';
import { renderAttentionWorksheet } from '@/lib/capabilities/attention-svg';

type Params = Promise<{ series: string; activity: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  const { series, activity } = await params;
  const item = getAttentionActivity(series, activity);
  if (!item) notFound();

  return new Response(renderAttentionWorksheet(item), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      'Content-Disposition': `inline; filename="${series}-${activity}.svg"`,
    },
  });
}
