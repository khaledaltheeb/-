import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, buildSeoMetadata } from '@/lib/seo';
import styles from '@/components/institutional-assurance-page.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Rawafid Arabic/RTL Accessibility & Localization Toolkit',
  description: 'أداة مفتوحة المصدر للعربية وRTL وi18n والوصولية: TypeScript، Unicode/Bidi، locale، catalog QA، terminology QA، واختبارات متصفحات.',
  path: '/institutions/open-source',
  index: true,
  follow: true,
  keywords: ['Arabic RTL toolkit', 'Arabic accessibility open source', 'RTL TypeScript', 'i18n Arabic', 'Arabic localization testing'],
});

const capabilities = [
  ['RTL & bidi', 'تحديد الاتجاه، عزل النص المختلط، كشف محارف Bidi، وCSS logical-side helpers.'],
  ['Locale & i18n', 'تفاوض locale، formatting، plural rules، display names، pseudo-localization وكتالوجات الرسائل.'],
  ['Arabic text', 'تطبيع محافظ، بحث، تشكيل، grapheme segmentation، الأرقام العربية والفارسية واللاتينية.'],
  ['Accessibility interactions', 'لوحة المفاتيح، roving focus، typeahead، selection، grid navigation، focus وlive regions.'],
  ['Terminology QA', 'قواعد source-conditioned، صيغ مطلوبة وغير مفضلة، catalog audit، summary وprofile validation.'],
  ['Verification', 'اختبارات وحدات ومتصفحات، package contracts، public API governance، CodeQL وDependency Review.'],
] as const;

export default function OpenSourcePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'Rawafid Arabic/RTL Accessibility & Localization Toolkit',
    codeRepository: 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit',
    programmingLanguage: 'TypeScript',
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
    url: absoluteSiteUrl('/institutions/open-source'),
    description: 'Open-source Arabic, RTL, localization and accessibility utilities and QA primitives.',
  };

  return <div className={styles.page}>
    <SiteHeader />
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <span className={styles.eyebrow}>Apache-2.0 · TypeScript · Public OSS</span>
            <h1 className={styles.title}>نواة عامة يمكن لأي مشروع استخدامها، لا نسخة مخفية من محتوى روافد.</h1>
            <p className={styles.lead}>أنشأنا مستودعًا منفصلًا للكود الهندسي القابل لإعادة الاستخدام في العربية وRTL والوصولية والتعريب. لا يتضمن قاعدة المعرفة العلمية لروافد ولا أسرار التشغيل ولا قواميس مؤسسات خاصة. هذا الفصل يجعل التعاون التقني والاعتماد وإعادة الاستخدام أكثر وضوحًا.</p>
            <div className={styles.actions}>
              <a className={styles.primary} href="https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit" target="_blank" rel="noreferrer">فتح GitHub</a>
              <Link className={styles.secondary} href="/institutions/arabic-rtl-assurance">خدمات الضمان الهندسي</Link>
            </div>
          </div>
          <aside className={styles.heroCard}>
            <h2>حدود المستودع</h2>
            <ul>
              <li>كود عام قابل لإعادة الاستخدام فقط.</li>
              <li>لا يحتوي المحتوى الطبي أو النفسي الخاص بالمنصة.</li>
              <li>لا يحتوي أسرارًا أو بيانات مستخدمين.</li>
              <li>لا يضم glossary مؤسسيًا مقيدًا دون إذن إعادة توزيع.</li>
              <li>لا يدعي أن استخدامه وحده يحقق WCAG أو جودة لغوية كاملة.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>Reusable engineering</p><h2>قدرات موجودة فعلًا في الحزمة</h2><p>هذه ليست قائمة خدمات مستقبلية؛ هي طبقات هندسية موجودة في المستودع العام ويمكن فحصها ومراجعتها خارجيًا.</p></div>
        <div className={styles.grid}>{capabilities.map(([title, description]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.twoColumn}>
          <article className={styles.panel}>
            <h2>لماذا مفتوح المصدر؟</h2>
            <p>لأن المؤسسات والمطورين يجب أن يستطيعوا رؤية ما تفعله الأداة، تشغيل الاختبارات، مراجعة العقود العامة، ودمج الأجزاء المناسبة دون الاعتماد على صندوق مغلق. كما يمنحنا سجلًا تقنيًا يمكن التحقق منه بدل الاكتفاء بعرض تسويقي.</p>
          </article>
          <article className={styles.panel}>
            <h2>أين توجد القيمة المؤسسية الإضافية؟</h2>
            <p>في تحليل المنتج الحقيقي، تصميم قواعد المؤسسة، التكامل مع CI، معالجة الأعطال، الاختبارات الخاصة بواجهة معينة، وحوكمة المصطلحات. يمكن للمؤسسة استخدام النواة المفتوحة والاحتفاظ بملفاتها الخاصة داخل بنيتها.</p>
          </article>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.cta}`}>
        <h2>لديكم مشروع مفتوح يحتاج دعم العربية أو RTL؟</h2>
        <p>يمكن أن تكون البداية issue أو test case أو PR صغير قابل للمراجعة. نفضل مساهمة تقنية قابلة للقياس على خطاب تعاون عام عندما يكون المشروع مفتوح المصدر.</p>
        <div className={styles.actions}><a className={styles.primary} href="mailto:contact@healthrenewal.org?subject=Open-source%20Arabic%20RTL%20Contribution">اقترح مشروعًا</a><Link className={styles.secondary} href="/institutions/terminology-qa">Terminology QA</Link></div>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
  </div>;
}
