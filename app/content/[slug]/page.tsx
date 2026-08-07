import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
type ReferenceItem = { title?: string; url?: string; publisher?: string; year?: string | number };
type RelatedItem = { id: string; slug: string; title: string; excerpt: string | null; content_type: string; score: number };

async function getPublished(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,search_intent,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,sector_id,category_id,sectors(slug,name_ar),categories(slug,name_ar)')
    .eq('slug', slug).eq('status', 'published').lte('published_at', new Date().toISOString()).maybeSingle();
  return data;
}

function safeReferences(value: unknown): ReferenceItem[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const ref = item as Record<string, unknown>;
    const url = typeof ref.url === 'string' && /^https:\/\//i.test(ref.url) ? ref.url : undefined;
    const title = typeof ref.title === 'string' ? ref.title.slice(0, 400) : undefined;
    const publisher = typeof ref.publisher === 'string' ? ref.publisher.slice(0, 240) : undefined;
    const year = typeof ref.year === 'string' || typeof ref.year === 'number' ? ref.year : undefined;
    return title || url ? [{ title, url, publisher, year }] : [];
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const record = await getPublished(slug);
  if (!record) return {};
  const title = record.seo_title || record.title;
  const canonical = record.canonical_url || `/content/${record.slug}`;
  const keywords = [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[];
  return buildSeoMetadata({
    title, description: record.seo_description || record.excerpt, path: canonical, index: record.robots_index, follow: record.robots_follow,
    type: ['article','guide','research','news','condition','protocol','intervention','assessment'].includes(record.content_type) ? 'article' : 'website',
    image: record.featured_image_url, keywords, publishedTime: record.published_at, modifiedTime: record.updated_at,
    authors: record.author_display_name ? [{ name: record.author_display_name }] : undefined,
  });
}

export default async function PublishedContentPage({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getPublished(slug);
  if (!record) notFound();

  const supabase = await createClient();
  const { data: relatedData } = await supabase.rpc('related_public_content', { p_content_id: record.id, p_limit: 6 });
  const related = (Array.isArray(relatedData) ? relatedData : []) as RelatedItem[];
  const sector = Array.isArray(record.sectors) ? record.sectors[0] : record.sectors;
  const category = Array.isArray(record.categories) ? record.categories[0] : record.categories;
  const paragraphs = String(record.body_text ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const audiences = Array.isArray(record.audience) ? record.audience.map((item: unknown) => String(item)) : [];
  const references = safeReferences(record.references_json);
  const canonical = record.canonical_url || `/content/${record.slug}`;
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    ...(sector ? [{ name: sector.name_ar, path: `/sectors/${sector.slug}` }] : []),
    ...(category ? [{ name: category.name_ar, path: `/sections/${category.slug}` }] : []),
    { name: record.title, path: canonical },
  ]);

  const medicalTypes = new Set(['condition','protocol','intervention','assessment']);
  const schemaType = medicalTypes.has(record.content_type) ? 'MedicalWebPage' : ['article','guide','research','news'].includes(record.content_type) ? 'Article' : 'WebPage';
  const contentSchema = {
    '@context': 'https://schema.org', '@type': schemaType, '@id': `${url}#content`, url, headline: record.title,
    description: record.seo_description || record.excerpt || undefined, inLanguage: 'ar', datePublished: record.published_at || undefined,
    dateModified: record.updated_at || undefined, lastReviewed: record.last_reviewed_at || undefined,
    author: record.author_display_name ? { '@type': 'Person', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` },
    reviewedBy: record.reviewer_display_name ? { '@type': 'Person', name: record.reviewer_display_name, description: record.reviewer_credentials || undefined } : undefined,
    publisher: { '@id': `${SITE_URL}/#organization` }, image: record.featured_image_url || undefined,
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? [])].filter(Boolean).join(', ') || undefined,
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };

  return (
    <>
      <SiteHeader />
      <main className="article-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, contentSchema]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link>{sector && <><span>/</span><Link href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link></>}{category && <><span>/</span><Link href={`/sections/${category.slug}`}>{category.name_ar}</Link></>}<span>/</span><span aria-current="page">{record.title}</span></nav>
        <article>
          <header className="article-hero">
            <span className="eyebrow">{record.content_type}</span><h1>{record.title}</h1>{record.excerpt && <p>{record.excerpt}</p>}
            <div className="article-meta">{record.author_display_name && <span>إعداد: {record.author_display_name}</span>}{record.reviewer_display_name && <span>مراجعة: {record.reviewer_display_name}{record.reviewer_credentials ? ` — ${record.reviewer_credentials}` : ''}</span>}{record.published_at && <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span>}{record.last_reviewed_at && <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.last_reviewed_at))}</span>}</div>
            {audiences.length > 0 && <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div>}
          </header>

          <div className="article-body">
            {record.featured_image_url && <figure className="article-featured-image"><img src={record.featured_image_url} alt={record.featured_image_alt || record.title} loading="eager" /><figcaption className="sr-only">{record.featured_image_alt || record.title}</figcaption></figure>}
            {paragraphs.map((paragraph, index) => <p key={`${record.id}-${index}`}>{paragraph}</p>)}
            {!paragraphs.length && <p>لا يتوفر نص منشور لهذه الصفحة.</p>}
          </div>

          {record.medical_disclaimer && <aside className="medical-disclaimer" aria-label="إخلاء المسؤولية الطبية"><strong>تنبيه طبي</strong><p>{record.medical_disclaimer}</p><Link href="/disclaimer">إخلاء المسؤولية الكامل</Link></aside>}

          {related.length > 0 && <section className="article-related" aria-labelledby="related-title"><div className="section-mini-heading"><div><span className="eyebrow">Topical Authority</span><h2 id="related-title">محتوى مرتبط</h2></div><span>اختيار دلالي حسب القسم والقطاع والمصطلحات</span></div><div className="related-content-grid">{related.map((item) => <article key={item.id}><span>{item.content_type}</span><h3><Link href={`/content/${item.slug}`}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}<Link href={`/content/${item.slug}`}>متابعة القراءة ←</Link></article>)}</div></section>}

          {references.length > 0 && <section className="article-references" aria-labelledby="references-title"><h2 id="references-title">المصادر والمراجع</h2><ol>{references.map((reference, index) => <li key={`${reference.url || reference.title}-${index}`}>{reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}{reference.publisher && <small>{reference.publisher}</small>}{reference.year && <small>{String(reference.year)}</small>}</li>)}</ol></section>}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
