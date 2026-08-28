import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import { SITE_URL } from '@/lib/seo';
import {
  legacyCanonicalPath,
  legacyInternalLinks,
  legacyReferences,
  type LegacyPreservedPage,
} from '@/lib/legacy-preserved-page';

type Props = { page: LegacyPreservedPage; route: string };
type JsonLdNode = Record<string, unknown>;

function familyLabel(value: string | null): string {
  if (!value) return 'المحتوى التاريخي';
  return value.replace(/[-_]+/g, ' ').trim() || 'المحتوى التاريخي';
}

function legacyPageJsonLd(page: LegacyPreservedPage, route: string, title: string, description: string | null) {
  const canonicalPath = legacyCanonicalPath(route);
  const canonical = `${SITE_URL}${canonicalPath}`;
  const current = page.current_content;
  const shared: JsonLdNode = {
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: title,
    ...(description ? { description } : {}),
    inLanguage: 'ar',
    isAccessibleForFree: true,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
  const graph: JsonLdNode[] = [];

  if (/^\/sections\/[^/]+\/?$/.test(canonicalPath) || /^\/sectors\/[^/]+\/?$/.test(canonicalPath)) {
    graph.push({ ...shared, '@type': 'CollectionPage' });
  } else if (/^\/magazine\/.+/.test(canonicalPath)) {
    graph.push({
      ...shared,
      '@type': 'ScholarlyArticle',
      headline: title,
      ...(current?.published_at ? { datePublished: current.published_at } : {}),
      ...(current?.updated_at ? { dateModified: current.updated_at } : {}),
    });
  } else if (/^\/quick-info\/[^/]+\/?$/.test(canonicalPath)) {
    graph.push({
      ...shared,
      '@type': ['Article', 'MedicalWebPage'],
      headline: title,
      ...(current?.published_at ? { datePublished: current.published_at } : {}),
      ...(current?.updated_at ? { dateModified: current.updated_at } : {}),
    });
  } else if (/^\/encyclopedia\/(?!index(?:\/|$))[^/]+\/?$/.test(canonicalPath)) {
    const conditionId = `${canonical}#condition`;
    graph.push({ ...shared, '@type': 'MedicalWebPage', mainEntity: { '@id': conditionId } });
    graph.push({
      '@type': 'MedicalCondition',
      '@id': conditionId,
      name: title,
      ...(description ? { description } : {}),
    });
  } else {
    const kind = current?.content_type.toLowerCase() || '';
    const type = kind === 'research'
      ? 'ScholarlyArticle'
      : kind === 'condition'
        ? 'MedicalWebPage'
        : current && ['article', 'guide', 'news', 'protocol', 'intervention', 'assessment'].includes(kind)
          ? 'Article'
          : 'WebPage';
    graph.push({
      ...shared,
      '@type': type,
      ...(type === 'Article' || type === 'ScholarlyArticle' ? { headline: title } : {}),
      ...(current?.published_at ? { datePublished: current.published_at } : {}),
      ...(current?.updated_at ? { dateModified: current.updated_at } : {}),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export default function LegacyPreservedPageView({ page, route }: Props) {
  const current = page.current_content;
  const canonical = current?.canonical_url || legacyCanonicalPath(route);
  const title = current?.title || page.h1 || page.title || 'محتوى محفوظ';
  const description = current?.excerpt || page.meta_description;
  const bodyJson = current?.body_json ?? page.body_json;
  const bodyText = current?.body_text ?? page.body_text;
  const references = legacyReferences(current?.references_json ?? page.references_json);
  const internalLinks = current ? [] : legacyInternalLinks(page.internal_links_json);
  const reviewedAt = current?.last_reviewed_at ? new Date(current.last_reviewed_at) : null;
  const structuredData = legacyPageJsonLd(page, route, title, description);

  return <><SiteHeader /><main className="article-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة">
      <Link href="/">الرئيسية</Link><span>/</span><span>{current ? 'محتوى روافد المراجع' : familyLabel(page.source_family)}</span><span>/</span><span aria-current="page">{title}</span>
    </nav>
    <article>
      <header className="article-hero">
        <span className="eyebrow">{current ? 'محتوى منشور ومراجع' : 'نسخة إنتاجية محفوظة'}</span>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        <div className="article-meta">
          <span>{current ? `المسار المعتمد: ${canonical}` : `المسار الأصلي محفوظ: ${canonical}`}</span>
          {current?.reviewer_display_name ? <span>مراجعة: {current.reviewer_display_name}</span> : null}
          {reviewedAt && Number.isFinite(reviewedAt.getTime()) ? <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(reviewedAt)}</span> : null}
          {!current && page.word_count ? <span>{page.word_count.toLocaleString('ar')} كلمة في النسخة المصدرية</span> : null}
        </div>
      </header>
      {current ? <aside className="content-callout info" aria-label="حالة المراجعة">
        <strong>تمت المراجعة من قبل فريق روافد</strong>
        <p>هذه الصفحة تعرض السجل المنشور الحالي المطابق لمسارها المعتمد، وتحل محل نسخة الحفظ التاريخية في العرض والفهرسة.</p>
      </aside> : <aside className="content-callout info" aria-label="حالة المراجعة">
        <strong>حالة هذه النسخة</strong>
        <p>هذا هو المحتوى الذي كان منشورًا على المسار التاريخي نفسه. لم تُمنح هذه النسخة اعتماد دورة المراجعة العلمية الحالية بعد، لذلك تبقى غير مفهرسة إلى أن تكتمل مراجعتها.</p>
      </aside>}
      <div className="article-body">
        <ContentRenderer bodyJson={bodyJson} bodyText={bodyText} recordId={current?.id || page.source_path} />
      </div>
      {current?.medical_disclaimer ? <aside className="medical-disclaimer" aria-label="حدود المحتوى الطبي"><strong>تنبيه</strong><p>{current.medical_disclaimer}</p></aside> : null}
      {internalLinks.length ? <section className="article-related" aria-labelledby="legacy-related-title">
        <h2 id="legacy-related-title">روابط المسار الأصلي</h2>
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