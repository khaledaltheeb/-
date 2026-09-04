import { assertSeoCardLayout, fitSeoCardText } from '@/lib/seo-card-layout';

export const dynamic = 'force-dynamic';

const CARD_RIGHT = 1080;
const TITLE_MAX_WIDTH = 900;
const CONTEXT_MAX_WIDTH = 900;
const TITLE_SAFE_TOP = 205;
const TITLE_SAFE_BOTTOM = 430;
const CONTEXT_SAFE_TOP = 452;
const CONTEXT_SAFE_BOTTOM = 520;

function clean(value: string | null, max: number) {
  return String(value || '').replace(/\s+/gu, ' ').trim().slice(0, max);
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

function rtlText(text: string, y: number, size: number, weight = 800) {
  return `<text x="${CARD_RIGHT}" y="${y}" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="#123b3c" text-anchor="start" direction="rtl" unicode-bidi="plaintext">${escapeXml(text)}</text>`;
}

function titleLayout(value: string) {
  const layout = fitSeoCardText(value, {
    maxWidth: TITLE_MAX_WIDTH,
    maxLines: 3,
    maxFontSize: 52,
    minFontSize: 34,
    lineHeightRatio: 1.3,
  });
  const startY = layout.lines.length >= 3 ? 258 : layout.lines.length === 2 ? 294 : 330;
  assertSeoCardLayout('SEO card title', layout, {
    maxWidth: TITLE_MAX_WIDTH,
    startY,
    safeTop: TITLE_SAFE_TOP,
    safeBottom: TITLE_SAFE_BOTTOM,
  });
  return { ...layout, startY };
}

function contextLayout(value: string) {
  const layout = fitSeoCardText(value, {
    maxWidth: CONTEXT_MAX_WIDTH,
    maxLines: 1,
    maxFontSize: 23,
    minFontSize: 18,
    lineHeightRatio: 1.25,
  });
  const startY = 492;
  assertSeoCardLayout('SEO card context', layout, {
    maxWidth: CONTEXT_MAX_WIDTH,
    startY,
    safeTop: CONTEXT_SAFE_TOP,
    safeBottom: CONTEXT_SAFE_BOTTOM,
  });
  return { ...layout, startY };
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const title = clean(url.searchParams.get('title'), 180) || 'روافد — معرفة عربية موثوقة';
  const context = clean(url.searchParams.get('context'), 90) || 'معرفة موثوقة · مصادر قابلة للتتبع · مسارات عملية';
  const titleFit = titleLayout(title);
  const contextFit = contextLayout(context);
  const titleSvg = titleFit.lines
    .map((line, index) => rtlText(line, titleFit.startY + (index * titleFit.lineHeight), titleFit.fontSize))
    .join('');
  const contextSvg = contextFit.lines
    .map((line, index) => rtlText(line, contextFit.startY + (index * contextFit.lineHeight), contextFit.fontSize, 500))
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" lang="ar" direction="rtl">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7fbfa"/><stop offset=".56" stop-color="#e8f5f2"/><stop offset="1" stop-color="#fff9ed"/></linearGradient>
    <clipPath id="safe-text"><rect x="120" y="190" width="980" height="350" rx="18"/></clipPath>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1100" cy="70" r="160" fill="#075f61" opacity=".055"/>
  <circle cx="120" cy="575" r="185" fill="#e6b650" opacity=".075"/>
  <rect x="64" y="54" width="1072" height="522" rx="34" fill="#fff" opacity=".76"/>
  <rect x="1010" y="78" width="82" height="82" rx="24" fill="#075f61"/>
  <text x="1051" y="132" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="40" font-weight="800" fill="#fff" text-anchor="middle">ر</text>
  <text x="980" y="111" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="38" font-weight="800" fill="#123b3c" text-anchor="start" direction="rtl" unicode-bidi="plaintext">روافد</text>
  <text x="980" y="143" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="18" fill="#416a6a" text-anchor="start" direction="rtl" unicode-bidi="plaintext">منصة المعرفة العربية الموثوقة</text>
  <g clip-path="url(#safe-text)">${titleSvg}${contextSvg}</g>
  <text x="1080" y="548" font-family="Arial,sans-serif" font-size="19" fill="#4f7172" text-anchor="end">https://healthrenewal.org</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
