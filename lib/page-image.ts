export type PageImageKind =
  | 'article'
  | 'encyclopedia'
  | 'care-guide'
  | 'special-needs'
  | 'family-guide'
  | 'addiction'
  | 'capability'
  | 'comparison';

const VALID_KINDS = new Set<PageImageKind>([
  'article',
  'encyclopedia',
  'care-guide',
  'special-needs',
  'family-guide',
  'addiction',
  'capability',
  'comparison',
]);

export function normalizePageImageKind(value?: string | null): PageImageKind {
  return value && VALID_KINDS.has(value as PageImageKind) ? value as PageImageKind : 'article';
}

export function pageImageKindLabel(kind: PageImageKind) {
  switch (kind) {
    case 'encyclopedia': return 'الموسوعة المعرفية · روافد';
    case 'care-guide': return 'دليل رعاية عملي · روافد';
    case 'special-needs': return 'الاحتياجات الخاصة والدمج · روافد';
    case 'family-guide': return 'دليل الأسرة · روافد';
    case 'addiction': return 'الإدمان والتعافي · روافد';
    case 'capability': return 'مرجع القدرات والوصول · روافد';
    case 'comparison': return 'موسوعة المقارنات المنهجية · روافد';
    default: return 'معرفة عربية موثوقة · روافد';
  }
}

export function genericPageImagePath(title: string, kind: PageImageKind = 'article') {
  const safeTitle = String(title || '').replace(/\s+/gu, ' ').trim();
  const params = new URLSearchParams({ title: safeTitle, kind });
  return `/page-image?${params.toString()}`;
}

export function resolveVisiblePageImage(input: {
  title: string;
  kind?: PageImageKind;
  slug?: string | null;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
}) {
  const title = String(input.title || '').replace(/\s+/gu, ' ').trim() || 'روافد';
  const kind = input.kind || 'article';
  const slug = String(input.slug || '').trim();
  const curated = String(input.featuredImageUrl || '').trim();

  if (curated) {
    return {
      src: curated,
      alt: String(input.featuredImageAlt || '').trim() || title,
      width: 1200,
      height: 675,
      generatedFallback: false,
    } as const;
  }

  const routeSpecific = slug
    ? kind === 'family-guide'
      ? `/family-guide/images/${encodeURIComponent(slug)}`
      : kind === 'addiction'
        ? `/addiction/images/${encodeURIComponent(slug)}`
        : kind === 'capability'
          ? `/capabilities/${encodeURIComponent(slug)}/cover`
          : kind === 'comparison'
            ? `/comparisons/${encodeURIComponent(slug)}/cover`
            : ''
    : '';

  if (routeSpecific) {
    return {
      src: routeSpecific,
      alt: `صورة توضيحية من منصة روافد لصفحة «${title}»`,
      width: 1200,
      height: 675,
      generatedFallback: true,
    } as const;
  }

  return {
    src: genericPageImagePath(title, kind),
    alt: `صورة توضيحية من منصة روافد لصفحة «${title}»`,
    width: 1280,
    height: 720,
    generatedFallback: true,
  } as const;
}
