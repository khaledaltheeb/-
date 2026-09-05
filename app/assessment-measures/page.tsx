import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import {
  arabicStatusBadge,
  assessmentMeasureCategories,
  assessmentMeasures,
  getMeasuresByCategory,
  rightsBadge,
} from '@/lib/assessment-measures-catalog';
import styles from '@/components/assessment-measures.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'المقاييس وأدوات التقييم المستخدمة عالميًا',
  description: 'مكتبة عربية موثقة للمقاييس وأدوات التقييم المستخدمة عالميًا: الغرض، الفئة، التطبيق، التسجيل، النسخ العربية، حدود التفسير وحقوق إعادة الاستخدام.',
  path: '/assessment-measures/',
  index: true,
  follow: true,
  type: 'website',
  keywords: ['مقاييس التقييم', 'أدوات التقييم', 'مقاييس التأهيل', 'مقاييس الصحة النفسية', 'مقاييس السكتة الدماغية', 'اختبارات التوازن', 'RMD', 'Rehabilitation Measures Database'],
  relatedTerms: ['measurement instruments', 'outcome measures', 'rehabilitation measures', 'assessment tools'],
  searchIntents: ['اختيار مقياس تقييم', 'طريقة استخدام مقياس', 'هل المقياس مجاني', 'هل توجد نسخة عربية'],
});

type PageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

function normalize(value?: string) {
  return (value ?? '').trim().toLocaleLowerCase('ar');
}

