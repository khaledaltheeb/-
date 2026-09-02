import type { MetadataRoute } from 'next';
import { SITE_HOSTNAME, SITE_URL } from '@/lib/seo';

const PRIVATE_PATHS = [
  '/admin/',
  '/account/',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/auth/',
  '/specialist/',
  '/center/',
  '/messages/',
  '/appointments/',
  '/notifications/',
  '/community/join',
  '/search?',
  '/ai-search?',
  '/api/private/',
];

const DISCOVERY_CRAWLERS = [
  'Googlebot',
  'Google-Extended',
  'Bingbot',
  'DuckDuckBot',
  'Applebot',
  'Applebot-Extended',
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Amazonbot',
  'Bytespider',
  'CCBot',
  'meta-externalagent',
  'CloudflareBrowserRenderingCrawler',
];

export default function robots(): MetadataRoute.Robots {
  // Temporary staging on workers.dev stays intentionally non-indexable.
  // The canonical production hostname must never depend on an optional env flag
  // to permit crawling.
  if (SITE_HOSTNAME.endsWith('.workers.dev')) {
    return {
      rules: { userAgent: '*', disallow: '/' },
      host: SITE_URL,
    };
  }

  const publicRule = (userAgent: string) => ({
    userAgent,
    allow: '/',
    disallow: PRIVATE_PATHS,
  });

  return {
    rules: [publicRule('*'), ...DISCOVERY_CRAWLERS.map(publicRule)],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
