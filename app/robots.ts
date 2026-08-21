import type { MetadataRoute } from 'next';
import { INDEXING_ENABLED, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) {
    return {
      rules: { userAgent: '*', disallow: '/' },
      host: SITE_URL,
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', '/account/', '/login', '/forgot-password', '/reset-password', '/auth/',
        '/specialist/', '/center/', '/messages/', '/appointments/', '/notifications/',
        '/community/join', '/search?', '/api/private/',
      ],
    },
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemaps/static.xml`,
      `${SITE_URL}/sitemaps/content.xml`,
      `${SITE_URL}/sitemaps/taxonomy.xml`,
      `${SITE_URL}/sitemaps/specialists.xml`,
      `${SITE_URL}/sitemaps/centers.xml`,
      `${SITE_URL}/sitemaps/community.xml`,
    ],
    host: SITE_URL,
  };
}
