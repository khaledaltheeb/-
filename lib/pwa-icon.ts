export function createPwaIcon(size: number) {
  const radius = Math.round(size * 0.225);
  const inner = Math.round(size * 0.085);
  const mark = Math.round(size * 0.72);
  const offset = Math.round((size - mark) / 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b8580"/><stop offset=".56" stop-color="#075f61"/><stop offset="1" stop-color="#063f49"/></linearGradient></defs><rect width="${size}" height="${size}" rx="${radius}" fill="#f7fbf9"/><rect x="${inner}" y="${inner}" width="${size - inner * 2}" height="${size - inner * 2}" rx="${radius}" fill="url(#g)"/><svg x="${offset}" y="${offset}" width="${mark}" height="${mark}" viewBox="0 0 100 100"><g fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"><path d="M27 31c2 16 10 21 23 25 14 5 21 12 22 25"/><path d="M15 45c16 0 22 9 35 11 14 4 21 12 22 25"/><path d="M44 18c-4 16 0 28 6 38 8 12 19 13 22 25"/><path d="M66 33c-8 8-12 15-16 23"/></g><circle cx="27" cy="22" r="7" fill="#e6b650" stroke="#fff" stroke-width="2.6"/></svg></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=31536000, immutable' } });
}
