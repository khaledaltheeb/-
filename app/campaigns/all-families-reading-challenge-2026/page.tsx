import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import WorldreaderAfrcTrackedLink from '@/components/worldreader-afrc-tracked-link';
import { buildSeoMetadata } from '@/lib/seo';
import styles from './worldreader-afrc.module.css';

const BOOKSMART_LINK = 'https://urlgeni.us/a79eb';
const WORLDREADER_AR_PAGE = 'https://www.worldreader.org/all-families-reading-challenge-2026-arabic/';

export const metadata = buildSeoMetadata({
  title: 'تحدي القراءة لجميع الأسر 2026 | دليل الأسرة العربي',
  description:
    'دليل عربي للاستعداد لتحدي القراءة لجميع الأسر 2026 من Worldreader عبر BookSmart، مع خطوات قراءة مشتركة عملية وإرشادات للقراءة الدامجة والخصوصية.',
  path: '/campaigns/all-families-reading-challenge-2026',
  index: false,
  follow: true,
  keywords: [
    'تحدي القراءة لجميع الأسر 2026',
    'Worldreader',
    'BookSmart',
    'القراءة مع الأطفال',
    'القراءة المشتركة',
    'القراءة الأسرية',
    'قصص أطفال عربية',
  ],
});

const readingSteps = [
  {
    title: 'لاحظ ما يجذب انتباه طفلك',
    text: 'ابدأ من الصورة أو الشخصية أو الحدث الذي توقف عنده الطفل، بدل الانتقال سريعًا إلى سؤال جديد أو اختبار ما يتذكره.',
  },
  {
    title: 'سمِّ ببساطة',
    text: 'سمِّ شيئًا يراه الطفل أو فعلًا أو شعورًا بكلمات قصيرة وواضحة، ثم اترك مساحة للطفل كي يشارك بطريقته.',
  },
  {
    title: 'توقّف وانتظر',
    text: 'امنح وقتًا كافيًا للاستجابة. الكلام ليس الطريقة الوحيدة للمشاركة؛ الإشارة والنظر والإيماءة ولغة الإشارة ووسائل التواصل المعزز كلها استجابات معتبرة.',
  },
  {
    title: 'وسّع الفكرة خطوة واحدة',
    text: 'إذا قال الطفل «قطة»، يمكنك أن تضيف «نعم، قطة صغيرة تركض». التوسيع البسيط يبقي الحوار طبيعيًا بدل تحويل القراءة إلى درس.',
  },
  {
    title: 'اربط القصة بالحياة',
    text: 'اسأل أو علّق على شيء مألوف: «هل تذكر الحديقة التي زرناها؟» أو «هذا يشبه حقيبتك». الهدف بناء معنى مشترك لا الوصول إلى إجابة نموذجية.',
  },
];

const inclusiveTips = [
  'اختصر مدة القراءة عندما يظهر التعب أو الحمل الحسي؛ خمس دقائق مريحة أفضل من جلسة طويلة متوترة.',
  'لا تشترط إجابة لفظية أو تواصلًا بصريًا. اسمح للطفل أن يشارك بالنظر أو الإشارة أو الحركة أو وسيلة التواصل التي يستخدمها.',
  'خفّف المشتتات، واسمح بالحركة أو تغيير الوضعية إذا كان ذلك يساعد الطفل على الاستمرار.',
  'أعد قراءة القصة المفضلة دون قلق من التكرار؛ الألفة قد تساعد الطفل على توقع الأحداث والمشاركة بثقة أكبر.',
  'ركّز على المتعة والاتصال بالقصة، لا على السرعة أو النطق المثالي أو مقارنة الطفل بإخوته.',
];

