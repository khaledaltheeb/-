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
  'autism', 'depression', 'alcohol-use-disorder', 'cannabis-use-disorder', 'gambling-related-harms', 'gaming-disorder',
  'inhalant-use-disorder', 'nicotine-tobacco-dependence', 'opioid-use-disorder', 'polysubstance-use-and-overdose-risk',
  'sedative-benzodiazepine-use-disorder', 'stimulant-use-disorder',
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

const legacyAudienceRedirects = [
  { source: '/audiences', destination: '/start-here', permanent: true },
  { source: '/audiences/person', destination: '/start-here#person', permanent: true },
  { source: '/audiences/family', destination: '/start-here#family', permanent: true },
  { source: '/audiences/teacher', destination: '/start-here#teacher', permanent: true },
  { source: '/audiences/student', destination: '/start-here#student', permanent: true },
  { source: '/audiences/professional', destination: '/start-here#professional', permanent: true },
];

const legacyThinGuideRedirects = [
  { source: '/guides/adhd-guide', destination: '/capabilities/adhd/', permanent: true },
  { source: '/guides/agoraphobia-guide', destination: '/evidence-guides/clinical-anxiety/', permanent: true },
  { source: '/guides/anxiety-guide', destination: '/evidence-guides/clinical-anxiety/', permanent: true },
  { source: '/guides/autism-spectrum-guide', destination: '/content/autism', permanent: true },
  { source: '/guides/bipolar-disorder-guide', destination: '/evidence-guides/bipolar-disorder-safe-guide/', permanent: true },
  { source: '/guides/burnout-guide', destination: '/evidence-guides/stress-burnout-depression-differences-guide/', permanent: true },
  { source: '/guides/emotion-regulation-guide', destination: '/comparisons/emotional-intelligence-vs-emotion-regulation/', permanent: true },
  { source: '/guides/emotional-intelligence-guide', destination: '/comparisons/emotional-intelligence-vs-emotion-regulation/', permanent: true },
  { source: '/guides/generalized-anxiety-disorder-guide', destination: '/care-guides/generalized-anxiety-daily-support/', permanent: true },
  { source: '/guides/insomnia-guide', destination: '/evidence-guides/insomnia-and-sleep/', permanent: true },
  { source: '/guides/mental-health-guide', destination: '/evidence-guides/mental-health-foundations/', permanent: true },
  { source: '/guides/obsessive-compulsive-disorder-guide', destination: '/care-guides/ocd-first-assessment-preparation/', permanent: true },
  { source: '/guides/panic-disorder-guide', destination: '/evidence-guides/panic-disorder-safe-guide/', permanent: true },
  { source: '/guides/post-traumatic-stress-disorder-guide', destination: '/evidence-guides/ptsd-safe-guide/', permanent: true },
  { source: '/guides/resilience-guide', destination: '/content/family-resilience', permanent: true },
  { source: '/guides/self-esteem-guide', destination: '/comparisons/self-esteem-vs-self-confidence/', permanent: true },
  { source: '/guides/social-anxiety-guide', destination: '/comparisons/introversion-vs-social-anxiety/', permanent: true },
  { source: '/guides/stress-guide', destination: '/evidence-guides/stress-burnout-depression-differences-guide/', permanent: true },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      ...encyclopediaConditionRedirects,
      ...legacyAudienceRedirects,
      ...legacyThinGuideRedirects,
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
