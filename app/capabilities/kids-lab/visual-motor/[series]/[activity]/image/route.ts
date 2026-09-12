import { notFound } from 'next/navigation';
import { getVisualMotorActivity, visualMotorActivities } from '@/lib/capabilities/visual-motor-lab';
import { renderVisualMotorWorksheet } from '@/lib/capabilities/visual-motor-svg-final';
import { normalizeKidsLabSvgText } from '@/lib/capabilities/kids-lab-svg-polish';

type Params = Promise<{ series: string; activity: string }>;

export function generateStaticParams() {
  return visualMotorActivities.map((item) => ({ series: item.seriesSlug, activity: item.slug }));
}

export async function GET(_: Request, { params }: { params: Params }) {
  const { series, activity } = await params;
  const item = getVisualMotorActivity(series, activity);
  if (!item) notFound();

  return new Response(normalizeKidsLabSvgText(renderVisualMotorWorksheet(item)), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'Content-Disposition': `inline; filename="${series}-${activity}.svg"`,
    },
  });
}
