import { notFound } from 'next/navigation';
import { attentionActivities, getAttentionActivity } from '@/lib/capabilities/attention-lab';
import { renderAttentionWorksheet } from '@/lib/capabilities/attention-svg';
import { normalizeKidsLabSvgText } from '@/lib/capabilities/kids-lab-svg-polish';

type Params = Promise<{ series: string; activity: string }>;

export function generateStaticParams() {
  return attentionActivities.map((item) => ({ series: item.seriesSlug, activity: item.slug }));
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] ?? char));
}

function wrapInstruction(value: string, max = 64) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function normalizeAttentionHeader(svg: string, instruction: string) {
  const lines = wrapInstruction(instruction);
  const replacement = lines
    .map((line, index) => `<text x="397" y="${lines.length === 1 ? 163 : 154 + index * 21}" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="${lines.length === 1 ? 15 : 13.5}" fill="#334155" direction="rtl" unicode-bidi="plaintext">${escapeXml(line)}</text>`)
    .join('');
  return svg.replace(/<text x="397" y="161"[^>]*>.*?<\/text>/, replacement);
}

export async function GET(_: Request, { params }: { params: Params }) {
  const { series, activity } = await params;
  const item = getAttentionActivity(series, activity);
  if (!item) notFound();

  const svg = normalizeKidsLabSvgText(
    normalizeAttentionHeader(renderAttentionWorksheet(item), item.instruction)
  );
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'Content-Disposition': `inline; filename="${series}-${activity}.svg"`,
    },
  });
}
