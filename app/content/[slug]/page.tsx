import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const SITE = 'https://healthrenewal.org';
type Params = Promise<{ slug: string }>;

async function getPublished(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,sector_id,category_id,sectors(slug,name_ar),categories(slug,name_ar)')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const record = await getPublished(slug);
  if (!record) return {};
  const title = record.seo_title || record.title;
  const description = record.seo_description || record.excerpt || undefined;
  const canonical = record.canonical_url || `/content/${record.slug}`;
  const url = canonical.startsWith('https://') ? canonical : `${SITE}${canonical}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: 'article', url, title: `${title} | منصة روافد`, description, siteName: 'منصة روافد', locale: 'ar_AR' },
    twitter: { card: 'summary', title: `${title} | منصة روافد`, description },
  };
}

export default async function PublishedContentPage({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getPublished(slug);
  if (!record) notFound();

  const sector = Array.isArray(record.sectors) ? record.sectors[0] : record.sectors;
  const category = Array.isArray(record.categories) ? record.categories[0] : record.categories;
  const paragraphs = String(record.body_text ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const schemaType = ['article','guide','research','news'].includes(record.content_type) ? 'Article' : 'WebPage';
  const canonical = record.canonical_url || `/content/${record.slug}`;
  const url = canonical.startsWith('https://') ? canonical : `${SITE}${canonical}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: record.title,
    description: record.seo_description || record.excerpt || undefined,
    url,
    inLanguage: 'ar',
    datePublished: record.published_at,
    isPartOf: { '@type': 'WebSite', name: 'منصة روافد', url: SITE },
  };

  return (
    <main className="article-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <header className="topbar">
        <Link className="brand" href="/"><span className="brand-mark">ر</span><span><strong>روافد</strong><small>Rawafid</small></span></Link>
        {sector && <Link className="button" href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link>}
      </header>

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
            {(record.audience ?? []).map((audience) => <span key={audience}>{audience}</span>)}
            {record.published_at && <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span>}
          </div>
        </header>
        <div className="article-body">
          {paragraphs.map((paragraph, index) => <p key={`${record.id}-${index}`}>{paragraph}</p>)}
          {!paragraphs.length && <p>لا يتوفر نص منشور لهذه الصفحة.</p>}
        </div>
      </article>
    </main>
  );
}
