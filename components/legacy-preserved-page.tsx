import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import {
  legacyCanonicalPath,
  legacyDisplayTitle,
  legacyInternalLinks,
  legacyReferences,
  type LegacyPreservedPage,
} from '@/lib/legacy-preserved-page';

type Props = { page: LegacyPreservedPage; route: string };

function familyLabel(value: string | null): string {
  if (!value) return 'مكتبة روافد';
  return value.replace(/[-_]+/g, ' ').trim() || 'مكتبة روافد';
}

export default function LegacyPreservedPageView({ page, route }: Props) {
  const canonical = legacyCanonicalPath(route);
  const title = legacyDisplayTitle(page);
  const internalLinks = legacyInternalLinks(page.internal_links_json);
  const references = legacyReferences(page.references_json);

  return <><SiteHeader /><main className="article-shell">
    <nav className="breadcrumbs" aria-label="مسار الصفحة">
      <Link href="/">الرئيسية</Link><span>/</span><span>{familyLabel(page.source_family)}</span><span>/</span><span aria-current="page">{title}</span>
    </nav>
    <article>
      <header className="article-hero">
        <span className="eyebrow">من مكتبة منصة روافد</span>
        <h1>{title}</h1>
        {page.meta_description ? <p>{page.meta_description}</p> : null}
        <div className="article-meta">
          <span>المسار الأصلي محفوظ: {canonical}</span>
          {page.word_count ? <span>{page.word_count.toLocaleString('ar')} كلمة في النسخة المصدرية</span> : null}
        </div>
      </header>
      <aside className="content-callout info" aria-label="حالة الصفحة">
        <strong>صفحة منشورة ومحفوظة</strong>
        <p>تحافظ منصة روافد على هذا المسار المنشور ومحتواه مع مواصلة المراجعة والترقية التحريرية. تبقى الصفحة قابلة للوصول والفهرسة، ولا يعني استمرار الترقية سحبها أو إخفاءها من البحث.</p>
      </aside>
      <div className="article-body">
        <ContentRenderer bodyJson={page.body_json} bodyText={page.body_text} recordId={page.source_path} />
      </div>
      {internalLinks.length ? <section className="article-related" aria-labelledby="legacy-related-title">
        <h2 id="legacy-related-title">روابط ذات صلة في منصة روافد</h2>
        <ul>{internalLinks.map((item) => <li key={item.href}><Link href={item.href}>{item.title}</Link></li>)}</ul>
      </section> : null}
      {references.length ? <section className="article-references" aria-labelledby="legacy-references-title">
        <h2 id="legacy-references-title">المصادر والمراجع</h2>
        <ol>{references.map((reference) => <li key={reference.url}>
          <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title}</a>
          {reference.publisher ? <small>{reference.publisher}</small> : null}
          {reference.year ? <small>{reference.year}</small> : null}
        </li>)}</ol>
      </section> : null}
    </article>
  </main><SiteFooter /></>;
}
