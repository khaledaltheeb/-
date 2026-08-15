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

const encyclopediaConditionRedirects = [
  'autism',
  'depression',
  'alcohol-use-disorder',
  'cannabis-use-disorder',
  'gambling-related-harms',
  'gaming-disorder',
  'inhalant-use-disorder',
  'nicotine-tobacco-dependence',
  'opioid-use-disorder',
  'polysubstance-use-and-overdose-risk',
  'sedative-benzodiazepine-use-disorder',
  'stimulant-use-disorder',
].map((slug) => ({
  source: `/content/${slug}`,
  destination: `/encyclopedia/${slug}/`,
  permanent: true,
}));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      ...encyclopediaConditionRedirects,
      {
        source: '/care-guides/family-mental-health-crisis-plan',
        destination: '/content/family-care-plan',
        permanent: true,
      },
      {
        source: '/capabilities/deafness',
        destination: '/capabilities/hearing-loss/',
        permanent: true,
      },
      {
        source: '/content/capabilities-deafness',
        destination: '/capabilities/hearing-loss/',
        permanent: true,
      },
      {
        source: '/content/capabilities-hub',
        destination: '/capabilities/',
        permanent: true,
      },
      {
        source: '/content/capabilities-:slug',
        destination: '/capabilities/:slug/',
        permanent: true,
      },
      {
        source: '/content/comparisons-hub',
        destination: '/comparisons/',
        permanent: true,
      },
      {
        source: '/content/comparisons-:slug',
        destination: '/comparisons/:slug/',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}
