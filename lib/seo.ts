import type { Metadata } from 'next';
import { RAWAFID_BRAND_NAME, RAWAFID_BRAND_SHORT } from '@/lib/theme';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://rawafid-platform-staging.khaledaltheeb.workers.dev').replace(/\/$/, '');
export const BRAND_NAME = RAWAFID_BRAND_NAME;
export const BRAND_SHORT = RAWAFID_BRAND_SHORT;
export const DEFAULT_LOCALE = 'ar_AR';
export const DEFAULT_DESCRIPTION = 'روافد منصة عربية للمعرفة الموثوقة في الصحة النفسية والتربية الخاصة والتوحد وصعوبات التعلم وسرطان الأطفال والتعافي، مع أدلة عملية ومختصين ومراكز.';

const INDEXING_ENABLED = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
const HOME_TITLE = 'روافد | الصحة النفسية والتربية الخاصة وسرطان الأطفال';
const HOME_DESCRIPTION = DEFAULT_DESCRIPTION;
const DEFAULT_SOCIAL_IMAGE_PATH = '/seo-card';

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

function clampTitle(value: string) {
  const clean = value.replace(/\s+/g, ' ').trim();
  const suffix = ` | ${BRAND_SHORT}`;
  if (clean === BRAND_SHORT || clean === BRAND_NAME) return clean;
  if (clean.endsWith(suffix)) return clean.slice(0, 60).trim();
  const available = Math.max(20, 60 - suffix.length);
  const base = clean.length > available ? `${clean.slice(0, available - 1).trim()}…` : clean;
  return `${base}${suffix}`;
}

function clampDescription(value?: string | null) {
  const clean = (value || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim();
  return clean.length > 160 ? `${clean.slice(0, 159).trimEnd()}…` : clean;
}

export type SeoMetadataInput = {
  title: string;
  description?: string | null;
  path: string;
  index?: boolean;
  follow?: boolean;
  type?: 'website' | 'article' | 'profile';
  image?: string | null;
  keywords?: string[];
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: { name: string; url?: string }[];
  hreflang?: Record<string, string>;
};

export function buildSeoMetadata(input: SeoMetadataInput): Metadata {
  const isHomepage = input.path === '/';
  const title = isHomepage ? HOME_TITLE : clampTitle(input.title);
  const description = isHomepage ? HOME_DESCRIPTION : clampDescription(input.description);
  const canonical = absoluteUrl(input.path);
  const canIndex = INDEXING_ENABLED && input.index !== false;
  const canFollow = input.follow !== false;
  const usesDefaultImage = !input.image;
  const image = absoluteUrl(input.image || DEFAULT_SOCIAL_IMAGE_PATH);
  const languages = input.hreflang
    ? Object.fromEntries(Object.entries(input.hreflang).map(([key, value]) => [key, absoluteUrl(value)]))
    : undefined;

  // Compatibility only. Google does not use meta keywords as a ranking signal.
  const keywords = input.keywords?.length ? Array.from(new Set(input.keywords)).slice(0, 20) : undefined;
  const openGraphImages = usesDefaultImage
    ? [{ url: image, width: 1200, height: 630, alt: 'روافد — منصة عربية للمعرفة الصحية والنفسية الموثوقة' }]
    : [{ url: image, alt: input.title }];

  return {
    title: { absolute: title },
    description,
    keywords,
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
    alternates: { canonical, languages },
    robots: {
      index: canIndex,
      follow: canFollow,
      noarchive: !canIndex,
      nosnippet: !canIndex,
      googleBot: {
        index: canIndex,
        follow: canFollow,
        noimageindex: !canIndex,
        ...(canIndex ? {
          'max-image-preview': 'large' as const,
          'max-snippet': -1,
          'max-video-preview': -1,
        } : {}),
      },
    },
    openGraph: {
      type: input.type === 'article' ? 'article' : 'website',
      url: canonical,
      title,
      description,
      siteName: BRAND_SHORT,
      locale: DEFAULT_LOCALE,
      images: openGraphImages,
      ...(input.type === 'article'
        ? {
            publishedTime: input.publishedTime || undefined,
            modifiedTime: input.modifiedTime || undefined,
            authors: input.authors?.map((author) => author.url || author.name),
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export function organizationJsonLd() {
  const logoUrl = `${SITE_URL}/pwa-icon-512`;
  const topics = [
    'الصحة النفسية',
    'علم النفس',
    'التربية الخاصة',
    'التربية الدامجة',
    'اضطراب طيف التوحد',
    'صعوبات التعلم',
    'ذوو الاحتياجات الخاصة',
    'الإدمان والتعافي',
    'سرطان الأطفال',
    'دعم الأسرة',
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        alternateName: BRAND_SHORT,
        url: `${SITE_URL}/`,
        description: DEFAULT_DESCRIPTION,
        logo: {
          '@type': 'ImageObject',
          '@id': `${SITE_URL}/#logo`,
          url: logoUrl,
          contentUrl: logoUrl,
          width: 512,
          height: 512,
          caption: BRAND_SHORT,
        },
        image: { '@id': `${SITE_URL}/#logo` },
        knowsAbout: topics,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: BRAND_SHORT,
        alternateName: BRAND_NAME,
        url: `${SITE_URL}/`,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'ar',
        publisher: { '@id': `${SITE_URL}/#organization` },
        about: topics.map((name) => ({ '@type': 'Thing', name })),
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
