import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { getCognitivePageBySlug, getCognitivePageIndexItem } from '@/lib/cognitive-program';
import { contentReviewProvenance } from '@/lib/review-provenance';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;
type ReferenceItem = { title?: string; url?: string; publisher?: string; year?: string | number };
type RelatedItem = { id: string; slug: string; title: string; excerpt: string | null; content_type: string; score: number };
type TaxonomyNode = { slug: string; name_ar: string };
type UnknownRecord = Record<string, unknown>;
type FaqItem = { question: string; answer: string };
type ContentRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
  schema_json: Record<string, unknown>;
  content_type: string;
  audience: string[];
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  published_at: string | null;
  updated_at: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[];
  semantic_terms: string[];
  search_intent: string | null;
  author_display_name: string | null;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: unknown;
  medical_disclaimer: string | null;
  sector_id: string | null;
  category_id: string | null;
  sectors: TaxonomyNode | TaxonomyNode[] | null;
  categories: TaxonomyNode | TaxonomyNode[] | null;
  generated_program?: boolean;
};

const GENERATED_RELEASE = '2026-08-14T00:00:00.000Z';

async function getDatabaseRecord(slug: string): Promise<ContentRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_json,body_text,schema_json,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,search_intent,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,sector_id,category_id,sectors!content_sector_id_fkey(slug,name_ar),categories!content_category_id_fkey(slug,name_ar)')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();
  return data as ContentRecord | null;
}

function getGeneratedRecord(slug: string): ContentRecord | null {
  const page = getCognitivePageBySlug(slug);
  if (!page) return null;
  return {
    id: `cognitive:${page.slug}`,
    slug: page.slug,
    title: page.title,
    excerpt: page.excerpt,
    body_json: page.bodyJson,
    body_text: page.bodyText,
    schema_json: page.schemaJson,
    content_type: page.contentType,
    audience: page.audience,
    seo_title: page.seoTitle,
    seo_description: page.seoDescription,
    canonical_url: `/content/${page.slug}`,
    robots_index: true,
    robots_follow: true,
    published_at: GENERATED_RELEASE,
    updated_at: GENERATED_RELEASE,
    featured_image_url: null,
    featured_image_alt: null,
    primary_keyword: page.primaryKeyword,
    secondary_keywords: page.secondaryKeywords,
    semantic_terms: page.semanticTerms,
    search_intent: page.searchIntent,
    author_display_name: 'فريق روافد التحريري',
    reviewer_display_name: null,
    reviewer_credentials: null,
    last_reviewed_at: null,
    references_json: page.references,
    medical_disclaimer: null,
    sector_id: 'f9af56ce-734c-4867-9999-957db0933414',
    category_id: `cognitive:${page.categorySlug}`,
    sectors: { slug: 'knowledge', name_ar: 'المعرفة والموسوعة' },
    categories: { slug: page.categorySlug, name_ar: page.categoryName },
    generated_program: true,
  };
}

async function getPublishedRecord(slug: string): Promise<ContentRecord | null> {
  return (await getDatabaseRecord(slug)) ?? getGeneratedRecord(slug);
}

function taxonomyNode(value: TaxonomyNode | TaxonomyNode[] | null): TaxonomyNode | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function safeReferences(value: unknown): ReferenceItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ReferenceItem[] => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const row = item as UnknownRecord;
    const title = typeof row.title === 'string' ? row.title : undefined;
    const url = typeof row.url === 'string' && /^https:\/\//i.test(row.url) ? row.url : undefined;
    const publisher = typeof row.publisher === 'string' ? row.publisher : undefined;
    const year = typeof row.year === 'string' || typeof row.year === 'number' ? row.year : undefined;
    return title ? [{ title, url, publisher, year }] : [];
  }).slice(0, 50);
}

function visibleFaq(value: unknown): FaqItem[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  const root = value as UnknownRecord;
  const blocks = Array.isArray(root.blocks) ? root.blocks : [];
  return blocks.flatMap((block): FaqItem[] => {
    if (!block || typeof block !== 'object' || Array.isArray(block)) return [];
    const row = block as UnknownRecord;
    if (row.type !== 'faq' || !Array.isArray(row.items)) return [];
    return row.items.flatMap((entry): FaqItem[] => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
      const item = entry as UnknownRecord;
      return typeof item.question === 'string' && typeof item.answer === 'string'
        ? [{ question: item.question, answer: item.answer }]
        : [];
    });
  }).slice(0, 40);
}

