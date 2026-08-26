export const FAMILY_GUIDE_OG_SIZE = { width: 1200, height: 675 } as const;
const ARABIC_TEXT = /[\u0600-\u06ff]/;

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

export function familyGuideOgImage(title: string) {
  const candidate = ARABIC_TEXT.test(title) ? 'Family guidance and practical support' : title;
  const safeTitle = candidate.length > 110 ? `${candidate.slice(0, 107).trim()}…` : candidate;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f5fffb"/><stop offset=".52" stop-color="#fff"/><stop offset="1" stop-color="#fff6e9"/></linearGradient></defs><rect width="1200" height="675" fill="url(#bg)"/><circle cx="70" cy="20" r="250" fill="#0f8f88" opacity=".9"/><circle cx="180" cy="650" r="135" fill="none" stroke="#e7ac3c" stroke-width="34" opacity=".32"/><rect x="80" y="80" width="330" height="54" rx="27" fill="#e5f6f1"/><text x="105" y="116" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#075e5d">Family Guide · RAWAFID</text><text x="82" y="245" font-family="Arial,sans-serif" font-size="52" font-weight="800" fill="#143b42">${escapeXml(safeTitle.slice(0, 42))}</text><text x="82" y="315" font-family="Arial,sans-serif" font-size="52" font-weight="800" fill="#143b42">${escapeXml(safeTitle.slice(42, 84))}</text><text x="82" y="385" font-family="Arial,sans-serif" font-size="52" font-weight="800" fill="#143b42">${escapeXml(safeTitle.slice(84))}</text><rect x="82" y="545" width="58" height="58" rx="18" fill="#0f8f88"/><text x="101" y="586" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#fff">R</text><text x="158" y="573" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="#143b42">RAWAFID</text><text x="158" y="603" font-family="Arial,sans-serif" font-size="17" fill="#657d82">Wellbeing · Inclusion · Empowerment</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } });
}
