import { assertSeoCardLayout, fitSeoCardText } from '@/lib/seo-card-layout';
import { normalizePageImageKind, pageImageKindLabel, type PageImageKind } from '@/lib/page-image';

export const dynamic = 'force-dynamic';

const PAGE_RIGHT = 1160;
const TITLE_MAX_WIDTH = 560;
const TITLE_SAFE_TOP = 280;
const TITLE_SAFE_BOTTOM = 455;
const TITLE_MAX_INPUT = 220;
const GRAPHEME_SEGMENTER = new Intl.Segmenter('ar', { granularity: 'grapheme' });

const THEME: Record<PageImageKind, { accent: string; soft: string; glow: string }> = {
  article: { accent: '#0b7f7c', soft: '#e8f7f4', glow: '#dff4f0' },
  'quick-info': { accent: '#176b65', soft: '#e3f1ef', glow: '#f4faf8' },
  encyclopedia: { accent: '#496fa8', soft: '#edf3fb', glow: '#e1ebf8' },
  'care-guide': { accent: '#4f8a69', soft: '#eef8f1', glow: '#e0f2e5' },
  'special-needs': { accent: '#7760a8', soft: '#f2eef9', glow: '#eae3f6' },
  'family-guide': { accent: '#0b7f7c', soft: '#e8f7f4', glow: '#dff4f0' },
  addiction: { accent: '#a4543d', soft: '#fff1e7', glow: '#fbe2d4' },
  capability: { accent: '#0b7f7c', soft: '#e8f7f4', glow: '#dff4f0' },
  comparison: { accent: '#5a6899', soft: '#eef0f8', glow: '#e4e8f4' },
};

