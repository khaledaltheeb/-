import { assertSeoCardLayout, fitSeoCardText } from '@/lib/seo-card-layout';

export const FAMILY_GUIDE_OG_SIZE = { width: 1200, height: 675 } as const;
const ARABIC_TEXT = /[\u0600-\u06ff]/u;
const TITLE_MAX_WIDTH = 1036;
const TITLE_SAFE_TOP = 190;
const TITLE_SAFE_BOTTOM = 440;
const RTL_X = 1118;
const LTR_X = 82;

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

function textLine(line: string, y: number, size: number, rtl: boolean, weight = 800) {
  return rtl
    ? `<text x="${RTL_X}" y="${y}" font-family="Noto Sans Arabic,Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="#143b42" text-anchor="start" direction="rtl" unicode-bidi="plaintext">${escapeXml(line)}</text>`
    : `<text x="${LTR_X}" y="${y}" font-family="Noto Sans,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="#143b42" text-anchor="start" direction="ltr" unicode-bidi="plaintext">${escapeXml(line)}</text>`;
}

function titleLayout(title: string) {
  const layout = fitSeoCardText(title, {
    maxWidth: TITLE_MAX_WIDTH,
    maxLines: 3,
    maxFontSize: 52,
    minFontSize: 34,
    lineHeightRatio: 1.3,
  });
  const startY = layout.lines.length >= 3 ? 250 : layout.lines.length === 2 ? 290 : 330;
  assertSeoCardLayout('Family Guide OG title', layout, {
    maxWidth: TITLE_MAX_WIDTH,
    startY,
    safeTop: TITLE_SAFE_TOP,
    safeBottom: TITLE_SAFE_BOTTOM,
  });
  return { ...layout, startY };
}

export function familyGuideOgImage(title: string) {
  const safeTitle = String(title || 'دليل الأسرة').replace(/\s+/gu, ' ').trim().slice(0, 180) || 'دليل الأسرة';
  const rtl = ARABIC_TEXT.test(safeTitle);
  const fit = titleLayout(safeTitle);
  const titleSvg = fit.lines.map((line, index) => textLine(line, fit.startY + (index * fit.lineHeight), fit.fontSize, rtl)).join('');
  const kicker = rtl ? 'دليل الأسرة · روافد' : 'Family Guide · RAWAFID';
  const footer = rtl ? 'العافية · الدمج · التمكين' : 'Wellbeing · Inclusion · Empowerment';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" lang="${rtl ? 'ar' : 'en'}" direction="${rtl ? 'rtl' : 'ltr'}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f5fffb"/><stop offset=".52" stop-color="#fff"/><stop offset="1" stop-color="#fff6e9"/></linearGradient>
    <clipPath id="family-title-safe"><rect x="70" y="175" width="1060" height="290" rx="18"/></clipPath>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="70" cy="20" r="250" fill="#0f8f88" opacity=".9"/>
  <circle cx="180" cy="650" r="135" fill="none" stroke="#e7ac3c" stroke-width="34" opacity=".32"/>
  <rect x="80" y="80" width="330" height="54" rx="27" fill="#e5f6f1"/>
  <text x="${rtl ? 390 : 105}" y="116" font-family="${rtl ? 'Noto Sans Arabic,Tahoma,Arial,sans-serif' : 'Noto Sans,Arial,sans-serif'}" font-size="24" font-weight="700" fill="#075e5d" text-anchor="${rtl ? 'start' : 'start'}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${escapeXml(kicker)}</text>
  <g clip-path="url(#family-title-safe)">${titleSvg}</g>
  <rect x="82" y="545" width="58" height="58" rx="18" fill="#0f8f88"/>
  <text x="101" y="586" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#fff">R</text>
  <text x="158" y="573" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="#143b42">RAWAFID</text>
  <text x="${rtl ? 1118 : 158}" y="603" font-family="${rtl ? 'Noto Sans Arabic,Tahoma,Arial,sans-serif' : 'Arial,sans-serif'}" font-size="17" fill="#657d82" text-anchor="${rtl ? 'start' : 'start'}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${escapeXml(footer)}</text>
</svg>`;
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
