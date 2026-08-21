import type { Metadata } from 'next';
import { RAWAFID_BRAND_NAME, RAWAFID_BRAND_SHORT } from '@/lib/theme';

export const SITE_URL = (process.env.RAWAFID_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').replace(/\/$/, '');
export const BRAND_NAME = RAWAFID_BRAND_NAME;
export const BRAND_SHORT = RAWAFID_BRAND_SHORT;
export const DEFAULT_LOCALE = 'ar_AR';
export const DEFAULT_DESCRIPTION = 'منصة روافد العربية للصحة النفسية والتعافي والدمج والتمكين: معرفة موثوقة، أدلة عملية، مختصون ومراكز وخدمات مترابطة ضمن تجربة مؤسسية آمنة.';

export const INDEXING_ENABLED = process.env.RAWAFID_ALLOW_INDEXING === 'true' || process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

function clampTitle(value: string) {
  const clean = value.replace(/\s+/g, ' ').trim();
  const suffix = ` | ${BRAND_NAME}`;
  if (clean.endsWith(BRAND_NAME)) return clean.slice(0, 60).trim();
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
  const title = clampTitle(input.title);
  const description = clampDescription(input.description);
  const canonical = absoluteUrl(input.path);
  const canIndex = INDEXING_ENABLED && input.index !== false;
  const canFollow = canIndex && input.follow !== false;
  const image = input.image ? absoluteUrl(input.image) : undefined;
  const languages = input.hreflang
    ? Object.fromEntries(Object.entries(input.hreflang).map(([key, value]) => [key, absoluteUrl(value)]))
    : undefined;

  return {
    title: { absolute: title },
    description,
    keywords: input.keywords?.length ? input.keywords : undefined,
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
      siteName: BRAND_NAME,
      locale: DEFAULT_LOCALE,
      images: image ? [{ url: image, alt: input.title }] : undefined,
      ...(input.type === 'article'
        ? { publishedTime: input.publishedTime || undefined, modifiedTime: input.modifiedTime || undefined, authors: input.authors?.map((author) => author.url || author.name) }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        alternateName: BRAND_SHORT,
        url: SITE_URL,
        logo: `${SITE_URL}/icons/rawafid-app.svg`,
        description: DEFAULT_DESCRIPTION,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: BRAND_NAME,
        alternateName: BRAND_SHORT,
        url: SITE_URL,
        inLanguage: 'ar',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
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