export default async function AssessmentMeasuresPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = normalize(params.q);
  const category = params.category ?? '';
  const filtered = assessmentMeasures.filter((measure) => {
    const categoryMatch = !category || measure.categories.includes(category);
    if (!query) return categoryMatch;
    const haystack = [measure.nameAr, measure.nameEn, measure.acronym, measure.summary, measure.purpose, measure.construct, ...measure.populations].join(' ').toLocaleLowerCase('ar');
    return categoryMatch && haystack.includes(query);
  });
  const publicDomainCount = assessmentMeasures.filter((measure) => measure.rightsStatus === 'public-domain').length;
  const arabicEvidenceCount = assessmentMeasures.filter((measure) => measure.arabicStatus === 'validated-version-reported').length;
  const arabicProtocolCount = assessmentMeasures.filter((measure) => measure.fullArabicFormPublished).length;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/assessment-measures/#page`,
    url: `${SITE_URL}/assessment-measures/`,
    name: 'المقاييس وأدوات التقييم المستخدمة عالميًا',
    description: 'مكتبة عربية موثقة للمقاييس وأدوات التقييم مع الأدلة وحقوق الاستخدام وحدود التفسير.',
    inLanguage: 'ar',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: assessmentMeasures.length,
      itemListElement: assessmentMeasures.map((measure, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${measure.nameAr} (${measure.acronym})`,
        url: `${SITE_URL}/assessment-measures/${measure.slug}/`,
      })),
    },
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">المقاييس وأدوات التقييم</span>
        </nav>

        <section className={styles.hero} aria-labelledby="assessment-measures-title">
          <span className={styles.eyebrow}>مكتبة حقوق + أدلة + استخدام مسؤول</span>
          <h1 id="assessment-measures-title">المقاييس وأدوات التقييم المستخدمة عالميًا</h1>
          <p>مرجع عربي منظم يوضح ماذا يقيس كل مقياس، لمن صُمم، كيف يُطبق ويُسجل، ما حدود تفسيره، هل توجد نسخة عربية موثقة، وما الذي تسمح به حقوق الاستخدام وإعادة النشر. إدراج الأداة هنا لا يعني اعتمادًا عالميًا موحدًا ولا يحول أداة فحص أو نتائج إلى تشخيص مستقل.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#library">استكشف المقاييس</a>
            <Link className={styles.secondaryAction} href="/assessment-measures/compare/">قارن المقاييس</Link>
            <Link className={styles.secondaryAction} href="/assessment-measures/methodology/">منهجية التحقق والحقوق</Link>
          </div>
          <div className={styles.stats} aria-label="إحصاءات الإصدار الحالي">
            <div className={styles.stat}><strong>{assessmentMeasures.length}</strong><span>مقياسًا في الإصدار الأول الموثق</span></div>
            <div className={styles.stat}><strong>{publicDomainCount}</strong><span>أصلًا بحالة Public Domain موثقة</span></div>
            <div className={styles.stat}><strong>{arabicEvidenceCount}</strong><span>لها نسخة/دراسة عربية منشورة</span></div>
            <div className={styles.stat}><strong>{arabicProtocolCount}</strong><span>بروتوكولات عربية تشغيلية جاهزة</span></div>
          </div>
          <div className={styles.notice}>لا ننشر بنود ترجمة عربية كاملة لمجرد أن الأصل مجاني. حقوق الأصل وحقوق الترجمة مساران منفصلان، ويُثبت مصدر كل نسخة قبل عرضها.</div>
        </section>

        <section className={styles.section} aria-labelledby="categories-title">
          <div className={styles.sectionHead}>
            <div><h2 id="categories-title">ابدأ بما تريد قياسه</h2><p>المقياس الواحد قد يظهر في أكثر من مجموعة لأن الاستخدامات السريرية والوظيفية متداخلة.</p></div>
          </div>
          <div className={styles.categoryGrid}>
            {assessmentMeasureCategories.map((item) => {
              const count = getMeasuresByCategory(item.slug).length;
              return <Link key={item.slug} className={styles.categoryCard} href={`/assessment-measures/category/${item.slug}/`}>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
                <div className={styles.categoryMeta}><span>{count} مقياس</span><span>فتح المجموعة ←</span></div>
              </Link>;
            })}
          </div>
        </section>

        <section className={styles.section} id="library" aria-labelledby="library-title">
          <div className={styles.sectionHead}>
            <div><h2 id="library-title">المكتبة الموثقة</h2><p>ابحث بالاسم العربي أو الإنجليزي أو الاختصار أو الغرض.</p></div>
            <Link href="/assessment-measures/compare/">فتح المقارنة ←</Link>
          </div>
          <form className={styles.toolbar} action="/assessment-measures/" method="get" role="search">
            <label htmlFor="assessment-measures-query">البحث في المقاييس</label>
            <input id="assessment-measures-query" name="q" type="search" defaultValue={params.q ?? ''} placeholder="مثال: المشي، PHQ-9، التوازن، السكتة الدماغية" maxLength={120} />
            <label htmlFor="assessment-measures-category">تصفية حسب المجال</label>
            <select id="assessment-measures-category" name="category" defaultValue={category}>
              <option value="">كل المجالات</option>
              {assessmentMeasureCategories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
            <button type="submit">تطبيق</button>
          </form>

          {filtered.length ? <div className={styles.grid}>
            {filtered.map((measure) => <article className={styles.card} key={measure.slug}>
              <div className={styles.cardMeta}>
                <span className={styles.badge}>{rightsBadge(measure.rightsStatus)}</span>
                <span className={measure.fullArabicFormPublished ? styles.badgeSoft : styles.badgeWarn}>{arabicStatusBadge(measure.arabicStatus)}</span>
              </div>
              <h3><Link href={`/assessment-measures/${measure.slug}/`}>{measure.nameAr} — {measure.acronym}</Link></h3>
              <span className={styles.englishName} lang="en" dir="ltr">{measure.nameEn}</span>
              <p>{measure.summary}</p>
              <div className={styles.cardFoot}><span>{measure.administrationTime}</span><Link href={`/assessment-measures/${measure.slug}/`}>الدليل الكامل ←</Link></div>
            </article>)}
          </div> : <div className={styles.empty}><strong>لا توجد نتائج مطابقة.</strong><p>جرّب اختصار المقياس أو اسم المجال بدل عبارة طويلة.</p><Link href="/assessment-measures/">مسح عوامل التصفية</Link></div>}
        </section>

        <section className={styles.section} aria-labelledby="use-title">
          <div className={styles.sectionHead}><div><h2 id="use-title">كيف تستخدم القسم؟</h2><p>أربع خطوات تمنع أكثر أخطاء استخدام المقاييس شيوعًا.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>1. اختر البنية الصحيحة</h3><p>ابدأ بالبنية المراد قياسها: توازن، سرعة مشي، اكتئاب، عجز أو مشاركة. لا تبدأ باسم مقياس مشهور ثم تجبره على سؤال لا يقيسه.</p></article>
            <article className={styles.methodCard}><h3>2. طابق المجتمع والبروتوكول</h3><p>تحقق أن المقياس دُرس على مجتمع قريب من حالتك وأن طريقة التطبيق والمسافة والزمن والنسخة اللغوية متطابقة مع المرجع الذي ستقارن به.</p></article>
            <article className={styles.methodCard}><h3>3. افصل القياس عن التشخيص</h3><p>درجة مرتفعة أو منخفضة قد تكون إشارة مهمة، لكنها لا تصبح تشخيصًا تلقائيًا. استخدم النتيجة ضمن تاريخ وفحص وسياق مهني مناسب.</p></article>
            <article className={styles.methodCard}><h3>4. افحص الحقوق قبل النسخ</h3><p>يمكن استخدام بعض الأدوات مجانًا دون أن يكون من المسموح إعادة نشر نموذجها أو ترجمتها. صفحة كل مقياس تعرض حالة الأصل والنسخة العربية منفصلتين.</p></article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
