import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import {
  arabicStatusBadge,
  assessmentMeasureCategories,
  assessmentMeasureSlugs,
  getAssessmentMeasure,
  rightsBadge,
} from '@/lib/assessment-measures-catalog';
import styles from '@/components/assessment-measures.module.css';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return assessmentMeasureSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const measure = getAssessmentMeasure(slug);
  if (!measure) return {};
  return buildSeoMetadata({
    title: `${measure.nameAr} (${measure.acronym}) — دليل الاستخدام والحقوق`,
    description: `${measure.summary} تعرّف إلى طريقة التطبيق والتسجيل وحدود التفسير والنسخة العربية وحقوق الاستخدام والمصادر الموثوقة.`,
    path: `/assessment-measures/${measure.slug}/`,
    index: true,
    follow: true,
    type: 'article',
    keywords: [measure.nameAr, measure.nameEn, measure.acronym, measure.construct, 'طريقة الاستخدام', 'تفسير الدرجة', 'حقوق الاستخدام'],
    relatedTerms: measure.populations,
    searchIntents: [`طريقة استخدام ${measure.acronym}`, `تفسير ${measure.acronym}`, `هل ${measure.acronym} مجاني`, `النسخة العربية من ${measure.acronym}`],
  });
}

export default async function AssessmentMeasureDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const measure = getAssessmentMeasure(slug);
  if (!measure) notFound();

  const categoryRecords = measure.categories
    .map((categorySlug) => assessmentMeasureCategories.find((item) => item.slug === categorySlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const related = measure.related.map((relatedSlug) => getAssessmentMeasure(relatedSlug)).filter((item): item is NonNullable<typeof item> => Boolean(item));

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'المقاييس وأدوات التقييم', item: `${SITE_URL}/assessment-measures/` },
      { '@type': 'ListItem', position: 3, name: measure.nameAr, item: `${SITE_URL}/assessment-measures/${measure.slug}/` },
    ],
  };
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/assessment-measures/${measure.slug}/#page`,
    url: `${SITE_URL}/assessment-measures/${measure.slug}/`,
    name: `${measure.nameAr} (${measure.acronym})`,
    description: measure.summary,
    inLanguage: 'ar',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    about: {
      '@type': 'Thing',
      name: measure.nameEn,
      alternateName: measure.acronym,
      description: measure.purpose,
    },
    citation: measure.sources.map((source) => source.url),
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, pageSchema]).replace(/</g, '\\u003c') }} />
        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-measures/">المقاييس وأدوات التقييم</Link><span>/</span><span aria-current="page">{measure.acronym}</span>
        </nav>

        <section className={styles.detailHero}>
          <div className={styles.detailHeroMain}>
            <div className={styles.cardMeta}>
              <span className={styles.badge}>{rightsBadge(measure.rightsStatus)}</span>
              <span className={measure.fullArabicFormPublished ? styles.badgeSoft : styles.badgeWarn}>{arabicStatusBadge(measure.arabicStatus)}</span>
            </div>
            <h1>{measure.nameAr} <span>({measure.acronym})</span></h1>
            <div className={styles.english} lang="en" dir="ltr">{measure.nameEn} · {measure.version}</div>
            <p className={styles.summary}>{measure.summary}</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#usage">دليل الاستخدام</a>
              <a className={styles.secondaryAction} href="#rights">الحقوق والنسخة العربية</a>
              <Link className={styles.secondaryAction} href={`/assessment-measures/compare/?measure=${encodeURIComponent(measure.slug)}`}>أضف إلى المقارنة</Link>
            </div>
          </div>

          <aside className={styles.rightsPanel} aria-label="ملخص الحقوق والإتاحة">
            <h2>حالة الاستخدام</h2>
            <div className={styles.rightsRow}><span>الأصل</span><strong>{measure.rightsLabel}</strong></div>
            <div className={styles.rightsRow}><span>النسخة العربية</span><strong>{measure.arabicLabel}</strong></div>
            <div className={styles.rightsRow}><span>النموذج العربي الكامل على روافد</span><strong>{measure.fullArabicFormPublished ? 'متاح كإجراء/بروتوكول عربي موثق' : 'غير منشور حتى اكتمال تحقق النسخة'}</strong></div>
            <div className={styles.rightsRow}><span>آخر تحقق للحقوق</span><strong>{measure.rightsVerifiedOn}</strong></div>
          </aside>
        </section>

        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <section className={styles.panel} aria-labelledby="overview-title">
              <h2 id="overview-title">ماذا يقيس؟ ومتى يُستخدم؟</h2>
              <p><strong>البنية المقاسة:</strong> {measure.construct}.</p>
              <p><strong>الغرض:</strong> {measure.purpose}</p>
              <div className={styles.facts}>
                <div className={styles.fact}><span>طريقة التطبيق</span><strong>{measure.administrationMode}</strong></div>
                <div className={styles.fact}><span>الوقت التقريبي</span><strong>{measure.administrationTime}</strong></div>
                <div className={styles.fact}><span>الفئات الشائعة</span><strong>{measure.populations.join(' · ')}</strong></div>
                <div className={styles.fact}><span>بيئات الاستخدام</span><strong>{measure.settings.join(' · ')}</strong></div>
              </div>
            </section>

            <section className={styles.panel} id="usage" aria-labelledby="usage-title">
              <h2 id="usage-title">دليل الاستخدام</h2>
              <h3>ما الذي تحتاجه؟</h3>
              <ul>{measure.equipment.map((item) => <li key={item}>{item}</li>)}</ul>
              <h3>خطوات التطبيق</h3>
              <ol>{measure.administrationSteps.map((step) => <li key={step}>{step}</li>)}</ol>
            </section>

            <section className={styles.panel} aria-labelledby="scoring-title">
              <h2 id="scoring-title">التسجيل وتفسير النتيجة</h2>
              <h3>طريقة التسجيل</h3>
              <p>{measure.scoring}</p>
              <h3>كيف تُفسر النتيجة؟</h3>
              <p>{measure.interpretation}</p>
              <div className={styles.callout}><strong>قاعدة ثابتة:</strong> لا تنقل Cut-off أو MDC أو MCID أو قيمة مرجعية من مجتمع إلى آخر دون التحقق من الدراسة والسياق والبروتوكول واللغة.</div>
            </section>

            <section className={styles.panel} aria-labelledby="limits-title">
              <h2 id="limits-title">القيود وما الذي لا يخبرك به المقياس</h2>
              <ul>{measure.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>

            <section className={styles.panel} aria-labelledby="safety-title">
              <h2 id="safety-title">السلامة والحدود المهنية</h2>
              <ul>{measure.safetyNotes.map((item) => <li key={item}>{item}</li>)}</ul>
              <p>إدراج المقياس في المكتبة لا يعني أنه مناسب لكل شخص أو أن النتيجة تشخيص. بعض الأدوات تتطلب تدريبًا أو فحص سلامة أو تفسيرًا سريريًا متخصصًا.</p>
            </section>

            <section className={styles.panel} id="rights" aria-labelledby="rights-title">
              <h2 id="rights-title">الحقوق والنسخة العربية</h2>
              <h3>حقوق الأصل</h3>
              <p>{measure.rightsNote}</p>
              <h3>حالة العربية</h3>
              <p>{measure.arabicNote}</p>
              <div className={styles.statusBox}>
                <strong>{measure.fullArabicFormPublished ? 'ما هو منشور بالعربية؟' : 'لماذا لا نعرض النموذج العربي كاملًا الآن؟'}</strong>
                <p>{measure.fullArabicFormNote}</p>
              </div>
            </section>
          </div>

          <aside className={styles.side}>
            <section className={styles.panel} aria-labelledby="categories-side-title">
              <h2 id="categories-side-title">المجموعات</h2>
              <div className={styles.relatedList}>{categoryRecords.map((category) => <Link key={category.slug} href={`/assessment-measures/category/${category.slug}/`}>{category.name}</Link>)}</div>
            </section>

            <section className={styles.panel} aria-labelledby="sources-title">
              <h2 id="sources-title">المصادر الأصلية والحقوق</h2>
              <div className={styles.sourceList}>{measure.sources.map((source) => <a key={`${source.role}-${source.url}`} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
              <p>RMD مصدر للأدلة والمعلومات عن المقاييس، وليس بالضرورة مالك حقوق الأداة. لذلك نعرض مصدر الحقوق بصورة مستقلة.</p>
            </section>

            {related.length > 0 && <section className={styles.panel} aria-labelledby="related-title">
              <h2 id="related-title">مقاييس مرتبطة</h2>
              <div className={styles.relatedList}>{related.map((item) => <Link key={item.slug} href={`/assessment-measures/${item.slug}/`}>{item.nameAr} — {item.acronym}</Link>)}</div>
            </section>}

            <section className={styles.panel} aria-labelledby="method-side-title">
              <h2 id="method-side-title">كيف تحققنا؟</h2>
              <p>نفصل بين الأدلة العلمية، تكلفة الاستخدام، ملكية الأداة، حق إعادة نشر الأصل، وحقوق الترجمة. اقرأ منهجية المكتبة قبل إعادة استخدام أي نموذج.</p>
              <Link className={styles.secondaryAction} href="/assessment-measures/methodology/">فتح المنهجية</Link>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
