import { assertSeoCardLayout, fitSeoCardText } from '@/lib/seo-card-layout';

export const ADDICTION_OG_SIZE = { width: 1200, height: 675 } as const;
const ARABIC_TEXT = /[\u0600-\u06ff]/u;
const TITLE_MAX_WIDTH = 980;
const TITLE_SAFE_TOP = 205;
const TITLE_SAFE_BOTTOM = 470;
const RTL_X = 1090;
const LTR_X = 90;

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

function titleText(line: string, y: number, size: number, rtl: boolean) {
  return rtl
    ? `<text x="${RTL_X}" y="${y}" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="${size}" font-weight="800" fill="#183d40" text-anchor="start" direction="rtl" unicode-bidi="plaintext">${escapeXml(line)}</text>`
    : `<text x="${LTR_X}" y="${y}" font-family="Noto Sans,Arial,sans-serif" font-size="${size}" font-weight="800" fill="#183d40" text-anchor="start" direction="ltr" unicode-bidi="plaintext">${escapeXml(line)}</text>`;
}

function titleLayout(value: string) {
  const layout = fitSeoCardText(value, {
    maxWidth: TITLE_MAX_WIDTH,
    maxLines: 3,
    maxFontSize: 50,
    minFontSize: 34,
    lineHeightRatio: 1.3,
  });
  const startY = layout.lines.length >= 3 ? 270 : layout.lines.length === 2 ? 305 : 340;
  assertSeoCardLayout('Addiction OG title', layout, {
    maxWidth: TITLE_MAX_WIDTH,
    startY,
    safeTop: TITLE_SAFE_TOP,
    safeBottom: TITLE_SAFE_BOTTOM,
  });
  return { ...layout, startY };
}

export function addictionOgImage(title: string) {
  const safeTitle = (title || 'الإدمان والتعافي').replace(/\s+/gu, ' ').trim().slice(0, 180);
  const rtl = ARABIC_TEXT.test(safeTitle);
  const fit = titleLayout(safeTitle);
  const titleSvg = fit.lines
    .map((line, index) => titleText(line, fit.startY + (index * fit.lineHeight), fit.fontSize, rtl))
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" lang="ar" direction="rtl">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffaf3"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#eefaf8"/></linearGradient>
    <clipPath id="addiction-title-safe"><rect x="80" y="185" width="1040" height="305" rx="18"/></clipPath>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="65" cy="5" r="250" fill="#df7f45" opacity=".86"/>
  <circle cx="210" cy="660" r="145" fill="none" stroke="#26978b" stroke-width="36" opacity=".22"/>
  <rect x="760" y="72" width="350" height="58" rx="29" fill="#fff0df"/>
  <text x="1080" y="110" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="24" font-weight="700" fill="#963f2e" text-anchor="start" direction="rtl" unicode-bidi="plaintext">الإدمان والتعافي · روافد</text>
  <g clip-path="url(#addiction-title-safe)">${titleSvg}</g>
  <rect x="90" y="550" width="58" height="58" rx="18" fill="#0f8f88"/>
  <text x="109" y="591" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#fff">R</text>
  <text x="166" y="578" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="#183d40">RAWAFID</text>
  <text x="1090" y="604" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="18" fill="#657d82" text-anchor="start" direction="rtl" unicode-bidi="plaintext">سلامة · رعاية مبنية على الدليل · تعافٍ وظيفي</text>
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