function curatedRelatedSlugs(schema: Record<string, unknown>): string[] {
  const raw = schema.curated_related_slugs;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string').slice(0, 6);
}

async function relatedContent(record: ContentRecord): Promise<RelatedItem[]> {
  const slugs = curatedRelatedSlugs(record.schema_json);
  const local = slugs.flatMap((slug): RelatedItem[] => {
    const item = getCognitivePageIndexItem(slug);
    return item ? [{ id: `cognitive:${slug}`, slug, title: item.title, excerpt: item.excerpt, content_type: item.contentType, score: 100 }] : [];
  });
  const localSlugs = new Set(local.map((item) => item.slug));
  const missing = slugs.filter((slug) => !localSlugs.has(slug));
  const supabase = await createClient();
  let remote: RelatedItem[] = [];
  if (missing.length) {
    const { data } = await supabase
      .from('content')
      .select('id,slug,title,excerpt,content_type')
      .in('slug', missing)
      .eq('status', 'published')
      .eq('robots_index', true)
      .lte('published_at', new Date().toISOString());
    remote = (data ?? []).map((item) => ({ ...item, score: 100 } as RelatedItem));
  }
  if (slugs.length) {
    const bySlug = new Map([...local, ...remote].map((item) => [item.slug, item]));
    return slugs.flatMap((slug) => {
      const item = bySlug.get(slug);
      return item ? [item] : [];
    });
  }
  if (record.generated_program) return [];
  const { data } = await supabase.rpc('related_public_content', { p_content_id: record.id, p_limit: 6 });
  return (data ?? []) as RelatedItem[];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const record = await getPublishedRecord(slug);
  if (!record) return {};
  const keywords = [record.primary_keyword, ...record.secondary_keywords, ...record.semantic_terms.slice(0, 12)]
    .filter((item): item is string => typeof item === 'string' && item.length > 0);
  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || `/content/${record.slug}`,
    index: record.robots_index,
    follow: record.robots_follow,
    type: ['article', 'guide', 'research', 'news', 'condition', 'protocol', 'intervention', 'assessment'].includes(record.content_type) ? 'article' : 'website',
    image: record.featured_image_url,
    keywords,
    publishedTime: record.published_at,
    modifiedTime: record.updated_at,
    authors: record.generated_program ? undefined : record.author_display_name ? [{ name: record.author_display_name }] : undefined,
  });
}

