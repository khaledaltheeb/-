export const dynamic = 'force-dynamic';

function clean(value: string | null, max: number) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

function wrapArabic(value: string, maxChars = 27, maxLines = 3) {
  const words = value.split(/\s+/u).filter(Boolean);
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
  if (visible.length < value.length && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[،,:؛;.!؟?\-–—]+$/u, '').trim()}…`;
  }
  return lines.slice(0, maxLines);
}

function rtlText(text: string, y: number, size: number, weight = 800) {
  return `<text x="1080" y="${y}" font-family="Tahoma, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="#123b3c" text-anchor="end" direction="rtl" style="direction:rtl;unicode-bidi:plaintext">${escapeXml(text)}</text>`;
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const title = clean(url.searchParams.get('title'), 180) || 'روافد — معرفة عربية موثوقة';
  const context = clean(url.searchParams.get('context'), 90) || 'معرفة موثوقة · مصادر قابلة للتتبع · مسارات عملية';
  const lines = wrapArabic(title);
  const lineSize = title.length > 88 ? 39 : title.length > 58 ? 44 : 50;
  const startY = lines.length === 1 ? 330 : lines.length === 2 ? 292 : 262;
  const lineGap = lineSize + 18;
  const titleSvg = lines.map((line, index) => rtlText(line, startY + (index * lineGap), lineSize)).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" lang="ar" direction="rtl"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7fbfa"/><stop offset=".56" stop-color="#e8f5f2"/><stop offset="1" stop-color="#fff9ed"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><circle cx="1100" cy="70" r="160" fill="#075f61" opacity=".055"/><circle cx="120" cy="575" r="185" fill="#e6b650" opacity=".075"/><rect x="64" y="54" width="1072" height="522" rx="34" fill="#fff" opacity=".76"/><rect x="1010" y="78" width="82" height="82" rx="24" fill="#075f61"/><text x="1051" y="132" font-family="Tahoma,Arial,sans-serif" font-size="40" font-weight="800" fill="#fff" text-anchor="middle">ر</text><text x="980" y="111" font-family="Tahoma,Arial,sans-serif" font-size="38" font-weight="800" fill="#123b3c" text-anchor="end" direction="rtl" style="direction:rtl;unicode-bidi:plaintext">روافد</text><text x="980" y="143" font-family="Tahoma,Arial,sans-serif" font-size="18" fill="#416a6a" text-anchor="end" direction="rtl" style="direction:rtl;unicode-bidi:plaintext">منصة المعرفة العربية الموثوقة</text>${titleSvg}<text x="1080" y="492" font-family="Tahoma,Arial,sans-serif" font-size="23" fill="#345d5e" text-anchor="end" direction="rtl" style="direction:rtl;unicode-bidi:plaintext">${escapeXml(context)}</text><text x="1080" y="548" font-family="Arial,sans-serif" font-size="19" fill="#4f7172" text-anchor="end">healthrenewal.org</text></svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
