import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, buildSeoMetadata } from '@/lib/seo';
import styles from '@/components/evidence-guides.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'حزمة المراجعة الخارجية لسلامة محتوى الإدمان',
  description: 'حزمة مراجعة محددة الإصدار لسلامة محتوى الإدمان في روافد: الانسحاب، الفرز والتصعيد، والتفريق بين الأعراض النفسية وتأثيرات المواد، مع نموذج واضح لتسجيل الملاحظات دون ادعاء اعتماد أو تأييد.',
  path: '/external-review/addiction-safety',
  index: true,
  follow: true,
  keywords: ['مراجعة محتوى الإدمان', 'سلامة الانسحاب', 'سلامة معلومات الإدمان', 'addiction content review', 'substance use safety review'],
});

const requiredPages = [
  {
    href: '/addiction/withdrawal-safety/',
    title: 'سلامة الانسحاب: متى لا يكون المنزل مكانًا آمنًا؟',
    purpose: 'فحص علامات الخطر، حدود الرعاية المنزلية، العوامل التي ترفع مستوى الرعاية، ومنع تحول التثقيف العام إلى خطة علاج ذاتي.',
  },
  {
    href: '/addiction/education/clinical-skills/safety-triage-escalation/',
    title: 'السلامة والفرز والتصعيد في رعاية اضطرابات استخدام المواد',
    purpose: 'فحص التمييز بين الفرز والتحري والتشخيص، أولوية الخطر الحاد، التعرف العام إلى الجرعة الزائدة، ونقل الرعاية دون وصف جرعات أو بروتوكولات فردية.',
  },
  {
    href: '/addiction/education/clinical-skills/differential-diagnosis/',
    title: 'التفريق التشخيصي بين الأعراض النفسية واضطرابات استخدام المواد',
    purpose: 'فحص الفصل بين الاضطراب النفسي المستقل، الأعراض المحرَّضة بالمادة، التسمم أو الانسحاب، الأسباب الدوائية والطبية، وحدود الاستنتاج في التقييم الأولي.',
  },
] as const;

const optionalPages = [
  {
    href: '/addiction/education/professional-roles/nursing/',
    title: 'كفاءات التمريض في رعاية اضطرابات استخدام المواد',
    purpose: 'مسار اختياري للمراجع ذي الخلفية التمريضية لفحص الملاحظة السريرية، السلامة، التنسيق والاستمرارية وحدود الدور.',
  },
  {
    href: '/addiction/education/professional-roles/mental-health/',
    title: 'كفاءات الصحة النفسية في رعاية اضطرابات استخدام المواد',
    purpose: 'مسار اختياري لفحص الرعاية المتكاملة والترافقات النفسية، التحري داخل خدمات الصحة النفسية، والصياغة السريرية دون اختزال السبب في المادة أو التشخيص النفسي.',
  },
] as const;

const questions = [
  'هل توجد عبارة قد تؤخر طلب الطوارئ أو تخفض خطورة تسمم، جرعة زائدة، انسحاب معقد، خطر انتحاري، ذهان شديد أو سبب طبي آخر؟',
  'هل توجد دعوى أقوى من مستوى الدليل أو صياغة توحي بيقين سببي أو تشخيصي غير مبرر؟',
  'هل هناك عامل سلامة أو تفريق تشخيصي أو ترافق نفسي/طبي مهم مفقود بحيث يغير قرار القارئ أو المختص؟',
  'هل تحول أي جزء، ولو ضمنيًا، من تثقيف عام إلى جرعة، جدول سحب، وصفة، أو توصية علاج فردية ينبغي حذفها أو إعادة ضبطها؟',
  'هل المصطلحات العربية دقيقة وغير وصمية وتحافظ على الفرق بين dependence وwithdrawal وintoxication وsubstance use disorder وغيرها من المفاهيم؟',
  'إذا كان لا بد من إصلاح شيء واحد قبل التوسع، فما أعلى تصحيح أولوية ولماذا؟',
] as const;

const severities = [
  ['Blocker', 'مشكلة سلامة أو دقة يمكن أن تسبب ضررًا أو تضليلًا جوهريًا ويجب معالجتها قبل الاعتماد على الصفحة.'],
  ['Major', 'مشكلة علمية أو سريرية مهمة لا تجعل الصفحة خطرة فورًا لكنها قد تغير الفهم أو القرار بصورة معتبرة.'],
  ['Minor', 'تحسين دقة أو مصطلح أو وضوح لا يغير الرسالة الأساسية.'],
  ['Suggestion', 'اقتراح توسع أو تحسين غير لازم لصحة النسخة الحالية.'],
] as const;

export default function AddictionSafetyExternalReviewPackPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'حزمة المراجعة الخارجية لسلامة محتوى الإدمان',
    url: absoluteSiteUrl('/external-review/addiction-safety'),
    inLanguage: 'ar',
    isPartOf: { '@id': `${absoluteSiteUrl('/')}#website` },
    dateModified: '2026-09-11',
  };

  return <div>
    <SiteHeader />
    <main className={styles.shell}>
      <section className={styles.articleHero}>
        <p className={styles.meta}>External review pack · Addiction safety · Version 2026-09-11</p>
        <h1>حزمة مراجعة قصيرة لسلامة محتوى الإدمان</h1>
        <p>هذه الحزمة لا تطلب من المراجع تقييم قطاع كامل ولا تمنحه مسؤولية عن محتوى روافد. المطلوب مراجعة ثلاث صفحات عالية الأثر بأسئلة محددة قابلة للتنفيذ. وجود اسم مراجع أو مؤسسة في مراسلة أو دعوة لا يعني اعتمادًا أو شراكة أو تأييدًا؛ لا تسجل روافد مراجعة خارجية إلا بعد استلام الملاحظات وتحديد نطاق النسخة التي تمت مراجعتها.</p>
        <div className={styles.localNav}>
          <Link href="/external-review/">سياسة المراجعة الخارجية</Link>
          <Link href="/addiction/methodology/">منهجية قطاع الإدمان</Link>
          <Link href="/medical-review-policy">سياسة المراجعة العلمية</Link>
          <Link href="/editorial-policy">السياسة التحريرية</Link>
        </div>
      </section>

      <section className={styles.guideIntro}>
        <h2>نطاق النسخة</h2>
        <p><strong>تاريخ تثبيت الحزمة: 11 سبتمبر 2026.</strong> المراجعة تخص الصفحات والنسخ التي يراها المراجع عند فتح الروابط في هذه الحزمة. أي تعديل جوهري لاحق لا يُنسب تلقائيًا إلى المراجعة السابقة. روافد تبقى مسؤولة عن التحرير والنشر والتحديث والتصحيح، حتى عند الاستفادة من ملاحظات خارجية.</p>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>01</span><h2>الصفحات الثلاث المطلوبة</h2></div><span>Core review set</span></div>
        <div className={styles.grid}>
          {requiredPages.map((page, index) => <article className={styles.card} key={page.href}>
            <div className={styles.cardMeta}><span>Required</span><span>Page {index + 1}</span></div>
            <h3><Link href={page.href}>{page.title}</Link></h3>
            <p>{page.purpose}</p>
            <Link className={styles.read} href={page.href}>فتح الصفحة للمراجعة ←</Link>
          </article>)}
        </div>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>02</span><h2>صفحتان اختياريتان حسب خبرة المراجع</h2></div><span>Optional context</span></div>
        <div className={styles.grid}>
          {optionalPages.map((page) => <article className={styles.card} key={page.href}>
            <div className={styles.cardMeta}><span>Optional</span></div>
            <h3><Link href={page.href}>{page.title}</Link></h3>
            <p>{page.purpose}</p>
            <Link className={styles.read} href={page.href}>فتح الصفحة ←</Link>
          </article>)}
        </div>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>03</span><h2>أسئلة المراجعة</h2></div><span>Safety-first</span></div>
        <div className={styles.guideIntro}>
          <ol>{questions.map((question) => <li key={question}>{question}</li>)}</ol>
        </div>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>04</span><h2>كيف نسجل الملاحظة؟</h2></div><span>Actionable return format</span></div>
        <div className={styles.grid}>
          {severities.map(([name, description]) => <article className={styles.card} key={name}><div className={styles.cardMeta}><span>{name}</span></div><p>{description}</p></article>)}
        </div>
        <div className={styles.guideIntro}>
          <h2>الحد الأدنى لكل ملاحظة</h2>
          <p>رابط الصفحة · عنوان القسم أو العبارة المعنية · درجة الخطورة · وصف المشكلة · التعديل المقترح إن أمكن · مرجع أو أساس مهني داعم عندما تكون الملاحظة علمية. لا نطلب تحريرًا لغويًا سطرًا بسطر إذا لم يكن ذلك ضمن وقت المراجع أو اختصاصه.</p>
        </div>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>05</span><h2>حدود المراجعة والاعتراف بالمساهمات</h2></div><span>Governance</span></div>
        <div className={styles.grid}>
          <article className={styles.card}><h3>لا اعتماد ضمني</h3><p>المراجعة الخارجية ليست اعتمادًا للمنصة أو القطاع، ولا تعني موافقة المراجع على صفحات لم يرها أو تعديلات تمت بعد نطاق مراجعته.</p></article>
          <article className={styles.card}><h3>الاسم والصفة بإذن</h3><p>يمكن للمراجع اختيار ذكر اسمه وصفته، أو المراجعة دون إظهار اسمه، أو عدم نسب مساهمته علنًا. لا ننشر اسمًا أو شعارًا مؤسسيًا على أنه راجع أو أيد المحتوى دون موافقة مكتوبة مناسبة.</p></article>
          <article className={styles.card}><h3>الأولوية للتصحيح</h3><p>إذا وُجد Blocker أو Major finding، يوثق أولًا ويعالج قبل توسيع الادعاء بأن المسار جاهز. المراجعة ليست إجراءً تجميليًا لبناء الثقة.</p></article>
        </div>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
  </div>;
}
