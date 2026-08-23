import type { MetadataRoute } from 'next';
import { INDEXING_ENABLED, SITE_URL } from '@/lib/seo';

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
];

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) {
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
