import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import {
  getResearchCatalogPage,
  getResearchCatalogStats,
} from '@/lib/magazine';
import styles from '@/components/magazine.module.css';

export const dynamic = 'force-dynamic';

const description = 'مرصد روافد للأبحاث الحديثة: فهرس علمي متجدد للأوراق والرسائل الجامعية المرتبطة بمجالات روافد، مع روابط المصادر الأصلية وتصنيف موضوعي واضح. هذه السجلات مرشحة للمراجعة ولا تساوي اعتمادًا علميًا.';

export const metadata: Metadata = buildSeoMetadata({
  title: 'مرصد الأبحاث الحديثة | مجلة روافد العلمية',
  description,
  path: '/magazine/research-observatory/',
  index: true,
  follow: true,
  type: 'website',
  hreflang: { ar: '/magazine/research-observatory/', 'x-default': '/magazine/research-observatory/' },
});

type SearchParams = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<SearchParams> };

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function asPage(value: string | string[] | undefined) {
  const parsed = Number.parseInt(one(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('ar', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('ar', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function hrefWith(params: SearchParams, changes: Record<string, string | number | null>) {
  const next = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    const value = one(raw);
    if (value) next.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === '' || value === 0) next.delete(key);
    else next.set(key, String(value));
  }
  const query = next.toString();
  return `/magazine/research-observatory/${query ? `?${query}` : ''}#research-catalog`;
}

function Pagination({ page, totalPages, params }: {
  page: number;
  totalPages: number;
  params: SearchParams;
}) {
  if (totalPages <= 1) return null;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  return (
    <nav className={styles.pagination} aria-label="ترقيم صفحات مرصد الأبحاث">
      {page > 1 && <Link href={hrefWith(params, { rp: page - 1 })}>السابق</Link>}
      {start > 1 && <Link href={hrefWith(params, { rp: 1 })}>1</Link>}
      {start > 2 && <span aria-hidden="true">…</span>}
      {pages.map((value) => (
        <Link key={value} className={value === page ? styles.activePage : undefined} aria-current={value === page ? 'page' : undefined} href={hrefWith(params, { rp: value })}>{value}</Link>
      ))}
      {end < totalPages - 1 && <span aria-hidden="true">…</span>}
      {end < totalPages && <Link href={hrefWith(params, { rp: totalPages })}>{totalPages}</Link>}
      {page < totalPages && <Link href={hrefWith(params, { rp: page + 1 })}>التالي</Link>}
    </nav>
  );
}

export default async function ResearchObservatoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const rq = one(params.rq).trim();
  const cluster = one(params.cluster).trim();
  const rtype = one(params.rtype).trim();
  const rp = asPage(params.rp);

  const [catalogStats, catalogPage] = await Promise.all([
    getResearchCatalogStats(),
    getResearchCatalogPage({ page: rp, pageSize: 24, q: rq, cluster, workType: rtype }),
  ]);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${SITE_URL}/magazine/research-observatory/#dataset`,
    name: 'مرصد روافد للأبحاث الحديثة',
    description,
    url: `${SITE_URL}/magazine/research-observatory/`,
    inLanguage: ['ar', 'en'],
    isAccessibleForFree: true,
    temporalCoverage: catalogStats.oldestDate && catalogStats.newestDate ? `${catalogStats.oldestDate}/${catalogStats.newestDate}` : undefined,
    spatialCoverage: 'Global',
    creator: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    keywords: catalogStats.clusters.map((item) => item.label),
    size: catalogStats.total,
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.page} dir="rtl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />

        <section className={styles.hero}>
          <div className={styles.shell}>
            <p className={styles.eyebrow}>مرصد روافد · مرحلة الاكتشاف والفرز</p>
            <h1>أحدث الأوراق العلمية والرسائل الجامعية المرشحة للمراجعة</h1>
            <p className={styles.heroLead}>هذه الصفحة فهرس علمي متجدد، وليست مجلة مقالات مكتملة. وجود أي سجل هنا يعني أنه دخل مرحلة الاكتشاف والفرز فقط. القراءة العربية الكاملة تظهر في المجلة بعد مراجعة المصدر وتحليل المنهج والنتائج والقيود.</p>
            <div className={styles.stats} aria-label="إحصاءات المرصد">
              <span><strong>{catalogStats.total.toLocaleString('ar')}</strong> سجل حديث</span>
              <span><strong>{catalogStats.articles.toLocaleString('ar')}</strong> ورقة علمية</span>
              <span><strong>{catalogStats.dissertations.toLocaleString('ar')}</strong> رسالة جامعية</span>
              <span><strong>{catalogStats.last30Days.toLocaleString('ar')}</strong> من آخر 30 يومًا</span>
            </div>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.catalogOverview}`} aria-labelledby="coverage-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>التغطية الموضوعية</p>
              <h2 id="coverage-title">العناقيد البحثية في المرصد</h2>
            </div>
            <p>هذه الأرقام تصف الفهرس الخام. قبل الانتقال إلى المجلة يخضع السجل لفلترة الصلة والجودة وإزالة التكرار والتصنيف الخاطئ.</p>
          </div>
          <div className={styles.clusterGrid}>
            {catalogStats.clusters.map((item) => (
              <Link key={item.key} href={hrefWith(params, { cluster: item.key, rp: 1 })}>
                <strong>{item.label}</strong>
                <span>{item.count.toLocaleString('ar')} سجل</span>
              </Link>
            ))}
          </div>
          <div className={styles.qualityStrip}>
            <span><strong>{catalogStats.withDoi.toLocaleString('ar')}</strong> بمعرّف DOI</span>
            <span><strong>{catalogStats.openAccess.toLocaleString('ar')}</strong> وصول مفتوح</span>
            <span><strong>{catalogStats.last90Days.toLocaleString('ar')}</strong> من آخر 90 يومًا</span>
            <span>آخر مزامنة: <strong>{formatDateTime(catalogStats.lastSyncedAt) ?? '—'}</strong></span>
            <span><Link href="/magazine/">العودة إلى القراءات العربية الكاملة ←</Link></span>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.catalog}`} id="research-catalog" aria-labelledby="research-catalog-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>فهرس الاكتشاف</p>
              <h2 id="research-catalog-title">السجلات العلمية المرشحة للتحليل</h2>
            </div>
            <p>الإدراج لا يعني توصية أو اعتمادًا للنتيجة. المصدر الأصلي يبقى المرجع، والانتقال إلى المجلة يتطلب مراجعة تحريرية مستقلة.</p>
          </div>

          <form className={styles.filters} method="get" action="/magazine/research-observatory/">
            <label>
              <span>ابحث في العنوان العلمي</span>
              <input name="rq" defaultValue={rq} type="search" placeholder="مثال: autism, epilepsy, rehabilitation" />
            </label>
            <label>
              <span>المجال</span>
              <select name="cluster" defaultValue={cluster}>
                <option value="">كل المجالات</option>
                {catalogStats.clusters.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>نوع العمل</span>
              <select name="rtype" defaultValue={rtype}>
                <option value="">الكل</option>
                <option value="article">ورقة علمية</option>
                <option value="dissertation">رسالة جامعية</option>
              </select>
            </label>
            <input type="hidden" name="rp" value="1" />
            <div className={styles.filterActions}>
              <button type="submit">تطبيق البحث</button>
              {(rq || cluster || rtype) && <Link href="/magazine/research-observatory/#research-catalog">مسح الفلاتر</Link>}
            </div>
          </form>

          <div className={styles.resultSummary}>
            <strong>{catalogPage.count.toLocaleString('ar')}</strong> نتيجة مطابقة
            <span>·</span>
            <span>صفحة {catalogPage.page.toLocaleString('ar')} من {catalogPage.totalPages.toLocaleString('ar')}</span>
          </div>

          {catalogPage.items.length ? (
            <div className={styles.researchGrid}>
              {catalogPage.items.map((item) => (
                <article className={styles.researchCard} key={item.id}>
                  <div className={styles.cardMeta}>
                    <span>{item.evidence_kind_ar}</span>
                    <time dateTime={item.publication_date}>{formatDate(item.publication_date)}</time>
                  </div>
                  <p className={styles.clusterLabel}>{item.rawafid_cluster_ar}</p>
                  <h3>{item.title}</h3>
                  {item.authors.length > 0 && <p className={styles.authors}>{item.authors.slice(0, 3).join('، ')}{item.authors.length > 3 ? ' وآخرون' : ''}</p>}
                  <dl className={styles.researchFacts}>
                    {item.journal_title && <><dt>المصدر</dt><dd>{item.journal_title}</dd></>}
                    {item.primary_topic && <><dt>الموضوع</dt><dd>{item.primary_topic}</dd></>}
                    <dt>الاستشهادات</dt><dd>{item.cited_by_count.toLocaleString('ar')}</dd>
                    <dt>الوصول</dt><dd>{item.is_open_access ? 'مفتوح' : 'قد يتطلب اشتراكًا'}</dd>
                  </dl>
                  <div className={styles.researchActions}>
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer">فتح المصدر الأصلي ↗</a>
                    {item.doi && <span>DOI</span>}
                  </div>
                  <p className={styles.indexingNote}>سجل فهرسة علمية؛ لا يمثل اعتمادًا للنتيجة قبل المراجعة النقدية المستقلة.</p>
                </article>
              ))}
            </div>
          ) : <div className={styles.emptyState}>لا توجد نتائج مطابقة لهذه الفلاتر. جرّب توسيع البحث أو إزالة أحد القيود.</div>}

          <Pagination page={catalogPage.page} totalPages={catalogPage.totalPages} params={params} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
