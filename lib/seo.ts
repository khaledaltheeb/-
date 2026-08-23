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

// Long-tail search-intent phrases for the homepage metadata only.
// The list mixes transactional, local, diagnostic, informational and family-support intents.
const HOMEPAGE_SEARCH_INTENT_KEYWORDS = [
  'طبيب نفسي اونلاين',
  'دكتور نفسي اونلاين',
  'اخصائي نفسي اونلاين',
  'معالج نفسي اونلاين',
  'استشارة نفسية اون لاين',
  'استشارة اون لاين',
  'استشارة نفسية عبر الانترنت',
  'جلسات علاج نفسي اونلاين',
  'حجز طبيب نفسي اونلاين',
  'طبيب نفسي عربي اونلاين',
  'اخصائي نفسي عربي اونلاين',
  'استشارة اسرية اونلاين',
  'استشارة زوجية اونلاين',
  'استشارة تربوية اونلاين',
  'دعم نفسي اونلاين',
  'علاج القلق اونلاين',
  'علاج الاكتئاب اونلاين',
  'علاج نوبات الهلع اونلاين',
  'علاج الوسواس القهري اونلاين',
  'علاج الرهاب الاجتماعي اونلاين',
  'علاج اضطراب ما بعد الصدمة اونلاين',
  'طبيب نفسي في عمان',
  'اخصائي نفسي في عمان',
  'معالج نفسي في عمان',
  'مركز نفسي في عمان',
  'عيادة نفسية في عمان',
  'استشارات نفسية في عمان',
  'مركز علاج توحد في عمان',
  'مركز توحد في عمان',
  'تشخيص التوحد في عمان',
  'اخصائي توحد في عمان',
  'مركز تدخل مبكر في عمان',
  'مركز تربية خاصة في عمان',
  'مركز صعوبات تعلم في عمان',
  'اخصائي صعوبات تعلم في عمان',
  'مركز نطق وتخاطب في عمان',
  'اخصائي نطق ولغة في عمان',
  'علاج وظيفي للاطفال في عمان',
  'تعديل سلوك للاطفال في عمان',
  'تحليل السلوك التطبيقي ABA في عمان',
  'تقييم نفسي للاطفال في عمان',
  'تقييم صعوبات التعلم',
  'تشخيص صعوبات التعلم',
  'علاج صعوبات التعلم عند الاطفال',
  'علامات صعوبات التعلم عند الاطفال',
  'اعراض التوحد عند الاطفال',
  'علامات التوحد المبكرة',
  'اختبار التوحد للاطفال',
  'تشخيص اضطراب طيف التوحد',
  'التدخل المبكر للتوحد',
  'علاج التوحد عند الاطفال',
  'تدريب مهارات التواصل للتوحد',
  'علاج النطق للاطفال',
  'تأخر الكلام عند الاطفال',
  'علاج تأخر النطق عند الاطفال',
  'اضطرابات النطق واللغة',
  'العلاج الوظيفي للاطفال',
  'التكامل الحسي للاطفال',
  'فرط الحركة وتشتت الانتباه عند الاطفال',
  'تشخيص ADHD عند الاطفال',
  'علاج فرط الحركة وتشتت الانتباه',
  'تعديل السلوك للاطفال',
  'خطة تربوية فردية',
  'برنامج تربوي فردي لذوي الاحتياجات الخاصة',
  'التربية الخاصة للاطفال',
  'التربية الدامجة',
  'الدمج المدرسي لذوي الاعاقة',
  'حقوق ذوي الاعاقة في التعليم',
  'دعم اسر ذوي الاحتياجات الخاصة',
  'ارشاد اسر اطفال التوحد',
  'كيف اتعامل مع طفل التوحد',
  'كيف اتعامل مع طفل فرط الحركة',
  'كيف اساعد طفل لديه صعوبات تعلم',
  'الصحة النفسية للاطفال',
  'الصحة النفسية للمراهقين',
  'مشاكل المراهقين النفسية',
  'اعراض الاكتئاب',
  'اعراض القلق',
  'اعراض الوسواس القهري',
  'اعراض نوبات الهلع',
  'متى احتاج طبيب نفسي',
  'الفرق بين الطبيب النفسي والاخصائي النفسي',
  'اختبار الاكتئاب',
  'اختبار القلق',
  'اختبارات نفسية اونلاين',
  'مقاييس نفسية عربية',
  'علاج الادمان',
  'مركز علاج ادمان',
  'اعراض الانسحاب من الادمان',
  'التعافي من الادمان',
  'دعم اسرة المدمن',
  'سرطان الاطفال',
  'اعراض سرطان الاطفال',
  'علاج سرطان الاطفال',
  'مركز سرطان الاطفال',
  'دعم نفسي للاطفال المصابين بالسرطان',
  'دعم اسر اطفال السرطان',
  'التعامل مع الطفل المصاب بالسرطان',
  'النجاة بعد سرطان الاطفال',
];

