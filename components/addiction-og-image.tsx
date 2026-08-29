export const ADDICTION_OG_SIZE = { width: 1200, height: 675 } as const;
const ARABIC_TEXT = /[\u0600-\u06ff]/;

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

function wrapTitle(value: string, maxChars = 30, maxLines = 3) {
  const words = value.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  const visible = lines.join(' ');
  if (visible.length < value.length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[،,:؛;.!؟?\-–—]+$/u, '').trim()}…`;
  }
  return lines.slice(0, maxLines);
}

function titleText(line: string, y: number, size: number, rtl: boolean) {
  return rtl
    ? `<text x="1090" y="${y}" font-family="Tahoma, Arial, sans-serif" font-size="${size}" font-weight="800" fill="#183d40" text-anchor="end" direction="rtl" style="direction:rtl;unicode-bidi:plaintext">${escapeXml(line)}</text>`
    : `<text x="90" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="800" fill="#183d40">${escapeXml(line)}</text>`;
}

export function addictionOgImage(title: string) {
  const safeTitle = (title || 'الإدمان والتعافي').replace(/\s+/g, ' ').trim().slice(0, 180);
  const rtl = ARABIC_TEXT.test(safeTitle);
  const lines = wrapTitle(safeTitle, rtl ? 30 : 38, 3);
  const size = safeTitle.length > 100 ? 39 : safeTitle.length > 70 ? 44 : 50;
  const startY = lines.length === 1 ? 325 : lines.length === 2 ? 290 : 255;
  const gap = size + 18;
  const titleSvg = lines.map((line, index) => titleText(line, startY + (index * gap), size, rtl)).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" lang="ar" direction="rtl"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffaf3"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#eefaf8"/></linearGradient></defs><rect width="1200" height="675" fill="url(#bg)"/><circle cx="65" cy="5" r="250" fill="#df7f45" opacity=".86"/><circle cx="210" cy="660" r="145" fill="none" stroke="#26978b" stroke-width="36" opacity=".22"/><rect x="760" y="72" width="350" height="58" rx="29" fill="#fff0df"/><text x="1080" y="110" font-family="Tahoma,Arial,sans-serif" font-size="24" font-weight="700" fill="#963f2e" text-anchor="end" direction="rtl" style="direction:rtl;unicode-bidi:plaintext">الإدمان والتعافي · روافد</text>${titleSvg}<rect x="90" y="550" width="58" height="58" rx="18" fill="#0f8f88"/><text x="109" y="591" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#fff">R</text><text x="166" y="578" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="#183d40">RAWAFID</text><text x="1090" y="604" font-family="Tahoma,Arial,sans-serif" font-size="18" fill="#657d82" text-anchor="end" direction="rtl" style="direction:rtl;unicode-bidi:plaintext">سلامة · رعاية مبنية على الدليل · تعافٍ وظيفي</text></svg>`;
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Language': 'ar',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
