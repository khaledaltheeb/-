import type { Metadata } from 'next';
import Link from 'next/link';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import {
  guidedAssessmentGroups,
  guidedAssessmentReferences,
  guidedAssessmentTopics,
  legacySlugForTopic,
} from '@/lib/guided-assessment/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from './guided-assessment.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'أسئلة استرشادية للتحضير لموعد الصحة النفسية',
  description: 'دليل عربي منظم يساعد البالغين والأسر على تجهيز الملاحظات والأسئلة قبل موعد الصحة النفسية، من دون تشخيص ذاتي أو درجات آلية، وبمراجع رسمية.',
  path: '/guided-assessment',
  index: true,
  follow: true,
  keywords: ['التحضير لموعد الصحة النفسية', 'أسئلة للمختص النفسي', 'التقييم النفسي', 'الصحة النفسية'],
});

export default function GuidedAssessmentPage() {
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الأسئلة الاسترشادية', path: '/guided-assessment' },
  ]);

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />

        <section className={styles.hero}>
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span>الأسئلة الاسترشادية</span></nav>
            <span className={styles.eyebrow}>تحضير للمقابلة · لا تشخيص ذاتي</span>
            <h1>نظّم ما تريد مناقشته مع المختص بدل البحث عن «نتيجة» من قائمة أسئلة</h1>
            <p className={styles.lead}>هذه الأداة تعيد تنظيم مئة صفحة قديمة متشابهة في بنك واحد واضح. اختر الموضوع والفئة العمرية، ثم استخدم الأسئلة لتجهيز أمثلة ومعلومات قد تساعد الحوار مع مقدم الرعاية. لا تمنح الأداة درجة، ولا تقرر وجود اضطراب، ولا تستبدل التقييم المهني.</p>
            <div className={styles.heroFacts} role="list" aria-label="حدود الأداة">
              <span role="listitem"><strong>50</strong> موضوعًا</span>
              <span role="listitem"><strong>100</strong> رابط تاريخي محفوظ</span>
              <span role="listitem"><strong>0</strong> درجات تشخيصية</span>
              <span role="listitem"><strong>0</strong> إجابات تُرسل للخادم</span>
            </div>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.method}`} aria-labelledby="guided-method-title">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>طريقة الاستخدام</span>
            <h2 id="guided-method-title">أربع قواعد قبل اختيار الموضوع</h2>
          </div>
          <div className={styles.methodGrid}>
            <article><strong>01</strong><h3>ابدأ بالأثر لا بالملصق</h3><p>صف ما يحدث ومتى يحدث وكيف يؤثر في الحياة اليومية. الاسم المختصر للموضوع مجرد نقطة بداية للحوار.</p></article>
            <article><strong>02</strong><h3>استخدم أمثلة قابلة للفهم</h3><p>التوقيت، التكرار، السياق والتغير عن المعتاد أكثر فائدة من أوصاف عامة مثل «سيئ جدًا» أو «دائمًا».</p></article>
            <article><strong>03</strong><h3>أحضر السياق الصحي</h3><p>قائمة الأدوية والأمراض الجسدية والعلاجات السابقة والمعلومات النمائية أو المدرسية قد تغيّر فهم الصورة.</p></article>
            <article><strong>04</strong><h3>السلامة تسبق الاستبيان</h3><p>عند وجود خطر فوري على النفس أو الآخرين أو فقدان شديد للاتصال بالواقع، اطلب مساعدة طارئة محلية بدل إكمال القائمة.</p></article>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.directory}`} aria-labelledby="guided-directory-title">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>بنك الموضوعات</span>
            <h2 id="guided-directory-title">اختر الموضوع ثم النسخة المناسبة للعمر</h2>
            <p>تفتح الروابط التاريخية نفسها، لكنها الآن تستخدم محركًا موحدًا بدل مئة صفحة رقيقة متكررة.</p>
          </div>
          {guidedAssessmentGroups.map((group) => (
            <section key={group} className={styles.topicGroup} aria-labelledby={`group-${guidedAssessmentGroups.indexOf(group)}`}>
              <h3 id={`group-${guidedAssessmentGroups.indexOf(group)}`}>{group}</h3>
              <div className={styles.topicGrid}>
                {guidedAssessmentTopics.map((topic, index) => topic.group === group ? (
                  <article key={topic.key} className={styles.topicCard}>
                    <h4>{topic.label}</h4>
                    {topic.label !== topic.legacyLabel ? <p className={styles.legacyName}>الاسم التاريخي: {topic.legacyLabel}</p> : null}
                    <div className={styles.topicLinks}>
                      <Link href={`/guided-assessment/${legacySlugForTopic(index, 'adult')}`}>نسخة البالغين</Link>
                      <Link href={`/guided-assessment/${legacySlugForTopic(index, 'child')}`}>الأطفال والمراهقون</Link>
                    </div>
                  </article>
                ) : null)}
              </div>
            </section>
          ))}
        </section>

        <section className={`${styles.shell} ${styles.evidence}`} aria-labelledby="guided-evidence-title">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>الأساس العلمي</span>
            <h2 id="guided-evidence-title">لماذا تسأل الأداة عن السياق والأثر والاستعداد للموعد؟</h2>
          </div>
          <p>NIMH ينصح بالتحضير المسبق للأسئلة وقائمة الأدوية والمعلومات ذات الصلة قبل مناقشة الصحة النفسية مع مقدم الرعاية. وعند الأطفال، لا يكفي عرض واحد منفصل؛ فالتقييم الشامل قد يجمع التاريخ النمائي والأسري ومعلومات المدرسة ومقابلة الطفل بحسب الحاجة. وتوضح إرشادات WHO mhGAP أن التقييم والرعاية المهنية عمليتان منظمتان قائمتان على السياق السريري، وليستا نتيجة قائمة أسئلة ذاتية منفردة.</p>
          <div className={styles.referenceList}>
            {guidedAssessmentReferences.map((reference) => (
              <article key={reference.url}>
                <h3><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></h3>
                <p>{reference.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.shell} ${styles.boundary}`} aria-labelledby="guided-boundary-title">
          <div>
            <span className={styles.eyebrow}>حدود مسؤولة</span>
            <h2 id="guided-boundary-title">هذه ليست أداة فرز سريري ولا اختبارًا تشخيصيًا</h2>
          </div>
          <p>لم نضف نقاطًا أو حدود قطع أو استنتاجات آلية؛ لأن ذلك يحتاج أداة مقننة مناسبة للغرض والسكان واللغة والترجمة وطريقة الحساب. إذا كنت تبحث عن تقييم أو علاج، استخدم هذه الصفحة فقط لترتيب ما تريد مناقشته مع مختص مؤهل.</p>
          <Link href="/medical-review-policy">منهجية المراجعة العلمية في روافد</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
