import { bilateralActivities, getBilateralActivity } from '@/lib/capabilities/bilateral-tracks';
import { renderBilateralSvg } from '@/lib/capabilities/bilateral-svg';
import { normalizeKidsLabSvgText } from '@/lib/capabilities/kids-lab-svg-polish';

type Params = Promise<{ activity: string }>;

export function generateStaticParams() {
  return bilateralActivities.map((activity) => ({ activity: activity.slug }));
}

export async function GET(_: Request, { params }: { params: Params }) {
  const { activity: slug } = await params;
  const activity = getBilateralActivity(slug);
  if (!activity) return new Response('Not found', { status: 404 });

  return new Response(normalizeKidsLabSvgText(renderBilateralSvg(activity)), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'Content-Disposition': `inline; filename="${activity.slug}.svg"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
