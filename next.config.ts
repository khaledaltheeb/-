import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const webMcpOriginTrialToken = process.env.WEBMCP_ORIGIN_TRIAL_TOKEN?.trim();

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), tools=(self)' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  ...(webMcpOriginTrialToken ? [{ key: 'Origin-Trial', value: webMcpOriginTrialToken }] : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep exact historical URLs available while middleware continues to normalize
  // non-legacy trailing-slash requests to the platform's modern no-slash form.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: '/encyclopedia/fragile-x-syndrome-education',
        destination: '/content/fragile-x-school-iep-inclusion',
        permanent: true,
      },
      {
        source: '/encyclopedia/fragile-x-syndrome-education/',
        destination: '/content/fragile-x-school-iep-inclusion',
        permanent: true,
      },
      // Canonical consolidation: three historical Cluttering pages addressed the
      // same core search intent. Preserve both historical routes while making the
      // shortest stable encyclopedia route the single public owner.
      {
        source: '/encyclopedia/cluttering-communication-disorder',
        destination: '/encyclopedia/cluttering/',
        permanent: true,
      },
      {
        source: '/encyclopedia/cluttering-communication-disorder/',
        destination: '/encyclopedia/cluttering/',
        permanent: true,
      },
      {
        source: '/content/cluttering-fluency-disorder',
        destination: '/encyclopedia/cluttering/',
        permanent: true,
      },
      {
        source: '/content/cluttering-fluency-disorder/',
        destination: '/encyclopedia/cluttering/',
        permanent: true,
      },
      // Canonical consolidation: CAS had two additional diagnostic/reference pages.
      // Keep functional Capabilities, Outside-the-Box and school-support routes
      // independent, but route overlapping diagnostic intent to the core reference.
      {
        source: '/content/special-ed-encyclopedia-childhood-apraxia-of-speech',
        destination: '/encyclopedia/childhood-apraxia-speech/',
        permanent: true,
      },
      {
        source: '/content/special-ed-encyclopedia-childhood-apraxia-of-speech/',
        destination: '/encyclopedia/childhood-apraxia-speech/',
        permanent: true,
      },
      {
        source: '/special-needs/communication/childhood-apraxia-of-speech',
        destination: '/encyclopedia/childhood-apraxia-speech/',
        permanent: true,
      },
      {
        source: '/special-needs/communication/childhood-apraxia-of-speech/',
        destination: '/encyclopedia/childhood-apraxia-speech/',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Migration policy: no hidden route substitution for historical content.
    return [];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}
