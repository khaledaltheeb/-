export const ADDICTION_OG_SIZE = { width: 1200, height: 675 } as const;
const ARABIC_TEXT = /[\u0600-\u06ff]/;

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

export function addictionOgImage(title: string) {
  const candidate = ARABIC_TEXT.test(title) ? 'Addiction and recovery guidance' : title;
  const safeTitle = candidate.length > 110 ? `${candidate.slice(0, 107).trim()}…` : candidate;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffaf3"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#eefaf8"/></linearGradient></defs><rect width="1200" height="675" fill="url(#bg)"/><circle cx="65" cy="5" r="250" fill="#df7f45" opacity=".86"/><circle cx="210" cy="660" r="145" fill="none" stroke="#26978b" stroke-width="36" opacity=".22"/><rect x="82" y="82" width="420" height="54" rx="27" fill="#fff0df"/><text x="105" y="118" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#963f2e">Addiction &amp; Recovery · RAWAFID</text><text x="82" y="250" font-family="Arial,sans-serif" font-size="52" font-weight="800" fill="#183d40">${escapeXml(safeTitle.slice(0, 42))}</text><text x="82" y="320" font-family="Arial,sans-serif" font-size="52" font-weight="800" fill="#183d40">${escapeXml(safeTitle.slice(42, 84))}</text><text x="82" y="390" font-family="Arial,sans-serif" font-size="52" font-weight="800" fill="#183d40">${escapeXml(safeTitle.slice(84))}</text><rect x="82" y="545" width="58" height="58" rx="18" fill="#0f8f88"/><text x="101" y="586" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#fff">R</text><text x="158" y="573" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="#183d40">RAWAFID</text><text x="158" y="603" font-family="Arial,sans-serif" font-size="17" fill="#657d82">Safety · Evidence-based care · Functional recovery</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } });
}