// Branded query variants reinforce the Rawafid entity around the platform's real topical scope.
// Kept in metadata only; not rendered as hidden body text.
const HOMEPAGE_BRAND_KEYWORDS = [
  'روافد',
  'روافد الصحيه',
  'روافد الصحية',
  'روافد للصحة',
  'روافد للصحه',
  'روافد للصحة النفسيه',
  'روافد للصحة النفسية',
  'منصة روافد',
  'منصه روافد',
  'موقع روافد',
  'روافد صحة',
  'روافد صحه',
  'روافد للصحة النفسية العربية',
  'روافد للصحه النفسيه',
  'روافد الصحة النفسية',
  'روافد الصحه النفسيه',
  'روافد الصحة النفسية العربية',
  'روافد علم النفس',
  'روافد لعلم النفس',
  'روافد النفسية',
  'روافد النفسيه',
  'روافد للاستشارات النفسية',
  'روافد استشارات نفسية',
  'روافد استشارة نفسية',
  'روافد طبيب نفسي',
  'روافد دكتور نفسي',
  'روافد اخصائي نفسي',
  'روافد معالج نفسي',
  'روافد طبيب نفسي اونلاين',
  'روافد استشارة نفسية اونلاين',
  'روافد للاستشارات اونلاين',
  'روافد الدعم النفسي',
  'روافد للدعم النفسي',
  'روافد العلاج النفسي',
  'روافد للعلاج النفسي',
  'روافد القلق',
  'روافد الاكتئاب',
  'روافد الوسواس القهري',
  'روافد نوبات الهلع',
  'روافد الصحة النفسية للاطفال',
  'روافد الصحة النفسية للمراهقين',
  'روافد الطفل',
  'روافد صحة الطفل',
  'روافد التربية',
  'روافد للتربية',
  'روافد التربية الخاصة',
  'روافد للتربية الخاصة',
  'روافد التربية الدامجة',
  'روافد للتربية الدامجة',
  'روافد الدمج',
  'روافد للدمج',
  'روافد الدمج المدرسي',
  'روافد ذوي الاحتياجات الخاصة',
  'روافد لذوي الاحتياجات الخاصة',
  'روافد ذوي الاعاقة',
  'روافد لذوي الاعاقة',
  'روافد أصحاب الهمم',
  'روافد للتأهيل',
  'روافد التأهيل',
  'روافد التوحد',
  'روافد للتوحد',
  'روافد طيف التوحد',
  'روافد اضطراب طيف التوحد',
  'روافد علاج التوحد',
  'روافد تشخيص التوحد',
  'روافد مركز توحد',
  'روافد اخصائي توحد',
  'روافد تدخل مبكر',
  'روافد للتدخل المبكر',
  'روافد تحليل السلوك التطبيقي',
  'روافد ABA',
  'روافد تعديل السلوك',
  'روافد صعوبات التعلم',
  'روافد لصعوبات التعلم',
  'روافد تشخيص صعوبات التعلم',
  'روافد علاج صعوبات التعلم',
  'روافد النطق واللغة',
  'روافد علاج النطق',
  'روافد التخاطب',
  'روافد العلاج الوظيفي',
  'روافد التكامل الحسي',
  'روافد فرط الحركة وتشتت الانتباه',
  'روافد ADHD',
  'روافد الأسرة',
  'روافد للاسرة',
  'روافد الإرشاد الأسري',
  'روافد للارشاد الاسري',
  'روافد الاستشارات الأسرية',
  'روافد دعم الأسرة',
  'روافد الإدمان',
  'روافد علاج الإدمان',
  'روافد التعافي',
  'روافد للتعافي',
  'روافد سرطان الأطفال',
  'روافد لسرطان الأطفال',
  'روافد أورام الأطفال',
  'روافد مركز سرطان الأطفال',
  'روافد دعم أطفال السرطان',
  'روافد المعرفة الصحية',
  'روافد الموسوعة الصحية',
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
    ? Array.from(new Set([
        ...(input.keywords || []),
        ...HOMEPAGE_BRAND_KEYWORDS,
        ...HOMEPAGE_COMPETITOR_KEYWORDS,
        ...HOMEPAGE_SEARCH_INTENT_KEYWORDS,
      ]))
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
