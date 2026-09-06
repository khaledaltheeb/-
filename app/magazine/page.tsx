import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import {
  evidenceKind,
  getMagazineOverview,
  getMagazinePage,
  getResearchCatalogStats,
} from '@/lib/magazine';
import styles from '@/components/magazine.module.css';

export const dynamic = 'force-dynamic';

const description = 'مجلة روافد العلمية: قراءات عربية نقدية كاملة للأبحاث والدراسات والرسائل الجامعية، تشرح السؤال والمنهج والعينة والنتائج والقيود والدلالة العملية مع الرجوع إلى المصادر الأصلية.';

export const metadata: Metadata = buildSeoMetadata({
  title: 'مجلة روافد العلمية | قراءات وتحليلات عربية كاملة للأبحاث',
  description,
  path: '/magazine/',
  index: true,
  follow: true,
  type: 'website',
  hreflang: { ar: '/magazine/', 'x-default': '/magazine/' },
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

function hrefWith(params: SearchParams, changes: Record<string, string | number | null>, hash?: string) {
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
  return `/magazine/${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
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
    <nav className={styles.pagination} aria-label="ترقيم صفحات القراءات العربية">
      {page > 1 && <a href={hrefWith(params, { ap: page - 1 }, 'arabic-analyses')}>السابق</a>}
      {start > 1 && <a href={hrefWith(params, { ap: 1 }, 'arabic-analyses')}>1</a>}
      {start > 2 && <span aria-hidden="true">…</span>}
      {pages.map((value) => (
        <a
          key={value}
          className={value === page ? styles.activePage : undefined}
          aria-current={value === page ? 'page' : undefined}
          href={hrefWith(params, { ap: value }, 'arabic-analyses')}
        >
          {value}
        </a>
      ))}
      {end < totalPages - 1 && <span aria-hidden="true">…</span>}
      {end < totalPages && <a href={hrefWith(params, { ap: totalPages }, 'arabic-analyses')}>{totalPages}</a>}
      {page < totalPages && <a href={hrefWith(params, { ap: page + 1 }, 'arabic-analyses')}>التالي</a>}
    </nav>
  );
}

export default async function MagazinePage({ searchParams }: Props) {
  const params = await searchParams;
  const aq = one(params.aq).trim();
  const kind = one(params.kind).trim();
  const ap = asPage(params.ap);

  const [catalogStats, magazineOverview, magazinePage] = await Promise.all([
    getResearchCatalogStats(),
    getMagazineOverview(),
    getMagazinePage({ page: ap, pageSize: 24, q: aq, kind }),
  ]);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/magazine/#collection`,
    name: 'مجلة روافد العلمية',
    description,
    url: `${SITE_URL}/magazine/`,
    inLanguage: 'ar',
    isAccessibleForFree: true,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/magazine/#arabic-analyses`,
      name: 'القراءات العربية النقدية المنشورة',
      numberOfItems: magazineOverview.count,
    },
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.page} dir="rtl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />

        <section className={styles.hero}>
          <div className={styles.shell}>
            <p className={styles.eyebrow}>مجلة روافد العلمية · المحتوى المحرر أولًا</p>
            <h1>قراءات عربية كاملة تشرح الدليل، لا قائمة عناوين</h1>
            <p className={styles.heroLead}>
              كل بطاقة في هذه الصفحة تقود إلى قراءة عربية منشورة داخل روافد. نعرض سؤال الدراسة ومنهجها وعينتها ونتائجها وقيودها ودلالتها العملية، مع إبقاء المصدر الأصلي ظاهرًا وقابلًا للتحقق. أما السجلات الخام التي لم تمر بعد بالمراجعة التحريرية فلها مرصد مستقل حتى لا تختلط بالمحتوى المكتمل.
            </p>
            <div className={styles.stats} aria-label="إحصاءات المجلة">
              <span><strong>{magazineOverview.count.toLocaleString('ar')}</strong> قراءة عربية مكتملة</span>
              <span><strong>{magazineOverview.kinds.length.toLocaleString('ar')}</strong> نوع دليل</span>
              <span><strong>{catalogStats.total.toLocaleString('ar')}</strong> سجل ينتظر الفرز في المرصد</span>
            </div>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.readingGuide}`} aria-labelledby="editorial-model-title">
          <p className={styles.eyebrow}>فصل واضح بين الاكتشاف والنشر</p>
          <h2 id="editorial-model-title">كيف تنتقل الدراسة من المرصد إلى صفحة عربية كاملة؟</h2>
          <div className={styles.guideGrid}>
            <article><h3>1. اكتشاف</h3><p>يُلتقط السجل البحثي من المصادر العلمية ويُحفظ في المرصد كمرشح للفحص، لا كمقال منشور.</p></article>
            <article><h3>2. فرز</h3><p>نستبعد غير المرتبط بمجالات روافد والمكرر أو منخفض القيمة، ونرفع أولوية الأدلة الأحدث والأقوى والأكثر قابلية للتطبيق.</p></article>
            <article><h3>3. تحليل</h3><p>تُراجع الدراسة من مصدرها الأصلي وتُحلل منهجيًا، مع الانتباه للتصميم والتحيز وحجم العينة وحجم الأثر وحدود التعميم.</p></article>
            <article><h3>4. نشر</h3><p>تُنشر قراءة عربية مستقلة بمحتوى مفيد وروابط داخلية ومراجع وSEO وبيانات منظمة، ثم تصبح جزءًا من هذه المجلة.</p></article>
          </div>
          <div className={styles.qualityStrip}>
            <span><strong>المجلة:</strong> صفحات عربية محررة فقط</span>
            <span><strong>المرصد:</strong> ميتاداتا وسجلات مرشحة للمراجعة</span>
            <span><a href="/magazine/research-observatory/">فتح مرصد الأبحاث الحديثة ←</a></span>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.catalog}`} id="arabic-analyses" aria-labelledby="magazine-catalog-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>الطبقة المحررة</p>
              <h2 id="magazine-catalog-title">القراءات العربية النقدية المنشورة</h2>
            </div>
            <p>
              {magazineOverview.count.toLocaleString('ar')} قراءة منشورة على مساراتها الأصلية. هذه هي واجهة المجلة الأساسية، وليست سجلات الفهرسة الخام.
            </p>
          </div>

          <form className={styles.filters} method="get" action="/magazine/">
            <label>
              <span>ابحث في القراءات العربية</span>
              <input name="aq" defaultValue={aq} type="search" placeholder="اكتب موضوعًا أو حالة أو تدخّلًا" />
            </label>
            <label>
              <span>نوع الدليل</span>
              <select name="kind" defaultValue={kind}>
                <option value="">كل أنواع الأدلة</option>
                {magazineOverview.kinds.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <input type="hidden" name="ap" value="1" />
            <div className={styles.filterActions}>
              <button type="submit">تطبيق البحث</button>
              {(aq || kind) && <a href="/magazine/#arabic-analyses">مسح الفلاتر</a>}
            </div>
          </form>

          <div className={styles.chips} aria-label="أنواع الأدلة">
            {magazineOverview.kinds.map((value) => (
              <a key={value} href={hrefWith(params, { kind: value, ap: 1 }, 'arabic-analyses')}>{value}</a>
            ))}
          </div>
          <div className={styles.resultSummary}>
            <strong>{magazinePage.count.toLocaleString('ar')}</strong> قراءة مطابقة
            <span>·</span>
            <span>صفحة {magazinePage.page.toLocaleString('ar')} من {magazinePage.totalPages.toLocaleString('ar')}</span>
          </div>

          {magazinePage.items.length ? (
            <div className={styles.grid}>
              {magazinePage.items.map((item) => {
                const href = item.canonical_url || `/content/${item.slug}`;
                return (
                  <article className={styles.card} key={item.id}>
                    <div className={styles.cardMeta}>
                      <span>{evidenceKind(item)}</span>
                      {item.published_at && <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>}
                    </div>
                    <h3><a href={href}>{item.title}</a></h3>
                    {item.excerpt && <p>{item.excerpt}</p>}
                    <a className={styles.readMore} href={href}>قراءة التحليل كاملًا ←</a>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>لا توجد قراءة عربية مطابقة لهذه الفلاتر. جرّب توسيع البحث أو إزالة نوع الدليل.</div>
          )}

          <Pagination page={magazinePage.page} totalPages={magazinePage.totalPages} params={params} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
