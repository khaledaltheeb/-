import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

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
  const publicRule = (userAgent: string) => ({
    userAgent,
    allow: '/',
  });

  return {
    rules: [publicRule('*'), ...DISCOVERY_CRAWLERS.map(publicRule)],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
