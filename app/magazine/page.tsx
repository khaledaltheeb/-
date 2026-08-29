import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import {
  evidenceKind,
  getMagazineOverview,
  getMagazinePage,
  getResearchCatalogPage,
  getResearchCatalogStats,
} from '@/lib/magazine';
import styles from '@/components/magazine.module.css';

export const dynamic = 'force-dynamic';

const description = 'مرصد روافد للأبحاث الحديثة: أحدث 1000 ورقة علمية ورسالة جامعية مرتبطة بالصحة النفسية والتربية الدامجة والاحتياجات الخاصة والتأهيل والإدمان والصرع وأورام الأطفال، مع قراءات عربية نقدية موثقة بالمصادر الأصلية.';

export const metadata: Metadata = buildSeoMetadata({
  title: 'المجلة والأبحاث العلمية | أحدث الدراسات والرسائل الجامعية',
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

function formatDateTime(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('ar', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
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

function Pagination({ page, totalPages, params, pageKey, anchor }: {
  page: number;
  totalPages: number;
  params: SearchParams;
  pageKey: string;
  anchor: string;
}) {
  if (totalPages <= 1) return null;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  return (
    <nav className={styles.pagination} aria-label="ترقيم الصفحات">
      {page > 1 && <a href={hrefWith(params, { [pageKey]: page - 1 }, anchor)}>السابق</a>}
      {start > 1 && <a href={hrefWith(params, { [pageKey]: 1 }, anchor)}>1</a>}
      {start > 2 && <span aria-hidden="true">…</span>}
      {pages.map((value) => (
        <a key={value} className={value === page ? styles.activePage : undefined} aria-current={value === page ? 'page' : undefined} href={hrefWith(params, { [pageKey]: value }, anchor)}>{value}</a>
      ))}
      {end < totalPages - 1 && <span aria-hidden="true">…</span>}
      {end < totalPages && <a href={hrefWith(params, { [pageKey]: totalPages }, anchor)}>{totalPages}</a>}
      {page < totalPages && <a href={hrefWith(params, { [pageKey]: page + 1 }, anchor)}>التالي</a>}
    </nav>
  );
}

export default async function MagazinePage({ searchParams }: Props) {
  const params = await searchParams;
  const rq = one(params.rq).trim();
  const cluster = one(params.cluster).trim();
  const rtype = one(params.rtype).trim();
  const rp = asPage(params.rp);
  const aq = one(params.aq).trim();
  const kind = one(params.kind).trim();
  const ap = asPage(params.ap);

  const [catalogStats, catalogPage, magazineOverview, magazinePage] = await Promise.all([
    getResearchCatalogStats(),
    getResearchCatalogPage({ page: rp, pageSize: 24, q: rq, cluster, workType: rtype }),
    getMagazineOverview(),
    getMagazinePage({ page: ap, pageSize: 18, q: aq, kind }),
  ]);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/magazine/#collection`,
        name: 'المجلة والأبحاث العلمية | منصة روافد',
        description,
        url: `${SITE_URL}/magazine/`,
        inLanguage: 'ar',
        isAccessibleForFree: true,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        mainEntity: { '@id': `${SITE_URL}/magazine/#research-catalog` },
      },
      {
        '@type': 'Dataset',
        '@id': `${SITE_URL}/magazine/#research-catalog`,
        name: 'مرصد أحدث 1000 بحث ورسالة جامعية مرتبطة بمجالات روافد',
        description: 'فهرس ميتاداتا متجدد للأبحاث والرسائل الجامعية الحديثة، مع روابط المصادر الأصلية وتصنيف موضوعي عربي. الإدراج لا يساوي اعتماد النتيجة العلمية؛ التحليل العربي الكامل يمر بمراجعة مستقلة.',
        url: `${SITE_URL}/magazine/#research-catalog`,
        inLanguage: ['ar', 'en'],
        isAccessibleForFree: true,
        temporalCoverage: catalogStats.oldestDate && catalogStats.newestDate ? `${catalogStats.oldestDate}/${catalogStats.newestDate}` : undefined,
        spatialCoverage: 'Global',
        creator: { '@id': `${SITE_URL}/#organization` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        keywords: catalogStats.clusters.map((item) => item.label),
        size: catalogStats.total,
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.page} dir="rtl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />

        <section className={styles.hero}>
          <div className={styles.shell}>
            <p className={styles.eyebrow}>المجلة والأبحاث · مرصد علمي متجدد</p>
            <h1>أحدث الأبحاث والرسائل الجامعية، ثم التحليل العربي الذي يضع الدليل في سياقه</h1>
            <p className={styles.heroLead}>نبني هنا مرجعًا عربيًا حيًا لا يكتفي بإعادة نشر العناوين. المرصد يتتبع أحدث الأعمال العلمية المرتبطة بمجالات روافد، بينما تنتقل الأعمال الأعلى قيمة إلى قراءة عربية نقدية تشرح السؤال والمنهج والعينة والنتائج والقيود وما يمكن — وما لا يمكن — استنتاجه.</p>
            <div className={styles.stats} aria-label="إحصاءات المرصد">
              <span><strong>{catalogStats.total.toLocaleString('ar')}</strong> سجل حديث</span>
              <span><strong>{catalogStats.articles.toLocaleString('ar')}</strong> ورقة علمية</span>
              <span><strong>{catalogStats.dissertations.toLocaleString('ar')}</strong> رسالة جامعية</span>
              <span><strong>{magazineOverview.count.toLocaleString('ar')}</strong> قراءة عربية نقدية منشورة</span>
              <span><strong>{catalogStats.last30Days.toLocaleString('ar')}</strong> من آخر 30 يومًا</span>
            </div>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.catalogOverview}`} aria-labelledby="coverage-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>تغطية متوازنة</p>
              <h2 id="coverage-title">10 عناقيد بحثية مرتبطة مباشرة بمجالات الموقع</h2>
            </div>
            <p>لا نسمح لموضوع واحد بابتلاع الفهرس. التحديث يوازن بين الصحة النفسية، التوحد، التربية الدامجة، الصرع، الإدمان، أورام الأطفال، التأهيل، الأسرة، اللغة والتواصل، وعلوم القرار الطبي.</p>
          </div>
          <div className={styles.clusterGrid}>
            {catalogStats.clusters.map((item) => (
              <a key={item.key} href={hrefWith(params, { cluster: item.key, rp: 1 }, 'research-catalog')}>
                <strong>{item.label}</strong>
                <span>{item.count.toLocaleString('ar')} سجل</span>
              </a>
            ))}
          </div>
          <div className={styles.qualityStrip}>
            <span><strong>{catalogStats.withDoi.toLocaleString('ar')}</strong> سجلًا بمعرّف DOI</span>
            <span><strong>{catalogStats.openAccess.toLocaleString('ar')}</strong> متاحًا بوصول مفتوح</span>
            <span><strong>{catalogStats.last90Days.toLocaleString('ar')}</strong> من آخر 90 يومًا</span>
            <span>أحدث تاريخ نشر: <strong>{formatDate(catalogStats.newestDate) ?? '—'}</strong></span>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.readingGuide}`} aria-labelledby="reading-guide-title">
          <p className={styles.eyebrow}>طبقتان مختلفتان — وهذا مقصود</p>
          <h2 id="reading-guide-title">الفهرسة السريعة لا تساوي المراجعة العلمية</h2>
          <div className={styles.guideGrid}>
            <article><h3>1. المرصد يكتشف</h3><p>يجمع ميتاداتا الأعمال الحديثة، يزيل المكرر والمُسحوب، ويربطها بعناقيد الموقع. وجود السجل هنا يعني أنه مرشح للفحص، لا أنه توصية علاجية أو حكم نهائي.</p></article>
            <article><h3>2. بوابة الجودة تنتقي</h3><p>الأعمال ذات الصلة والقيمة الأعلى تُراجع من المصدر الأصلي، مع الانتباه لنوع التصميم، التحيز، حجم العينة، مدة المتابعة، وحجم الأثر.</p></article>
            <article><h3>3. القراءة العربية تفسّر</h3><p>نحوّل الدليل إلى شرح عربي دقيق: سؤال البحث، المنهج، النتائج، الدلالة العملية، القيود، ومن تنطبق عليه النتائج ومن لا تنطبق عليه.</p></article>
            <article><h3>4. المصدر يبقى ظاهرًا</h3><p>لا نعزل القارئ عن الأصل. كل سجل في المرصد يقود إلى المصدر الخارجي، وكل تحليل منشور يحتفظ بمراجعه الأصلية القابلة للتحقق.</p></article>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.catalog}`} id="research-catalog" aria-labelledby="research-catalog-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>مرصد أحدث 1000</p>
              <h2 id="research-catalog-title">الأوراق العلمية والرسائل الجامعية الحديثة</h2>
            </div>
            <p>آخر مزامنة: {formatDateTime(catalogStats.lastSyncedAt) ?? '—'}. الفهرس متجدد ويحتفظ بآخر مجموعة صحيحة إذا تعذر مصدر البيانات بدل عرض قائمة ناقصة.</p>
          </div>

          <form className={styles.filters} method="get" action="/magazine/">
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
            {aq && <input type="hidden" name="aq" value={aq} />}
            {kind && <input type="hidden" name="kind" value={kind} />}
            {ap > 1 && <input type="hidden" name="ap" value={ap} />}
            <div className={styles.filterActions}>
              <button type="submit">تطبيق البحث</button>
              {(rq || cluster || rtype) && <a href={hrefWith(params, { rq: null, cluster: null, rtype: null, rp: 1 }, 'research-catalog')}>مسح الفلاتر</a>}
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

          <Pagination page={catalogPage.page} totalPages={catalogPage.totalPages} params={params} pageKey="rp" anchor="research-catalog" />
        </section>

        <section className={`${styles.shell} ${styles.catalog}`} id="arabic-analyses" aria-labelledby="magazine-catalog-title">
          <div className={styles.sectionHead}>
            <div><p className={styles.eyebrow}>الطبقة المحررة</p><h2 id="magazine-catalog-title">القراءات العربية النقدية المنشورة</h2></div>
            <p>{magazineOverview.count.toLocaleString('ar')} قراءة منشورة على مساراتها الأصلية، مع SEO وبيانات منظمة ومراجع أصلية. هذه الطبقة أبطأ عمدًا لأنها تتطلب تحليلًا لا مجرد فهرسة.</p>
          </div>

          <form className={styles.filters} method="get" action="/magazine/">
            <label>
              <span>ابحث في القراءات العربية</span>
              <input name="aq" defaultValue={aq} type="search" placeholder="اكتب موضوعًا أو حالة" />
            </label>
            <label>
              <span>نوع الدليل</span>
              <select name="kind" defaultValue={kind}>
                <option value="">كل أنواع الأدلة</option>
                {magazineOverview.kinds.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <input type="hidden" name="ap" value="1" />
            {rq && <input type="hidden" name="rq" value={rq} />}
            {cluster && <input type="hidden" name="cluster" value={cluster} />}
            {rtype && <input type="hidden" name="rtype" value={rtype} />}
            {rp > 1 && <input type="hidden" name="rp" value={rp} />}
            <div className={styles.filterActions}>
              <button type="submit">تطبيق البحث</button>
              {(aq || kind) && <a href={hrefWith(params, { aq: null, kind: null, ap: 1 }, 'arabic-analyses')}>مسح الفلاتر</a>}
            </div>
          </form>

          <div className={styles.chips} aria-label="أنواع الأدلة">{magazineOverview.kinds.map((value) => <a key={value} href={hrefWith(params, { kind: value, ap: 1 }, 'arabic-analyses')}>{value}</a>)}</div>
          <div className={styles.resultSummary}><strong>{magazinePage.count.toLocaleString('ar')}</strong> قراءة مطابقة</div>

          {magazinePage.items.length ? (
            <div className={styles.grid}>
              {magazinePage.items.map((item) => (
                <article className={styles.card} key={item.id}>
                  <div className={styles.cardMeta}><span>{evidenceKind(item)}</span>{item.published_at && <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>}</div>
                  <h3><a href={item.canonical_url || `/content/${item.slug}`}>{item.title}</a></h3>
                  {item.excerpt && <p>{item.excerpt}</p>}
                  <a className={styles.readMore} href={item.canonical_url || `/content/${item.slug}`}>قراءة التحليل كاملًا ←</a>
                </article>
              ))}
            </div>
          ) : <div className={styles.emptyState}>لا توجد قراءة عربية مطابقة حاليًا. يمكنك الرجوع إلى المرصد أعلاه لرؤية أحدث السجلات العلمية في المجال.</div>}

          <Pagination page={magazinePage.page} totalPages={magazinePage.totalPages} params={params} pageKey="ap" anchor="arabic-analyses" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
