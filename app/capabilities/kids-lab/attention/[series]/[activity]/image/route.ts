import { notFound } from 'next/navigation';
import { attentionActivities, getAttentionActivity } from '@/lib/capabilities/attention-lab';
import { renderAttentionWorksheet } from '@/lib/capabilities/attention-svg';

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
  return lines;
}

function rebalance(lines: string[], maxLines = 3) {
  if (lines.length <= maxLines) return lines;
  const words = lines.join(' ').split(/\s+/).filter(Boolean);
  const result: string[] = [];
  let start = 0;
  for (let remaining = maxLines; remaining > 0 && start < words.length; remaining -= 1) {
    const left = words.length - start;
    const take = remaining === 1 ? left : Math.ceil(left / remaining);
    result.push(words.slice(start, start + take).join(' '));
    start += take;
  }
  return result;
}

function normalizeAttentionHeader(svg: string, instruction: string) {
  const lines = rebalance(wrapInstruction(instruction), 3);
  const longest = Math.max(...lines.map((line) => line.length));
  const size = longest <= 46 ? 15 : longest <= 58 ? 13.5 : 12.5;
  const ys = lines.length === 1 ? [161] : lines.length === 2 ? [151, 171] : [143, 160, 177];
  const replacement = lines
    .map((line, index) => `<text x="397" y="${ys[index]}" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="${size}" fill="#334155" direction="rtl" unicode-bidi="plaintext">${escapeXml(line)}</text>`)
    .join('');
  return svg.replace(/<text x="397" y="161"[^>]*>.*?<\/text>/, replacement);
}

function normalizeAttentionFooter(svg: string) {
  const line = (x1:number,y:number,x2:number) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94A3B8" stroke-width="1.5"/>`;
  const label = (x:number,y:number,s:string) => `<text x="${x}" y="${y}" text-anchor="end" font-family="Tahoma,Arial,sans-serif" font-size="14" font-weight="700" fill="#334155" direction="rtl" unicode-bidi="plaintext">${escapeXml(s)}</text>`;
  let out = svg;
  out = out.replace(/<text x="710" y="1038"[^>]*>الاسم: \.{28}<\/text>/, `${label(710,1036,'الاسم')}${line(505,1046,650)}`);
  out = out.replace(/<text x="465" y="1038"[^>]*>التاريخ: \.{12}<\/text>/, `${label(465,1036,'التاريخ')}${line(315,1046,405)}`);
  out = out.replace(/<text x="255" y="1038"[^>]*>الأخطاء: \.{12}<\/text>/, `${label(255,1036,'الأخطاء')}${line(105,1046,195)}`);
  return out;
}

export async function GET(_: Request, { params }: { params: Params }) {
  const { series, activity } = await params;
  const item = getAttentionActivity(series, activity);
  if (!item) notFound();

  let svg = normalizeAttentionHeader(renderAttentionWorksheet(item), item.instruction);
  svg = normalizeAttentionFooter(svg);
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${series}-${activity}.svg"`,
    },
  });
}
