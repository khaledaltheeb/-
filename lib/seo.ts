import type { Metadata } from 'next';
import { RAWAFID_BRAND_NAME, RAWAFID_BRAND_SHORT } from '@/lib/theme';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://rawafid-platform-staging.khaledaltheeb.workers.dev').replace(/\/$/, '');
export const BRAND_NAME = RAWAFID_BRAND_NAME;
export const BRAND_SHORT = RAWAFID_BRAND_SHORT;
export const DEFAULT_LOCALE = 'ar_AR';
export const DEFAULT_DESCRIPTION = 'منصة روافد العربية للصحة النفسية والتعافي والدمج والتمكين: معرفة موثوقة، أدلة عملية، مختصون ومراكز وخدمات مترابطة ضمن تجربة مؤسسية آمنة.';

const INDEXING_ENABLED = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

// Competitor/entity names are emitted only as homepage metadata keywords.
// They are not rendered as visible page copy and are not injected as hidden HTML/CSS text.
const HOMEPAGE_COMPETITOR_KEYWORDS = [
  'الطبي',
  'ويب طب',
  'موضوع',
  'كل يوم معلومة طبية',
  'الكونسلتو',
  'صحتك',
  'حلوها',
  'سوبرماما',
  'طبكان',
  'عرب ثيرابي',
  'لبيه',
  'شيزلونج',
  'O7 Therapy',
  'تكلّم',
  'أوبستان',
  'نفسيتي Nafseeti',
  'استراحة Estaraht',
  'أيادي Ayadi Health',
  'تهون Tuhoon',
  'حاكيني Hakeeni',
  'سيطر Psyter',
  'جذور Roots',
  'ونس Wanas',
  'نفسجي Nafsaji',
  'منصة نفسي',
  'نفسيتى Nafsiaty',
  'صفاء Safaa',
  'Mentali.ai',
  'أكاديمية سكينة',
  'سلامتك',
  'محطات',
  'روى',
  'مجانين',
  'المركز الوطني لتعزيز الصحة النفسية',
  'صحتك النفسية وزارة الصحة القطرية',
  'تحليل السلوك التطبيقي بالعربي ABA Arabic',
  'أطفال الخليج ذوي الاحتياجات الخاصة',
  'مدينة الشارقة للخدمات الإنسانية',
  'مركز الملك سلمان لأبحاث الإعاقة',
  'هيئة رعاية الأشخاص ذوي الإعاقة',
  'المجلس الأعلى لحقوق الأشخاص ذوي الإعاقة',
  'هيئة زايد لأصحاب الهمم',
  'جمعية أسر التوحد',
  'الجمعية السعودية للتوحد',
  'مركز الشارقة لصعوبات التعلم',
  'مركز تقويم وتعليم الطفل',
  'مؤسسة ومركز الحسين للسرطان',
  'مستشفى سرطان الأطفال 57357',
  'مركز سرطان الأطفال في لبنان CCCL',
  'جمعية سند لدعم الأطفال المرضى بالسرطان',
];

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
  const canFollow = input.follow !== false;
  const image = input.image ? absoluteUrl(input.image) : undefined;
  const languages = input.hreflang
    ? Object.fromEntries(Object.entries(input.hreflang).map(([key, value]) => [key, absoluteUrl(value)]))
    : undefined;
  const keywords = input.path === '/'
    ? Array.from(new Set([...(input.keywords || []), ...HOMEPAGE_COMPETITOR_KEYWORDS]))
    : input.keywords;

  return {
    title: { absolute: title },
    description,
    keywords: keywords?.length ? keywords : undefined,
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
  const logoUrl = `${SITE_URL}/icons/rawafid-app.svg`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        alternateName: BRAND_SHORT,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        logo: {
          '@type': 'ImageObject',
          '@id': `${SITE_URL}/#logo`,
          url: logoUrl,
          contentUrl: logoUrl,
          caption: BRAND_NAME,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: BRAND_NAME,
        alternateName: BRAND_SHORT,
        url: SITE_URL,
        inLanguage: 'ar',
        publisher: { '@id': `${SITE_URL}/#organization` },
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
