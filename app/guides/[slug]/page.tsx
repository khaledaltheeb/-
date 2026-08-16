import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { getLegacyGuide, legacyGuideSlugs } from '@/lib/legacy-guides';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from '../legacy-guides.module.css';

type Params = Promise<{ slug: string }>;
export const dynamicParams = false;
export function generateStaticParams() { return legacyGuideSlugs.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getLegacyGuide(slug);
  if (!guide) return {};
  return buildSeoMetadata({
    title: guide.title,
    description: `${guide.definition} نسخة منقولة ومطورة من الدليل التاريخي في روافد، مع أسئلة عملية ومصدر رسمي وحدود واضحة للتثقيف العام.`,
    path: `/guides/${guide.slug}`,
    index: false,
    follow: true,
  });
}

export default async function LegacyGuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const guide = getLegacyGuide(slug);
  if (!guide) notFound();
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الأدلة المنقولة', path: '/guides' },
    { name: guide.title, path: `/guides/${guide.slug}` },
  ]);
  return <><SiteHeader/><main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}/>
    <section className={styles.hero}><div className={styles.shell}>
      <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/guides">الأدلة</Link><span>/</span><span>{guide.title}</span></nav>
      <span className={styles.eyebrow}>محتوى تاريخي منقول ومطوّر · {guide.englishLabel}</span>
      <h1>{guide.title}</h1><p className={styles.lead}>{guide.definition}</p>
      <p className={styles.transferNote}>هذه ليست صفحة تحويل. المسار التاريخي نفسه يعرض المحتوى داخل روافد الجديدة. احتفظنا بالمعلومة المفيدة من الصفحة القديمة وأضفنا سياقًا عمليًا ومصدرًا رسميًا، مع ربط اختياري بالدليل الأعمق داخل المنصة.</p>
    </div></section>

    <section className={`${styles.shell} ${styles.content}`}>
      <article className={styles.card}><span className={styles.eyebrow}>المحتوى المحفوظ من النسخة القديمة</span><h2>الفكرة الأساسية</h2>
        <p>كان الدليل القديم يقدم مدخلًا منظمًا لفهم الموضوع دون اختزاله في علامة واحدة. يبدأ الفهم بالتعريف، ثم السياق الذي تظهر فيه الخبرة، ثم مقدار أثرها في الحياة اليومية.</p>
        <h3>الأسئلة التي حافظنا عليها</h3><p>متى بدأت الخبرة؟ ما شدتها وتكرارها؟ ما المواقف التي تزيدها أو تخففها؟ وهل تؤثر في النوم أو الدراسة أو العمل أو العلاقات؟</p>
        <h3>ما الذي لا يكفي للحكم؟</h3><p>مقطع قصير، اختبار غير موثق، أو تشابه عرض واحد لا يكفي لإصدار تشخيص. عندما يكون السؤال سريريًا، يحتاج التقييم إلى تاريخ وسياق ومعلومات متعددة وفحص تفسيرات بديلة مناسبة.</p>
      </article>

      <article className={styles.card}><span className={styles.eyebrow}>تطوير النسخة الجديدة</span><h2>ما الذي يستحق الملاحظة بدل مطاردة قائمة أعراض؟</h2>
        <ul>{guide.observations.map((item) => <li key={item}>{item}</li>)}</ul>
        <p>هذه الأسئلة لا تعطي درجة ولا تستبدل التقييم المهني. فائدتها تحويل الوصف العام إلى معلومات قابلة للفهم: بداية النمط، السياق، التكرار، الأثر، وما الذي تغير مع الوقت.</p>
      </article>

      <article className={styles.card}><h2>طريقة استخدام الدليل عمليًا</h2>
        <ol>
          <li><strong>اكتب مثالين واقعيين.</strong> صف ما حدث، متى حدث، وما الأثر بدل استخدام أوصاف عامة.</li>
          <li><strong>افصل بين المعلومة والاستنتاج.</strong> «استيقظت أربع مرات» ملاحظة؛ أما «لدي اضطراب محدد» فهو استنتاج يحتاج سياقًا أوسع.</li>
          <li><strong>راجع العوامل المرافقة.</strong> النوم، الصحة الجسدية، الأدوية، الضغوط، البيئة والعلاقات قد تغير الصورة.</li>
          <li><strong>حدد سؤالًا واضحًا.</strong> هل تريد فهم المفهوم، تحسين الدعم اليومي، أم الاستعداد لتقييم مهني؟</li>
        </ol>
      </article>

      <article className={styles.evidence}><span className={styles.eyebrow}>مرجع رسمي للتحقق</span><h2>{guide.referenceTitle}</h2>
        <p>أضفنا المرجع الرسمي إلى النسخة المنقولة لأن الصفحة القديمة لم تكن تحتوي مراجع خارجية كافية. استخدم المرجع لفهم التعريف والسياق السريري العام، ولا تنقل منه تشخيصًا فرديًا إلى نفسك أو إلى شخص آخر.</p>
        <a href={guide.referenceUrl} target="_blank" rel="noreferrer">فتح المصدر الرسمي</a>
      </article>

      <article className={styles.deeper}><div><span className={styles.eyebrow}>محتوى روافد الأعمق</span><h2>{guide.primaryLabel}</h2><p>إذا أردت تفاصيل أوسع، فهذه الصفحة الداخلية تحتوي السياق المطوّر الخاص بالموضوع. وجود هذا الرابط لا يلغي الصفحة الحالية ولا يحولها؛ كلا المسارين يعملان داخل الموقع الجديد.</p></div><Link href={guide.primaryHref}>فتح الدليل الأعمق</Link></article>

      <article className={styles.safety}><h2>حدود السلامة</h2><p>المحتوى للتثقيف العام ولا يقدّم تشخيصًا فرديًا أو خطة علاج شخصية. إذا كان هناك خطر فوري على النفس أو الآخرين، فقدان شديد للاتصال بالواقع، عجز شديد عن تلبية الاحتياجات الأساسية، أو أعراض جسدية حادة، فالأولوية للحصول على مساعدة طارئة محلية مناسبة بدل متابعة القراءة.</p></article>
    </section>
  </main><SiteFooter/></>;
}