const faqs = [
  {
    q: 'هل المشاركة في التحدي مجانية؟',
    a: 'وفق المعلومات التي قدمتها Worldreader، المشاركة في التحدي وBookSmart مجانية ولا تتطلب اشتراكًا مدفوعًا للمشاركة في هذه المبادرة.',
  },
  {
    q: 'هل يجب أن يقرأ الطفل الكتاب بنفسه؟',
    a: 'لا. القراءة المشتركة قد تكون بصوت أحد الوالدين أو مقدم الرعاية أو أخ/أخت أكبر، مع مشاركة الطفل في الصور والأحداث والحوار حسب عمره وقدرته.',
  },
  {
    q: 'ماذا لو كان طفلي لا يتحدث أو يستخدم وسيلة تواصل بديلة؟',
    a: 'يمكن أن تكون المشاركة بالنظر أو الإشارة أو الإيماءة أو لغة الإشارة أو وسائل التواصل المعزز والبديل. لا ينبغي جعل الكلام شرطًا للاستمتاع بالقصة أو التفاعل معها.',
  },
  {
    q: 'ماذا لو انضممنا بعد بداية سبتمبر؟',
    a: 'ابدؤوا عندما تستطيعون، واتبعوا تعليمات Worldreader داخل الحملة. الهدف هو بناء لحظات قراءة أسرية ذات معنى، لا جعل القراءة مصدر ضغط.',
  },
  {
    q: 'هل إرسال صورة الطفل أو قصته شرط للمشاركة؟',
    a: 'لا. مشاركة قصة أو صورة تجربة منفصلة واختيارية. لا تحتاج الأسرة إلى إرسال صورة للطفل إلى روافد كي تقرأ أو تستخدم BookSmart.',
  },
  {
    q: 'هل روافد تملك BookSmart أو الكتب؟',
    a: 'لا. Worldreader وBookSmart هما المصدران المعتمدان للحملة ومحتواها. دور روافد هو تسهيل الوصول العربي وتقديم إرشادات أسرية مكملة ضمن حدود واضحة.',
  },
];

const evidence = [
  {
    title: 'القراءة المشتركة والتفاعل',
    text: 'توصي الأكاديمية الأمريكية لطب الأطفال بالقراءة المشتركة التفاعلية منذ الطفولة المبكرة، مع التركيز على الحوار المتبادل والعلاقة بين مقدم الرعاية والطفل.',
    href: 'https://publications.aap.org/pediatrics/article/154/6/e2024069090/199467/Literacy-Promotion-An-Essential-Component-of',
  },
  {
    title: 'اللغة ومهارات مقدم الرعاية',
    text: 'أظهرت مراجعة منهجية وتحليل تلوي لتدخلات قراءة الكتب المصورة المشتركة آثارًا إيجابية صغيرة على اللغة الاستقبالية والتعبيرية، وأثرًا أكبر على كفاءة مقدمي الرعاية في مشاركة الكتب.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/30737957/',
  },
  {
    title: 'الرعاية المستجيبة والتعلم المبكر',
    text: 'يركز دليل منظمة الصحة العالمية لتحسين نمو الطفولة المبكرة على الرعاية المستجيبة وفرص التعلم المبكر ودعم مقدمي الرعاية ضمن نهج نمائي متكامل.',
    href: 'https://www.who.int/publications/i/item/9789240002098',
  },
];

