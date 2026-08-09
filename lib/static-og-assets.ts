export const STATIC_OG_ASSETS = {
  addiction: '/images/og/addiction-recovery.png',
  capabilities: '/images/og/capabilities.png',
  comparisons: '/images/og/comparisons.png',
  familyGuide: '/images/og/family-guide.png',
} as const;

export type StaticOgAsset = keyof typeof STATIC_OG_ASSETS;

export function staticOgRedirect(request: Request, asset: StaticOgAsset) {
  const destination = new URL(STATIC_OG_ASSETS[asset], request.url);
  return new Response(null, {
    status: 307,
    headers: {
      Location: destination.toString(),
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Rawafid-Image-Mode': 'static-category-fallback',
    },
  });
}
