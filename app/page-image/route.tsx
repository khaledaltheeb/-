import { assertSeoCardLayout, fitSeoCardText } from '@/lib/seo-card-layout';
import { normalizePageImageKind, pageImageKindLabel, type PageImageKind } from '@/lib/page-image';

export const dynamic = 'force-dynamic';

const PAGE_RIGHT = 1160;
const TITLE_MAX_WIDTH = 1040;
const TITLE_SAFE_TOP = 245;
const TITLE_SAFE_BOTTOM = 535;
const TITLE_MAX_INPUT = 220;
const GRAPHEME_SEGMENTER = new Intl.Segmenter('ar', { granularity: 'grapheme' });

const THEME: Record<PageImageKind, { accent: string; soft: string; glow: string }> = {
  article: { accent: '#0b7f7c', soft: '#e8f7f4', glow: '#dff4f0' },
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
    maxLines: 3,
    maxFontSize: 60,
    minFontSize: 38,
    lineHeightRatio: 1.28,
  });
  const startY = layout.lines.length >= 3 ? 310 : layout.lines.length === 2 ? 355 : 400;
  assertSeoCardLayout('Page image title', layout, {
    maxWidth: TITLE_MAX_WIDTH,
    startY,
    safeTop: TITLE_SAFE_TOP,
    safeBottom: TITLE_SAFE_BOTTOM,
  });
  return { ...layout, startY };
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
    <radialGradient id="orb"><stop stop-color="${palette.soft}" stop-opacity=".98"/><stop offset="1" stop-color="${palette.soft}" stop-opacity="0"/></radialGradient>
    <clipPath id="page-title-safe"><rect x="100" y="225" width="1080" height="330" rx="24"/></clipPath>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="190" cy="140" r="235" fill="url(#orb)"/>
  <circle cx="1115" cy="650" r="190" fill="url(#orb)" opacity=".68"/>
  <rect x="52" y="42" width="1176" height="636" rx="44" fill="#fff" fill-opacity=".91" stroke="#d9e8e5"/>
  <rect x="1050" y="78" width="88" height="88" rx="26" fill="${palette.accent}"/>
  <text x="1094" y="136" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="42" font-weight="850" fill="#fff" text-anchor="middle">ر</text>
  <text x="1020" y="113" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="34" font-weight="800" fill="#123b3c" text-anchor="start" direction="rtl" unicode-bidi="plaintext">منصة روافد</text>
  <text x="1020" y="150" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="19" fill="#60777b" text-anchor="start" direction="rtl" unicode-bidi="plaintext">معرفة عربية موثوقة</text>
  <rect x="${PAGE_RIGHT - 390}" y="182" width="390" height="52" rx="26" fill="${palette.soft}"/>
  <text x="${PAGE_RIGHT - 26}" y="216" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="20" font-weight="700" fill="${palette.accent}" text-anchor="start" direction="rtl" unicode-bidi="plaintext">${escapeXml(label)}</text>
  <g clip-path="url(#page-title-safe)">${titleSvg}</g>
  <text x="${PAGE_RIGHT}" y="595" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="21" font-weight="650" fill="#61777b" text-anchor="start" direction="rtl" unicode-bidi="plaintext">معلومة واضحة · مصادر قابلة للتتبع · قراءة عربية ميسرة</text>
  <text x="${PAGE_RIGHT}" y="635" font-family="Arial,sans-serif" font-size="21" font-weight="750" fill="${palette.accent}" text-anchor="end" direction="ltr" unicode-bidi="plaintext">https://healthrenewal.org</text>
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
