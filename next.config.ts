import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const cognitiveLabLegacyRewrites = [
  { source: '/cognitive-lab/associative-context-binding', destination: '/cognitive-lab/associative-binding' },
  { source: '/cognitive-lab/prospective-memory-cues', destination: '/cognitive-lab/prospective-memory' },
];

const legacyHubRewrites = [
  { source: '/hubs', destination: '/content/legacy-landing-hubs' },
  { source: '/hubs/', destination: '/content/legacy-landing-hubs' },
  { source: '/hubs/:slug', destination: '/content/legacy-hub-:slug' },
  { source: '/hubs/:slug/', destination: '/content/legacy-hub-:slug' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    // Legacy content migration policy: historical content routes must render real
    // content on their original URL. Migration redirects are intentionally empty.
    return [];
  },
  async rewrites() {
    return [
      ...cognitiveLabLegacyRewrites,
      ...legacyHubRewrites,
      { source: '/resources/:slug', destination: '/content/:slug' },
      { source: '/resources/:slug/', destination: '/content/:slug' },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}
