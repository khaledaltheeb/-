import { notFound } from 'next/navigation';
import { attentionActivities, getAttentionActivity } from '@/lib/capabilities/attention-lab';
import { renderAttentionWorksheet } from '@/lib/capabilities/attention-svg-final';

type Params = Promise<{ series: string; activity: string }>;

export function generateStaticParams() {
  return attentionActivities.map((item) => ({ series: item.seriesSlug, activity: item.slug }));
}

export async function GET(_: Request, { params }: { params: Params }) {
  const { series, activity } = await params;
  const item = getAttentionActivity(series, activity);
  if (!item) notFound();

  return new Response(renderAttentionWorksheet(item), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${series}-${activity}.svg"`,
    },
  });
}