export default async function PublishedContentPage({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getPublishedRecord(slug);
  if (!record) notFound();

  const sector = taxonomyNode(record.sectors);
  const category = taxonomyNode(record.categories);
  const audiences = Array.isArray(record.audience) ? record.audience.map(String) : [];
  const references = safeReferences(record.references_json);
  const related = await relatedContent(record);
  const canonical = record.canonical_url || `/content/${record.slug}`;
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const faqItems = visibleFaq(record.body_json);
  const review = contentReviewProvenance(record);

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    ...(sector ? [{ name: sector.name_ar, path: `/sectors/${sector.slug}` }] : []),
    ...(category ? [{ name: category.name_ar, path: `/sections/${category.slug}` }] : []),
    { name: record.title, path: canonical },
  ]);

  const medicalTypes = new Set(['condition', 'protocol', 'intervention', 'assessment']);
  const schemaType = medicalTypes.has(record.content_type)
    ? 'MedicalWebPage'
    : ['article', 'guide', 'research', 'news'].includes(record.content_type)
      ? 'Article'
      : 'WebPage';
  const conditionId = `${url}#condition`;
  const termId = `${url}#defined-term`;
  const contentSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `${url}#content`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: record.title,
    description: record.seo_description || record.excerpt || undefined,
    inLanguage: 'ar',
    datePublished: record.published_at || undefined,
    dateModified: record.updated_at || undefined,
    lastReviewed: review.lastReviewedAt || undefined,
    author: record.generated_program
      ? { '@id': `${SITE_URL}/#organization` }
      : record.author_display_name
        ? { '@type': 'Person', name: record.author_display_name }
        : { '@id': `${SITE_URL}/#organization` },
    reviewedBy: review.reviewedBySchema,
    publisher: { '@id': `${SITE_URL}/#organization` },
    image: record.featured_image_url || undefined,
    keywords: [record.primary_keyword, ...record.secondary_keywords, ...record.semantic_terms.slice(0, 8)]
      .filter((item): item is string => typeof item === 'string' && item.length > 0)
      .join(', '),
    articleSection: category?.name_ar,
    wordCount: String(record.body_text ?? '').trim().split(/\s+/u).filter(Boolean).length,
    citation: references.flatMap((reference) => reference.url ? [reference.url] : []),
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };

  const conditionSchema = record.content_type === 'condition' ? {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    '@id': conditionId,
    name: record.title,
    description: record.seo_description || record.excerpt || undefined,
    url,
    alternateName: record.secondary_keywords.slice(0, 8),
  } : null;

  const termSchema = record.content_type === 'glossary_term' ? {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': termId,
    name: record.title,
    description: record.seo_description || record.excerpt || undefined,
    url,
    inLanguage: 'ar',
    alternateName: [...record.secondary_keywords, ...record.semantic_terms].slice(0, 12),
    ...(category ? {
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        '@id': `${SITE_URL}/sections/${category.slug}#termset`,
        name: category.name_ar,
        url: `${SITE_URL}/sections/${category.slug}`,
      },
    } : {}),
  } : null;

  if (conditionSchema) contentSchema.about = { '@id': conditionId };
  if (termSchema) contentSchema.about = { '@id': termId };

  const faqSchema = faqItems.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;

  const schemas = [
    breadcrumbs,
    contentSchema,
    ...(conditionSchema ? [conditionSchema] : []),
    ...(termSchema ? [termSchema] : []),
    ...(faqSchema ? [faqSchema] : []),
  ];

  return <>
    <SiteHeader />
    <main className="article-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link>
        {sector && <><span>/</span><Link href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link></>}
        {category && <><span>/</span><Link href={`/sections/${category.slug}`}>{category.name_ar}</Link></>}
        <span>/</span><span aria-current="page">{record.title}</span>
      </nav>
      <article>
        <header className="article-hero">
          <span className="eyebrow">{record.content_type}</span>
          <h1>{record.title}</h1>
          {record.excerpt && <p>{record.excerpt}</p>}
          <div className="article-meta">
            {record.author_display_name && <span>إعداد: {record.author_display_name}</span>}
            {review.reviewerName && <span>مراجعة: {review.reviewerName}{review.reviewerCredentials ? ` — ${review.reviewerCredentials}` : ''}</span>}
            {record.published_at && <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span>}
            {review.lastReviewedAt && <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(review.lastReviewedAt))}</span>}
          </div>
          {audiences.length > 0 && <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div>}
        </header>
        <div className="article-body">
          {record.featured_image_url && <figure className="article-featured-image">
            <Image src={record.featured_image_url} alt={record.featured_image_alt || record.title} width={1200} height={675} sizes="(max-width: 900px) 100vw, 900px" priority unoptimized />
          </figure>}
          <ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id} />
        </div>
        {record.medical_disclaimer && <aside className="medical-disclaimer" aria-label="إخلاء المسؤولية الطبية">
          <strong>تنبيه طبي</strong><p>{record.medical_disclaimer}</p><Link href="/disclaimer">إخلاء المسؤولية الكامل</Link>
        </aside>}
        {related.length > 0 && <section className="article-related" aria-labelledby="related-title">
          <div className="section-mini-heading"><div><span className="eyebrow">Topical Authority</span><h2 id="related-title">محتوى مرتبط</h2></div><span>روابط منتقاة من خريطة المفاهيم ونية البحث</span></div>
          <div className="related-content-grid">{related.map((item) => <article key={item.id}>
            <span>{item.content_type}</span><h3><Link href={`/content/${item.slug}`}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}<Link href={`/content/${item.slug}`}>متابعة القراءة ←</Link>
          </article>)}</div>
        </section>}
        {references.length > 0 && <section className="article-references" aria-labelledby="references-title">
          <h2 id="references-title">المصادر والمراجع</h2><ol>{references.map((reference, index) => <li key={`${reference.url || reference.title}-${index}`}>
            {reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}
            {reference.publisher && <small>{reference.publisher}</small>}{reference.year && <small>{String(reference.year)}</small>}
          </li>)}</ol>
        </section>}
      </article>
    </main>
    <SiteFooter />
  </>;
}