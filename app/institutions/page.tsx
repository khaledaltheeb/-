import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, buildSeoMetadata } from '@/lib/seo';
import styles from '@/components/institutional-assurance-page.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'بوابة المؤسسات | العربية وRTL والوصولية والتقييم التقني',
  description: 'بوابة روافد للمؤسسات والمشروعات الدولية: تدقيق العربية وRTL، الوصولية، ضمان الترجمة والمصطلحات، تقييم التقنيات الصحية والمساندة، وأدوات مفتوحة المصدر قابلة للدمج في CI.',
  path: '/institutions',
  index: true,
  follow: true,
  keywords: ['تدقيق العربية', 'RTL', 'الوصولية', 'ضمان الترجمة', 'المصطلحات العربية', 'تقييم التقنيات المساندة', 'Arabic localization QA'],
  hreflang: { ar: '/institutions', en: '/en/institutions', 'x-default': '/institutions' },
});

const services = [
  {
    href: '/institutions/arabic-rtl-assurance',
    title: 'Arabic & RTL Assurance',
    description: 'مراجعة الواجهات والنماذج والتطبيقات العربية من ناحية الاتجاه، النص ثنائي الاتجاه، لوحة المفاتيح، الوصولية، الاستجابة، والاتساق بين اللغات.',
  },
  {
    href: '/institutions/terminology-qa',
    title: 'Terminology & Translation QA',
    description: 'قواعد قابلة للتدقيق للمصطلحات المطلوبة أو غير المفضلة، مقارنة نص المصدر والهدف، واكتشاف عدم الاتساق دون ادعاء أن الأتمتة بديل عن المراجع البشري.',
  },
  {
    href: '/institutions/technology-evaluation',
    title: 'Technology Evaluation',
    description: 'تقييم غير ترويجي للتقنيات الصحية والتأهيلية والتعليمية المساندة عبر الغرض المقصود والدليل والسلامة وسير العمل والعربية وRTL والوصولية والخصوصية والقياس والتنفيذ قبل أي pilot.',
  },
  {
    href: '/institutions/open-source',
    title: 'Open-source engineering toolkit',
    description: 'نواة TypeScript عامة ومفتوحة المصدر للعربية وRTL وi18n والوصولية، منفصلة عن المحتوى العلمي والتحريري لروافد.',
  },
] as const;

