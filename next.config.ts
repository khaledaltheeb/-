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
