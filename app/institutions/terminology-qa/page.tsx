import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, buildSeoMetadata } from '@/lib/seo';
import styles from '@/components/institutional-assurance-page.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Terminology & Translation QA للعربية',
  description: 'ضمان المصطلحات والترجمة العربية للمؤسسات: قواعد مطلوبة وغير مفضلة، مقارنة المصدر والهدف، اتساق القواميس، ونتائج قابلة للدمج في CI مع مراجعة بشرية.',
  path: '/institutions/terminology-qa',
  index: true,
  follow: true,
  keywords: ['Arabic terminology QA', 'translation quality assurance', 'تدقيق المصطلحات', 'تعريب مؤسسي', 'glossary validation'],
});

const workflow = [
  ['Source-triggered rules', 'يمكن ربط القاعدة بمصطلح أو سياق محدد في النص المصدر لتقليل الإنذارات الكاذبة.'],
  ['Required / deprecated wording', 'تحديد صيغ عربية مطلوبة أو غير مفضلة، مع درجة شدة ورسالة تفسيرية قابلة للمراجعة.'],
  ['Catalog audit', 'تطبيق القواعد على مفاتيح الترجمة المتطابقة بين لغة المصدر والعربية مع حفظ المفتاح في finding لتسهيل الإصلاح.'],
  ['Human governance', 'المصطلحات الحساسة تحتاج مصدرًا ومراجعًا وسياقًا وتاريخ مراجعة مناسبًا للمجال، ولا تعامل كحقيقة آلية.'],
  ['CI integration', 'يمكن تشغيل القواعد كتحذير أو بوابة إصدار وفق مستوى الثقة وسياسة المؤسسة.'],
  ['Versioned profiles', 'يبقى profile المؤسسة منفصلًا عن المحرك العام ويمكن تحديثه مع تغير الإرشادات أو أسلوب المؤسسة.'],
] as const;

export default function TerminologyQaPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Arabic Terminology and Translation Quality Assurance',
    provider: { '@id': `${absoluteSiteUrl('/')}#organization` },
    areaServed: 'Worldwide',
    serviceType: 'Arabic terminology and translation QA',
    url: absoluteSiteUrl('/institutions/terminology-qa'),
  };

  return <div className={styles.page}>
    <SiteHeader />
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <span className={styles.eyebrow}>Terminology · Translation · CI</span>
            <h1 className={styles.title}>حوّل دليل المصطلحات من ملف يُقرأ أحيانًا إلى قاعدة جودة قابلة للاختبار.</h1>
            <p className={styles.lead}>القواميس المؤسسية مهمة، لكن المشكلة تظهر عندما لا يصل المصطلح المفضل إلى المنتج الفعلي أو يتغير المعنى بين الصفحات والإصدارات. يوفر محرك روافد المفتوح طبقة حتمية لاكتشاف قواعد محددة في النصوص ومفاتيح الترجمة، مع إبقاء الحكم الدلالي النهائي للمراجعة البشرية.</p>
            <div className={styles.actions}>
              <a className={styles.primary} href="mailto:contact@healthrenewal.org?subject=Arabic%20Terminology%20QA">مناقشة profile تجريبي</a>
              <Link className={styles.secondary} href="/institutions/open-source">رؤية المحرك المفتوح</Link>
            </div>
          </div>
          <aside className={styles.heroCard}>
            <h2>أمثلة لمشكلات قابلة للاكتشاف</h2>
            <ul>
              <li>مصطلح قديم ما زال يظهر في صفحات جديدة.</li>
              <li>سقوط جزء من مصطلح مركب في العربية.</li>
              <li>اختلاف المفردة نفسها بين الموقع والتطبيق والتقرير.</li>
              <li>عدم تطبيق glossary معتمد داخليًا على بعض مفاتيح الترجمة.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>Method</p><h2>من القاعدة اللغوية إلى evidence قابل للتدقيق</h2><p>نستخدم الأتمتة فقط حين يمكن تعريف القاعدة بوضوح. كل ما يحتاج فهمًا دلاليًا أوسع يبقى ضمن مسار المراجعة البشرية.</p></div>
        <div className={styles.grid}>{workflow.map(([title, description]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.twoColumn}>
          <article className={styles.panel}>
            <h2>Profile مؤسسي جيد يتضمن</h2>
            <ul>
              <li>معرّفًا وإصدارًا واضحين.</li>
              <li>لغة المصدر والهدف عند الحاجة.</li>
              <li>السياق الذي يفعّل القاعدة.</li>
              <li>الصيغة المطلوبة أو الصيغ غير المفضلة.</li>
              <li>السبب والمصدر والدرجة والحالة التحريرية في طبقة الحوكمة.</li>
              <li>سياسة لما يفشل الإصدار وما يبقى تحذيرًا فقط.</li>
            </ul>
          </article>
          <article className={styles.panel}>
            <h2>حماية الملكية والمصادر</h2>
            <p>المحرك العام مفتوح المصدر، لكن هذا لا يعني أن كل glossary يجب نشره. يمكن إبقاء قواعد المؤسسة في مستودعها أو بيئتها الخاصة، ولا نعيد توزيع مصطلحات خاصة أو مقيدة دون حق واضح.</p>
            <p>كما لا نسمي profile باسم مؤسسة بما يوحي أنه رسمي أو معتمد منها ما لم توافق المؤسسة صراحة.</p>
          </article>
        </div>
        <div className={styles.notice}><strong>مهم:</strong> اكتشاف مصطلح غير مفضل لا يثبت وحده أن الجملة مترجمة خطأ، ووجود المصطلح المفضل لا يثبت أن الترجمة صحيحة. المحرك طبقة QA للقواعد المحددة، وليس بديلًا عن المراجعة اللغوية المتخصصة.</div>
      </section>

      <section className={`${styles.shell} ${styles.cta}`}>
        <h2>لديكم glossary؟ يمكن اختباره على عينة صغيرة أولًا.</h2>
        <p>نستطيع البدء بعدد محدود من القواعد عالية الثقة على محتوى مصرح به أو نصوص عامة، وقياس الإنذارات الكاذبة قبل أي توسع.</p>
        <div className={styles.actions}><a className={styles.primary} href="mailto:contact@healthrenewal.org?subject=Terminology%20Profile%20Pilot">طلب pilot صغير</a><a className={styles.secondary} href="https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit" target="_blank" rel="noreferrer">GitHub</a></div>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
  </div>;
}