export default function InstitutionsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Rawafid Institutional Arabic, RTL and Technology Evaluation',
    url: absoluteSiteUrl('/institutions'),
    description: 'Institutional gateway for Arabic, RTL, accessibility, localization, terminology quality assurance, and independent technology evaluation.',
    inLanguage: ['ar', 'en'],
    isPartOf: { '@id': `${absoluteSiteUrl('/')}#website` },
  };

  return <div className={styles.page}>
    <SiteHeader />
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <span className={styles.eyebrow}>For institutions · للجهات والمؤسسات</span>
            <h1 className={styles.title}>العربية ليست طبقة ترجمة أخيرة، والتقنية لا تصبح مناسبة لأنها تعمل في عرض توضيحي.</h1>
            <p className={styles.lead}>تعمل روافد على سد الفجوة بين الترجمة العربية، هندسة RTL، الوصولية، ضبط المصطلحات، والتقييم المنهجي للتقنيات الصحية والتأهيلية والمساندة. نساعد الفرق على تحويل المشكلات والادعاءات إلى أدلة واختبارات وحدود قابلة للمراجعة بدل الاعتماد على الانطباع أو الفحص اليدوي المتأخر فقط.</p>
            <div className={styles.actions}>
              <a className={styles.primary} href="mailto:contact@healthrenewal.org?subject=Institutional%20Arabic%20%26%20RTL%20Assurance">تواصل مؤسسي</a>
              <a className={styles.secondary} href="https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit" target="_blank" rel="noreferrer">استعراض المستودع المفتوح</a>
            </div>
          </div>
          <aside className={styles.heroCard}>
            <h2>ما الذي يمكن مراجعته؟</h2>
            <ul>
              <li>مواقع ومنصات عامة باللغة العربية.</li>
              <li>تقنيات صحية وتأهيلية وتعليمية مساندة قبل الـpilot.</li>
              <li>نماذج الإبلاغ والخدمات الإلكترونية.</li>
              <li>ملفات ومفاتيح الترجمة وواجهات i18n.</li>
              <li>مصطلحات مؤسسية متعددة اللغات.</li>
              <li>RTL وUnicode/Bidi وحالات النص المختلط.</li>
              <li>مسارات لوحة المفاتيح والوصولية الأساسية.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Capabilities</p>
          <h2>أربع طبقات، دون خلط بين التقييم والمراجعة والتأييد</h2>
          <p>نحافظ على النواة الهندسية العامة مفتوحة المصدر، بينما تبقى القواميس أو قواعد المصطلحات الخاصة بكل مؤسسة منفصلة بحسب الترخيص والخصوصية والحوكمة. وعند تقييم منتج، نسجل ما يثبت وما يبقى فرضية قبل أي تجربة أوسع.</p>
        </div>
        <div className={styles.grid}>
          {services.map((service) => <article className={styles.card} key={service.href}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <Link className={styles.cardLink} href={service.href}>عرض التفاصيل ←</Link>
          </article>)}
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.twoColumn}>
          <article className={styles.panel}>
            <h2>طريقة العمل</h2>
            <ol>
              <li>تحديد مشكلة قابلة لإعادة الإنتاج أو سؤال قرار واضح.</li>
              <li>توثيق المثال وسياقه ومصدره قبل اقتراح أي تعديل أو pilot.</li>
              <li>فصل الخطأ الدلالي عن التفضيل الأسلوبي وعن آثار استخراج PDF أو RTL، وفصل usability عن الفعالية السريرية.</li>
              <li>تحويل القاعدة المتكررة إلى اختبار أو profile قابل للتشغيل حين يكون ذلك مناسبًا.</li>
              <li>إعادة التحقق بعد الإصلاح وربط النتيجة بدورة CI أو مراجعة إصدار أو قرار تنفيذ.</li>
            </ol>
          </article>
          <article className={styles.panel}>
            <h2>حدود الادعاء</h2>
            <ul>
              <li>الأدوات الآلية لا تثبت الصحة الدلالية الكاملة للترجمة.</li>
              <li>المجالات الطبية والقانونية وحماية الطفل تحتاج حوكمة ومراجعين مؤهلين.</li>
              <li>وجود demo أو دراسة أولية لا يثبت الفعالية أو الملاءمة لكل جمهور.</li>
              <li>لا نستخدم شعار أو اسم جهة لإيحاء شراكة أو اعتماد غير مؤكد.</li>
              <li>لا نضع مفردات أو مواد محمية داخل المستودع المفتوح دون حق واضح في إعادة توزيعها.</li>
            </ul>
          </article>
        </div>
        <div className={styles.notice}><strong>مبدأ أساسي:</strong> تقديم ملاحظة أو تدقيق أو أداة أو تقييم لجهة لا يعني أن الجهة راجعت روافد أو أيدتها أو دخلت معها في شراكة. أي علاقة مؤسسية تُوصف فقط وفق ما تم تأكيده كتابيًا.</div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Engineering evidence</p>
          <h2>نركز على أدلة قابلة لإعادة التشغيل</h2>
        </div>
        <div className={styles.evidence}>
          <div className={styles.metric}><strong>TypeScript</strong><span>نواة قابلة لإعادة الاستخدام في تطبيقات الويب الحديثة.</span></div>
          <div className={styles.metric}><strong>Zero runtime dependencies</strong><span>أجزاء أساسية من الـToolkit تعمل دون اعتماديات تشغيل إضافية.</span></div>
          <div className={styles.metric}><strong>Cross-browser tests</strong><span>اختبارات RTL ووصولية في متصفحات ومقاسات متعددة ضمن المستودع المفتوح.</span></div>
          <div className={styles.metric}><strong>Machine-readable QA</strong><span>نتائج يمكن دمجها في CI وتقارير المراجعة بدل حصرها في مستندات بشرية.</span></div>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.cta}`}>
        <h2>هل لديكم منتج أو مورد عربي يحتاج مراجعة دقيقة؟</h2>
        <p>أفضل بداية ليست عقدًا كبيرًا. يمكن أن تبدأ بمثال عام واحد قابل للتحقق، أو مجموعة صغيرة من مفاتيح الترجمة، أو صفحة عامة، أو demo بحدود واضحة، ثم نحدد إن كانت المشكلة تستحق اختبارًا أو pilot أوسع.</p>
        <div className={styles.actions}>
          <a className={styles.primary} href="mailto:contact@healthrenewal.org?subject=Arabic%20Localization%20QA%20Sample">طلب مراجعة عينة</a>
          <Link className={styles.secondary} href="/about">عن روافد</Link>
        </div>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
  </div>;
}
