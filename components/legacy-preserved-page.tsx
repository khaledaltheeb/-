import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import {
  legacyCanonicalPath,
  legacyInternalLinks,
  legacyReferences,
  type LegacyPreservedPage,
} from '@/lib/legacy-preserved-page';
import { shouldIndexPreservedPublishedPage } from '@/lib/public-indexability';

type Props = { page: LegacyPreservedPage; route: string };

function familyLabel(value: string | null): string {
  if (!value) return 'المحتوى التاريخي';
  return value.replace(/[-_]+/g, ' ').trim() || 'المحتوى التاريخي';
}

export default function LegacyPreservedPageView({ page, route }: Props) {
  const canonical = legacyCanonicalPath(route);
  const title = page.h1 || page.title || 'محتوى محفوظ';
  const internalLinks = legacyInternalLinks(page.internal_links_json);
  const references = legacyReferences(page.references_json);
  const isIndexablePublished = shouldIndexPreservedPublishedPage({
    sourceFamily: page.source_family,
    route: canonical,
  });

  return <><SiteHeader /><main className="article-shell">
    <nav className="breadcrumbs" aria-label="مسار الصفحة">
      <Link href="/">الرئيسية</Link><span>/</span><span>{familyLabel(page.source_family)}</span><span>/</span><span aria-current="page">{title}</span>
    </nav>
    <article>
      <header className="article-hero">
        <span className="eyebrow">نسخة إنتاجية محفوظة</span>
        <h1>{title}</h1>
        {page.meta_description ? <p>{page.meta_description}</p> : null}
        <div className="article-meta">
          <span>المسار الأصلي محفوظ: {canonical}</span>
          {page.word_count ? <span>{page.word_count.toLocaleString('ar')} كلمة في النسخة المصدرية</span> : null}
        </div>
      </header>
      <aside className="content-callout info" aria-label="حالة المراجعة">
        <strong>حالة هذه النسخة</strong>
        {isIndexablePublished
          ? <p>هذه صفحة منشورة ضمن قاعدة محتوى روافد، وقد حُفظ مسارها العام ومحتواها أثناء الانتقال إلى البنية الجديدة. تظهر للمستخدم ومحركات البحث على عنوانها الأساسي نفسه، مع استمرار التحسين التحريري الدوري.</p>
          : <p>هذا هو المحتوى الذي كان منشورًا على المسار التاريخي نفسه. لم تُمنح هذه النسخة اعتماد دورة المراجعة العلمية الحالية بعد، لذلك تبقى خارج الفهرسة العامة إلى أن تكتمل مراجعتها.</p>}
      </aside>
      <div className="article-body">
        <ContentRenderer bodyJson={page.body_json} bodyText={page.body_text} recordId={page.source_path} />
      </div>
      {internalLinks.length ? <section className="article-related" aria-labelledby="legacy-related-title">
        <h2 id="legacy-related-title">روابط المسار الأصلي</h2>
        <ul>{internalLinks.map((item) => <li key={item.href}><Link href={item.href}>{item.title}</Link></li>)}</ul>
      </section> : null}
      {references.length ? <section className="article-references" aria-labelledby="legacy-references-title">
        <h2 id="legacy-references-title">المصادر والمراجع في النسخة الأصلية</h2>
        <ol>{references.map((reference) => <li key={reference.url}>
          <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title}</a>
          {reference.publisher ? <small>{reference.publisher}</small> : null}
          {reference.year ? <small>{reference.year}</small> : null}
        </li>)}</ol>
      </section> : null}
    </article>
  </main><SiteFooter /></>;
}
