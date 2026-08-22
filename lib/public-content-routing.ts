import { SITE_URL } from '@/lib/seo';

export type PublicContentLinkable = {
  slug: string;
  canonical_url?: string | null;
  content_type?: string | null;
};

export function publicContentHref(item: PublicContentLinkable) {
  const canonical = item.canonical_url?.trim();
  if (canonical) {
    if (canonical.startsWith('/')) return canonical;
    try {
      const target = new URL(canonical);
      const site = new URL(SITE_URL);
      if (target.origin === site.origin) return `${target.pathname}${target.search}${target.hash}`;
    } catch {
      // Fall back to the stable generic content route below.
    }
  }
  return `/content/${encodeURIComponent(item.slug)}`;
}

export function publicContentTypeLabel(type?: string | null) {
  switch (type) {
    case 'guide': return 'دليل';
    case 'research': return 'بحث ودراسة';
    case 'article': return 'مقال';
    case 'resource': return 'مورد';
    case 'glossary_term': return 'مصطلح';
    case 'condition': return 'حالة';
    case 'comparison': return 'مقارنة';
    case 'landing_page': return 'صفحة رئيسية';
    case 'tool': return 'أداة';
    case 'assessment': return 'تقييم إرشادي';
    case 'intervention': return 'تدخل علاجي';
    default: return 'محتوى معرفي';
  }
}