function graphemeClamp(value: string | null, max: number) {
  const clean = String(value || '').replace(/\s+/gu, ' ').trim();
  const units = [...GRAPHEME_SEGMENTER.segment(clean)].map((part) => part.segment);
  return units.length > max ? `${units.slice(0, max).join('').trim()}…` : clean;
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

function titleLayout(value: string) {
  const layout = fitSeoCardText(value, {
    maxWidth: TITLE_MAX_WIDTH,
    maxLines: 2,
    maxFontSize: 50,
    minFontSize: 36,
    lineHeightRatio: 1.3,
  });
  const startY = layout.lines.length === 2 ? 328 : 380;
  assertSeoCardLayout('Page image title', layout, {
    maxWidth: TITLE_MAX_WIDTH,
    startY,
    safeTop: TITLE_SAFE_TOP,
    safeBottom: TITLE_SAFE_BOTTOM,
  });
  return { ...layout, startY };
}

function subjectIllustration(kind: PageImageKind, accent: string) {
  const common = `fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"`;
  switch (kind) {
    case 'quick-info':
      return `<g ${common}><circle cx="405" cy="370" r="164"/><path d="M405 286v94"/><circle cx="405" cy="445" r="9" fill="${accent}" stroke="none"/><path d="M302 252c56-31 150-31 206 0"/><path d="M285 505c78 46 162 46 240 0"/></g>`;
    case 'encyclopedia':
      return `<g ${common}><path d="M170 255h190a34 34 0 0 1 34 34v210H204a34 34 0 0 0-34 34V255Z"/><path d="M394 255h190v278a34 34 0 0 0-34-34H394V255Z"/><path d="M394 278v220"/></g>`;
    case 'care-guide':
      return `<g ${common}><path d="M220 318c55-78 167-78 222 0 55-78 167-78 222 0-26 112-107 184-222 221-115-37-196-109-222-221Z"/><path d="M442 340v126M379 403h126"/></g>`;
    case 'special-needs':
      return `<g ${common}><circle cx="335" cy="330" r="82"/><circle cx="495" cy="330" r="82"/><path d="M276 474c52-42 116-63 189-63s137 21 189 63"/><path d="M415 258v144"/></g>`;
    case 'family-guide':
      return `<g ${common}><circle cx="310" cy="312" r="62"/><circle cx="500" cy="312" r="62"/><circle cx="405" cy="265" r="70"/><path d="M220 495c36-68 96-102 180-102s144 34 180 102"/></g>`;
    case 'addiction':
      return `<g ${common}><path d="M255 430c60-123 148-185 263-185 54 0 103 17 147 51"/><path d="M555 236l110 60-82 94"/><path d="M230 496c55-31 112-46 171-46 74 0 145 24 211 73"/></g>`;
    case 'capability':
      return `<g ${common}><circle cx="404" cy="376" r="162"/><path d="M404 214v324M242 376h324M288 260l232 232M520 260 288 492"/></g>`;
    case 'comparison':
      return `<g ${common}><path d="M250 266h154v254H250zM454 330h154v190H454z"/><path d="M205 550h450"/><path d="M327 238v-36M531 302v-100"/></g>`;
    default:
      return `<g ${common}><circle cx="405" cy="370" r="164"/><path d="M405 280v100"/><circle cx="405" cy="442" r="8" fill="${accent}" stroke="none"/><path d="M293 225c61-36 163-36 224 0"/></g>`;
  }
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const title = graphemeClamp(url.searchParams.get('title'), TITLE_MAX_INPUT) || 'معرفة عربية موثوقة';
  const kind = normalizePageImageKind(url.searchParams.get('kind'));
  const label = pageImageKindLabel(kind);
  const palette = THEME[kind];
  const fit = titleLayout(title);
  const titleSvg = fit.lines.map((line, index) => (
    `<text x="${PAGE_RIGHT}" y="${fit.startY + (index * fit.lineHeight)}" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="${fit.fontSize}" font-weight="800" fill="#123b3c" text-anchor="start" direction="rtl" unicode-bidi="plaintext">${escapeXml(line)}</text>`
  )).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" lang="ar" direction="rtl">
  <defs>
    <linearGradient id="bg" x1="1" x2="0" y1="0" y2="1"><stop stop-color="${palette.glow}"/><stop offset=".54" stop-color="#f9fcfb"/><stop offset="1" stop-color="#fffaf2"/></linearGradient>
    <clipPath id="page-title-safe"><rect x="590" y="255" width="590" height="225" rx="24"/></clipPath>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect x="52" y="42" width="1176" height="636" rx="44" fill="#fff" fill-opacity=".94" stroke="#d9e8e5"/>
  <rect x="92" y="92" width="520" height="536" rx="38" fill="${palette.soft}"/>
  <circle cx="352" cy="360" r="206" fill="#fff" fill-opacity=".66"/>
  ${subjectIllustration(kind, palette.accent)}
  <rect x="1048" y="84" width="86" height="86" rx="26" fill="${palette.accent}"/>
  <text x="1091" y="141" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="41" font-weight="850" fill="#fff" text-anchor="middle">ر</text>
  <text x="1015" y="115" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="31" font-weight="800" fill="#123b3c" text-anchor="start" direction="rtl" unicode-bidi="plaintext">منصة روافد</text>
  <text x="1015" y="151" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="18" fill="#60777b" text-anchor="start" direction="rtl" unicode-bidi="plaintext">معرفة عربية موثوقة</text>
  <rect x="770" y="198" width="390" height="54" rx="27" fill="${palette.soft}"/>
  <text x="1132" y="234" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="20" font-weight="700" fill="${palette.accent}" text-anchor="start" direction="rtl" unicode-bidi="plaintext">${escapeXml(label)}</text>
  <g clip-path="url(#page-title-safe)">${titleSvg}</g>
  <text x="1160" y="590" font-family="Arial,sans-serif" font-size="20" font-weight="750" fill="${palette.accent}" text-anchor="end" direction="ltr" unicode-bidi="plaintext">healthrenewal.org</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Language': 'ar',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
