export const dynamic = 'force-dynamic';

function clean(value: string | null, max: number) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const title = clean(url.searchParams.get('title'), 120) || 'Rawafid — trusted Arabic knowledge';
  const context = clean(url.searchParams.get('context'), 70) || 'Trusted knowledge · traceable sources · practical pathways';
  const safeTitle = escapeXml(title);
  const safeContext = escapeXml(context);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7fbfa"/><stop offset=".56" stop-color="#e8f5f2"/><stop offset="1" stop-color="#fff9ed"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><rect x="78" y="68" width="78" height="78" rx="23" fill="#075f61"/><text x="101" y="121" font-family="Arial,sans-serif" font-size="40" font-weight="800" fill="#fff">R</text><text x="180" y="106" font-family="Arial,sans-serif" font-size="42" font-weight="800" fill="#123b3c">RAWAFID</text><text x="180" y="137" font-family="Arial,sans-serif" font-size="19" fill="#416a6a">Arabic health and wellbeing knowledge</text><text x="78" y="270" font-family="Arial,sans-serif" font-size="46" font-weight="800" fill="#123b3c">${safeTitle.slice(0, 45)}</text><text x="78" y="335" font-family="Arial,sans-serif" font-size="46" font-weight="800" fill="#123b3c">${safeTitle.slice(45, 90)}</text><text x="78" y="400" font-family="Arial,sans-serif" font-size="46" font-weight="800" fill="#123b3c">${safeTitle.slice(90)}</text><text x="78" y="470" font-family="Arial,sans-serif" font-size="22" fill="#345d5e">${safeContext}</text><text x="78" y="570" font-family="Arial,sans-serif" font-size="19" fill="#4f7172">healthrenewal.org</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000' } });
}