export default function AllFamiliesReadingChallenge2026Page() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="afrc-title">
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="مسار الصفحة">
              <Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors/child-family-education">الطفل والأسرة والمدرسة</Link><span>/</span><span>تحدي القراءة 2026</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <span className={styles.kicker}>Worldreader · BookSmart · سبتمبر 2026</span>
                <h1 id="afrc-title">تحدي القراءة لجميع الأسر 2026</h1>
                <p className={styles.lead}>
                  شهر للقراءة مع الأطفال، لا لاختبارهم. هذه الصفحة تهيئ الأسرة العربية للمشاركة في مبادرة Worldreader عبر BookSmart، وتضيف إرشادات عملية تجعل وقت القصة أكثر تفاعلًا ومرونة وملاءمة لاختلاف الأطفال.
                </p>
                <div className={styles.actions}>
                  <WorldreaderAfrcTrackedLink href={BOOKSMART_LINK} placement="hero" destination="booksmart" className={styles.primaryButton}>
                    الوصول إلى BookSmart
                  </WorldreaderAfrcTrackedLink>
                  <WorldreaderAfrcTrackedLink href={WORLDREADER_AR_PAGE} placement="worldreader_source" destination="worldreader" className={styles.secondaryButton}>
                    صفحة الحملة لدى Worldreader
                  </WorldreaderAfrcTrackedLink>
                </div>
                <p className={styles.smallNote}>BookSmart والحملة ومحتواهما من Worldreader. لا تعيد روافد نشر الكتب ولا تدّعي ملكيتها.</p>
              </div>
              <aside className={styles.heroCard} aria-label="ملخص المشاركة">
                <strong>قبل أن تبدأ</strong>
                <ul>
                  <li>اختر وقتًا قصيرًا يمكن تكراره دون ضغط.</li>
                  <li>اقرأ مع الطفل بدل ترك الجهاز يحل محل التفاعل.</li>
                  <li>دع الطفل يشارك بالطريقة التي تناسب تواصله.</li>
                  <li>إذا فقد الاهتمام، توقف وعد لاحقًا.</li>
                </ul>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="idea-title">
          <div className={styles.shellNarrow}>
            <span className={styles.eyebrow}>الفكرة ببساطة</span>
            <h2 id="idea-title">نحوّل «اقرأ لطفلك» إلى روتين يمكن للأسرة فعله فعلًا</h2>
            <p>
              التحدي فرصة لوضع القراءة داخل الحياة اليومية: قبل النوم، بعد العودة إلى المنزل، أو في وقت هادئ تختاره الأسرة. ليس المطلوب أن يصبح الطفل قارئًا مستقلًا خلال شهر، ولا أن تتحول القصة إلى امتحان. القيمة الأساسية تأتي من الاستمرار والتفاعل المشترك حول الكلمات والصور والأفكار.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt} aria-labelledby="how-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>دقيقة واحدة تغيّر طريقة القراءة</span>
              <h2 id="how-title">خمس حركات صغيرة تجعل القصة حوارًا</h2>
              <p>لا تحتاج إلى أسئلة كثيرة أو خطة تعليمية معقدة. جرّب دورة قصيرة: لاحظ، سمِّ، انتظر، وسّع، واربط.</p>
            </div>
            <div className={styles.stepGrid}>
              {readingSteps.map((step, index) => (
                <article className={styles.stepCard} key={step.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="inclusive-title">
          <div className={styles.shell}>
            <div className={styles.split}>
              <div>
                <span className={styles.eyebrow}>قراءة دامجة</span>
                <h2 id="inclusive-title">المشاركة لا تعني الكلام فقط</h2>
                <p>
                  الأطفال يختلفون في اللغة والانتباه والحركة والحساسية الحسية وطريقة التواصل. يمكن تعديل الجلسة من دون خفض قيمة التجربة أو إجبار الطفل على أداء لا يناسبه.
                </p>
              </div>
              <ul className={styles.tipList}>
                {inclusiveTips.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.sectionDark} aria-labelledby="screen-title">
          <div className={styles.shellNarrow}>
            <span className={styles.kickerLight}>BookSmart أداة قراءة رقمية</span>
            <h2 id="screen-title">اجعل الشاشة سطحًا للقراءة المشتركة، لا بديلًا عنك</h2>
            <p>
              عندما يكون الكتاب على الهاتف أو الجهاز اللوحي، اجلس بحيث تشاهدان الصفحة نفسها، تحدث عن الصور، انتظر استجابة الطفل، ودعه يقلب الصفحات أو يختار ما يثير اهتمامه. إذا أصبح الجهاز مشتتًا أو ظهرت علامات تعب، خذ استراحة. المقصود هنا هو التفاعل حول القصة، لا زيادة وقت الشاشة لذاته.
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="privacy-title">
          <div className={styles.shell}>
            <div className={styles.notice}>
              <div>
                <span className={styles.eyebrow}>خصوصية الأطفال أولًا</span>
                <h2 id="privacy-title">القراءة لا تتطلب نشر صورة طفلك</h2>
              </div>
              <p>
                إذا أتيحت لاحقًا فرصة اختيارية لمشاركة تجربة أسرة مع Worldreader، فسيكون ذلك مسارًا منفصلًا وبموافقة واضحة من ولي الأمر. لن نطلب تشخيص الطفل أو سجله المدرسي أو عنوانه أو معلومات صحية حساسة لأغراض قصة الحملة.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt} aria-labelledby="evidence-title">
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>لماذا نوصي بالتفاعل أثناء القراءة؟</span>
              <h2 id="evidence-title">الإرشاد المكمّل في روافد مبني على أدلة، لا على وعود تسويقية</h2>
              <p>هذه المراجع تدعم مبادئ القراءة المشتركة والرعاية المستجيبة بصورة عامة. لا تعني أن إكمال عدد محدد من الكتب يضمن نتيجة نمائية لطفل بعينه.</p>
            </div>
            <div className={styles.evidenceGrid}>
              {evidence.map((item) => (
                <article className={styles.evidenceCard} key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">فتح المصدر الأصلي</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="faq-title">
          <div className={styles.shellNarrow}>
            <span className={styles.eyebrow}>أسئلة شائعة</span>
            <h2 id="faq-title">قبل أن تبدأ الأسرة</h2>
            <div className={styles.faqList}>
              {faqs.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="final-title">
          <div className={styles.shellNarrow}>
            <span className={styles.kickerLight}>ابدأ بخطوة صغيرة</span>
            <h2 id="final-title">قصة واحدة، ووقت هادئ، وانتباه مشترك</h2>
            <p>لا تحتاج الأسرة إلى جلسة مثالية. ابدأ بما يمكن تكراره، واترك الطفل يقود بعض اللحظات.</p>
            <WorldreaderAfrcTrackedLink href={BOOKSMART_LINK} placement="footer_cta" destination="booksmart" className={styles.lightButton}>
              فتح BookSmart
            </WorldreaderAfrcTrackedLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
