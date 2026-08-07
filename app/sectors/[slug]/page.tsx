import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const SITE = 'https://healthrenewal.org';
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: sector } = await supabase
    .from('sectors')
    .select('name_ar,description,seo_title,seo_description')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!sector) return {};
  const title = sector.seo_title || sector.name_ar;
  const description = sector.seo_description || sector.description || `استكشف قطاع ${sector.name_ar} ضمن منصة روافد.`;
  const canonical = `/sectors/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: `${SITE}${canonical}`,
      siteName: 'منصة روافد',
      title: `${title} | منصة روافد`,
      description,
      locale: 'ar_AR',
    },
    twitter: {
      card: 'summary',
      title: `${title} | منصة روافد`,
      description,
    },
  };
}

export default async function SectorPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: sector } = await supabase
    .from('sectors')
    .select('id,slug,name_ar,description,accent,seo_title,seo_description')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!sector) notFound();

  const { data: categories } = await supabase
    .from('categories')
    .select('id,slug,name_ar,description,parent_id,sort_order')
    .eq('sector_id', sector.id)
    .eq('is_active', true)
    .order('sort_order')
    .order('name_ar');

  const categoryRows = categories ?? [];
  const roots = categoryRows.filter((category) => !category.parent_id);
  const accentStyle = { '--accent': sector.accent || '#0f8f88' } as CSSProperties;
  const description = sector.seo_description || sector.description || 'قطاع معرفي وخدمي ضمن منصة روافد.';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: sector.seo_title || sector.name_ar,
    description,
    url: `${SITE}/sectors/${sector.slug}`,
    inLanguage: 'ar',
    isPartOf: {
      '@type': 'WebSite',
      name: 'منصة روافد',
      url: SITE,
    },
  };

  return (
    <main className="site-shell sector-page" style={accentStyle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <header className="topbar">
        <Link className="brand" href="/" aria-label="منصة روافد الرئيسية">
          <span className="brand-mark">ر</span>
          <span><strong>روافد</strong><small>Rawafid</small></span>
        </Link>
        <Link className="button" href="/#sectors">كل القطاعات</Link>
      </header>

      <section className="sector-hero">
        <span className="eyebrow">قطاع ديناميكي</span>
        <h1>{sector.name_ar}</h1>
        <p>{sector.description || description}</p>
      </section>

      <section className="section">
        <div className="section-mini-heading">
          <h2>الأقسام</h2>
          <span>{categoryRows.length} قسم</span>
        </div>
        <div className="category-public-grid">
          {roots.map((category) => {
            const children = categoryRows.filter((candidate) => candidate.parent_id === category.id);
            return (
              <article className="public-category-card" key={category.id}>
                <Link href={`/sections/${category.slug}`}><h3>{category.name_ar}</h3></Link>
                <p>{category.description || 'قسم متخصص ضمن هذا القطاع.'}</p>
                {children.length > 0 && (
                  <div className="subcategories">
                    {children.map((child) => <Link href={`/sections/${child.slug}`} key={child.id}>{child.name_ar}</Link>)}
                  </div>
                )}
              </article>
            );
          })}
          {!roots.length && <p className="empty-state">لم تُضف أقسام لهذا القطاع بعد.</p>}
        </div>
      </section>

      <footer><strong>{sector.name_ar}</strong><span>البنية جاهزة لإضافة المحتوى لاحقًا بعد أمر الترحيل.</span></footer>
    </main>
  );
}
