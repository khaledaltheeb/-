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
  'autism','depression','alcohol-use-disorder','cannabis-use-disorder','gambling-related-harms','gaming-disorder','inhalant-use-disorder','nicotine-tobacco-dependence','opioid-use-disorder','polysubstance-use-and-overdose-risk','sedative-benzodiazepine-use-disorder','stimulant-use-disorder',
].map((slug) => ({ source: `/content/${slug}`, destination: `/encyclopedia/${slug}/`, permanent: true }));

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
const legacyTeamPartnerRedirects = [{ source: '/team-and-partners', destination: '/join', permanent: true }];
const legacySpecialistRedirects = [
  { source: '/ai-search', destination: '/search', permanent: true },
  { source: '/specialists-partners/account', destination: '/account', permanent: true },
  { source: '/specialists-partners/admin', destination: '/admin', permanent: true },
  { source: '/specialists-partners/contact', destination: '/specialists', permanent: true },
  { source: '/specialists-partners/join', destination: '/join/specialist', permanent: true },
  { source: '/specialists-partners/password-reset', destination: '/reset-password', permanent: true },
  { source: '/specialists-partners/portal', destination: '/messages', permanent: true },
  { source: '/specialists-partners/recover', destination: '/forgot-password', permanent: true },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      ...encyclopediaConditionRedirects,
      ...legacyTeamPartnerRedirects,
      ...legacySpecialistRedirects,
      { source: '/care-guides/caregiver-self-care-boundaries', destination: '/content/caregiver-burnout', permanent: true },
      { source: '/care-guides/fetal-alcohol-spectrum-support', destination: '/care-guides/prenatal-exposure-neurodevelopment-support/', permanent: true },
      { source: '/care-guides/gambling-disorder-family-financial-safety', destination: '/care-guides/compulsive-financial-behavior-family-safety/', permanent: true },
      { source: '/care-guides/nicotine-dependence-cessation-support', destination: '/care-guides/dependence-cessation-relapse-support/', permanent: true },
      { source: '/evidence-guides/safe-screening-tools-explainer', destination: '/evidence-guides/safe-screening-tools/', permanent: true },
      { source: '/evidence-guides/first-mental-health-appointment-guide', destination: '/care-guides/preparing-first-mental-health-appointment/', permanent: true },
      { source: '/evidence-guides/autism-adhd-differences-guide', destination: '/comparisons/autism-vs-adhd/', permanent: true },
      { source: '/evidence-guides/puberty-body-safety-inclusive-guide', destination: '/care-guides/puberty-personal-safety-special-needs/', permanent: true },
      { source: '/evidence-guides/sibling-and-family-balance', destination: '/care-guides/sibling-responsibility-boundaries-plan/', permanent: true },
      { source: '/evidence-guides/supported-decision-making-transition-guide', destination: '/evidence-guides/supported-adulthood-transition/', permanent: true },
      { source: '/evidence-guides/caregiver-wellbeing', destination: '/content/caregiver-burnout', permanent: true },
      { source: '/capabilities/deafness', destination: '/capabilities/hearing-loss/', permanent: true },
      { source: '/content/capabilities-deafness', destination: '/capabilities/hearing-loss/', permanent: true },
      { source: '/content/capabilities-hub', destination: '/capabilities/', permanent: true },
      { source: '/content/capabilities-:slug', destination: '/capabilities/:slug/', permanent: true },
      { source: '/content/comparisons-hub', destination: '/comparisons/', permanent: true },
      { source: '/content/comparisons-:slug', destination: '/comparisons/:slug/', permanent: true },
    ];
  },
  async rewrites() {
    return [
      ...cognitiveLabLegacyRewrites,
      ...legacyHubRewrites,
      { source: '/resources/:slug', destination: '/content/:slug' },
      { source: '/resources/:slug/', destination: '/content/:slug' },
    ];
  },
  async headers() { return [{ source: '/:path*', headers: securityHeaders }]; },
};
export default nextConfig;
if (process.env.NODE_ENV === 'development') initOpenNextCloudflareForDev();
