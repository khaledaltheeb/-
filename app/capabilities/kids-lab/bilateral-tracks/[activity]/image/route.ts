import { getBilateralActivity } from '@/lib/capabilities/bilateral-tracks';
import { renderBilateralSvg } from '@/lib/capabilities/bilateral-svg';

type Params = Promise<{ activity: string }>;

export async function GET(_: Request, { params }: { params: Params }) {
  const { activity: slug } = await params;
  const activity = getBilateralActivity(slug);
  if (!activity) return new Response('Not found', { status: 404 });

  return new Response(renderBilateralSvg(activity), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${activity.slug}.svg"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
