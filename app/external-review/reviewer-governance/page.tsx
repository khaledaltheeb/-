import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, buildSeoMetadata } from '@/lib/seo';
import styles from '@/components/evidence-guides.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'موجز الحوكمة للمراجعين الخارجيين | روافد',
  description: 'موجز شفاف للمراجع الخارجي عن وضع روافد التنظيمي والتمويل وحوكمة المحتوى وتطوير الأدلة ونطاق المراجعة والتعويض والاسم والصفة وإقرار النسخة النهائية.',
  path: '/external-review/reviewer-governance',
  index: true,
  follow: true,
  keywords: ['حوكمة المراجعة الخارجية', 'external review governance', 'scientific content review', 'حوكمة المحتوى الصحي', 'Rawafid governance'],
});

const reviewArrangement = [
  ['نوع المراجعة', 'نطلب عادةً مراجعة فردية مستقلة محددة النطاق أو إحالة إلى مراجع مؤهل. لا نصفها بأنها مراجعة مؤسسية من جهة أو جمعية إلا إذا أكدت الجهة ذلك كتابيًا وبنطاق واضح.'],
  ['الحجم', 'الحزمة الأولى صغيرة عمدًا: عادةً 3 صفحات أساسية، ويمكن إضافة صفحتين سياقيتين اختياريتين عندما تتطابقان مع خبرة المراجع. لا نطلب مراجعة قطاع كامل في جولة واحدة.'],
  ['التوقيت', 'لا نفرض موعدًا ضيقًا على المراجع المتطوع. يمكنه تحديد ما يناسبه أو رفض المهمة. إذا أصبحت المراجعة جزءًا من مشروع ممول لاحقًا، يوثق الجدول بصورة منفصلة قبل الالتزام.'],
  ['التعويض', 'الطلب الحالي للمراجعة الخارجية في هذا المسار غير مدفوع ولا توجد ميزانية مراجعة مضمونة. إذا توفر تمويل لمراجعة مدفوعة مستقبلًا فلن يُفترض بأثر رجعي؛ يجب الاتفاق عليه والإفصاح عنه قبل بدء المهمة.'],
  ['نطاق الخبرة', 'المراجع العلمي يراجع العلم والسلامة وحدود الاستدلال. دقة العربية والمصطلحات لا تُنسب إليه إلا إذا كان مؤهلًا لغويًا/مهنيًا لذلك وقبل هذا الجزء صراحةً. يمكن فصل المراجعة العلمية عن مراجعة العربية.'],
  ['القرار النهائي', 'الملاحظات الخارجية استشارية وقابلة للتتبع. فريق روافد مسؤول عن فحصها وتنفيذ التصحيحات وتوثيق ما تغير، ولا ينقل مسؤولية النشر إلى المراجع.'],
] as const;

const developmentSteps = [
  ['سؤال ونطاق', 'تبدأ الصفحة بسؤال استخدام وجمهور وحدود واضحة؛ لا نجمع معلومات لمجرد زيادة الحجم.'],
  ['مصادر', 'نعطي الأولوية للإرشادات الرسمية، الهيئات المهنية، المراجعات المنهجية والأبحاث الأصلية بحسب نوع الادعاء، ونحافظ على رابط المصدر وناشره وتاريخه عندما يتوفر.'],
  ['استدلال', 'نفرق بين ما يقوله المصدر مباشرة، وما هو تلخيص تحريري، وما يحتاج حكمًا مهنيًا أو تحققًا محليًا. لا تتحول الدراسة الفردية تلقائيًا إلى توصية.'],
  ['السلامة والحدود', 'تُفحص مخاطر التشخيص الذاتي، الجرعات، الانسحاب، الطوارئ، الوصمة، تجاوز نطاق الممارسة، والخلط بين الأنظمة الصحية المختلفة قبل النشر.'],
  ['تحرير وتقنية', 'تُفحص المصطلحات والبنية والروابط وcanonical وSchema وقابلية الفهرسة والوصولية، مع الحفاظ على المحتوى المنشور وعدم تقليصه لإخفاء مشكلة.'],
  ['تحديث وتصحيح', 'نعيد المراجعة عند تغير إرشاد أو ظهور دليل قد يغير الادعاء أو اكتشاف تعارض أو خطأ. التحديث يستهدف الجزء المتأثر بدل إعادة كتابة عشوائية تفقد سياق النسخة السابقة.'],
] as const;

export default function ReviewerGovernanceBriefPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Rawafid External Reviewer Governance Brief',
    url: absoluteSiteUrl('/external-review/reviewer-governance'),
    inLanguage: ['ar', 'en'],
    isPartOf: { '@id': `${absoluteSiteUrl('/')}#website` },
    dateModified: '2026-09-11',
  };

  return <div>
    <SiteHeader />
    <main className={styles.shell}>
      <section className={styles.articleHero}>
        <p className={styles.meta}>External reviewer governance brief · Version 2026-09-11</p>
        <h1>ما الذي يجب أن يعرفه المراجع الخارجي قبل قبول أي حزمة من روافد؟</h1>
        <p>هذا الموجز يجيب مقدمًا عن الوضع التنظيمي والتمويل ومسؤولية المحتوى وطريقة تطويره ونطاق أي مراجعة خارجية والتعويض وسياسة إظهار اسم المراجع وصفته. الغرض تقليل الغموض ومنع أن تتحول مراجعة فردية محددة إلى ادعاء مؤسسي أوسع منها.</p>
        <div className={styles.localNav}>
          <Link href="/external-review/">برنامج المراجعة الخارجية</Link>
          <Link href="/external-review/addiction-safety/">حزمة سلامة الإدمان</Link>
          <Link href="/editorial-policy">السياسة التحريرية</Link>
          <Link href="/medical-review-policy">سياسة المراجعة العلمية</Link>
        </div>
      </section>

      <section className={styles.guideIntro}>
        <h2>1. الجهة التي تملك وتدير روافد</h2>
        <p><strong>روافد / Health Renewal مبادرة معرفية عربية مستقلة يقودها خالد الذيب من عمّان، الأردن، ويعمل عليها فريق متعدد التخصصات من 11 شخصًا بمن فيهم قائد المشروع.</strong> تشمل خبرات الفريق علم النفس، التربية الخاصة والدامجة، النطق والتواصل، ودعم الأسرة والتأهيل ومجالات مترابطة. لا نعرض روافد حاليًا بوصفها جهة حكومية، جامعة، جمعية خيرية مسجلة، مزودًا صحيًا مرخصًا، أو جهة مانحة للاعتماد. أي وضع قانوني أو مؤسسي جديد لا يُذكر إلا بعد اكتماله وإمكانية التحقق منه.</p>
        <p>المنصة معرفية وتثقيفية وليست عيادة. عندما تستخدم الصفحة لغة سريرية فهي تشرح دليلًا أو قرار سلامة عام ضمن حدود معلنة، ولا تنشئ علاقة علاجية أو تفويضًا لممارسة مهنية.</p>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>02</span><h2>التمويل والاستقلال</h2></div><span>Funding & independence</span></div>
        <div className={styles.guideIntro}>
          <p>العمل الحالي ممول أساسًا بصورة ذاتية من فريق روافد. لا نبيع أولوية تحريرية ولا نمنح منتجًا أو جهة صفة «الأفضل» مقابل دعم. وجود مصدر أو مراجع أو جهة في صفحاتنا لا يعني شراكة أو اعتمادًا أو تمويلًا منها.</p>
          <p>بالنسبة لمسار المراجعة الخارجية الحالي، <strong>لا توجد ميزانية مضمونة لتعويض المراجع</strong>، لذلك يُعرض الطلب بوضوح كمراجعة تطوعية محددة النطاق أو طلب إحالة إلى شخص مناسب. إذا توفر لاحقًا تمويل يسمح بمراجعة مدفوعة، يتم الاتفاق على المقابل والنطاق وتعارض المصالح قبل بدء تلك المهمة ولا يُفترض على مراجعات سابقة.</p>
        </div>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>03</span><h2>من يتحمل مسؤولية المحتوى؟</h2></div><span>Editorial accountability</span></div>
        <div className={styles.grid}>
          <article className={styles.card}><h3>فريق روافد</h3><p>يتحمل المسؤولية المباشرة عن اختيار النطاق والمصادر والتحرير والنشر والتحديث والتصحيح. الاستشهاد بجهة لا ينقل إليها هذه المسؤولية.</p></article>
          <article className={styles.card}><h3>محتوى الإدمان والتعافي</h3><p>يُدار ضمن برنامج التحرير والأدلة في روافد، مع فصل صفحات الجمهور عن التعليم المهني وعن صفحات السلامة. نستخدم الأطر المهنية والدولية كمصادر، لا كادعاء مراجعة خارجية.</p></article>
          <article className={styles.card}><h3>المراجع الخارجي</h3><p>يقدم حكمًا مستقلًا على النسخة والنطاق اللذين رآهما. لا يصبح مسؤولًا عن المنصة أو عن صفحات لم يراجعها، ولا تُنسب إليه تعديلات لاحقة تلقائيًا.</p></article>
        </div>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>04</span><h2>كيف يُطوّر المحتوى ويُراجع؟</h2></div><span>Evidence workflow</span></div>
        <div className={styles.grid}>{developmentSteps.map(([title, description]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
        <div className={styles.guideIntro}>
          <p>الجمهور يختلف حسب الصفحة: مستخدم عام أو أسرة، ممارس أو متدرب، أو جهة تبني مسارًا مؤسسيًا. لذلك يجب قراءة الجمهور وحدود الدور داخل الصفحة نفسها. لا نعامل المادة المهنية كتعليم مستمر معتمد، ولا نعامل أداة تعليمية كأداة تشخيص مُتحقق الصدق ما لم يوجد دليل مستقل مناسب.</p>
        </div>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>05</span><h2>ترتيب المراجعة المقترح</h2></div><span>Review arrangement</span></div>
        <div className={styles.grid}>{reviewArrangement.map(([title, description]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>06</span><h2>الاسم والصفة والموافقة على النسخة</h2></div><span>Attribution control</span></div>
        <div className={styles.guideIntro}>
          <p>لا تنشر روافد اسم المراجع أو صفته أو انتماءه المؤسسي على أنه راجع مادة إلا بإذن واضح. يستطيع المراجع اختيار: عدم إظهار اسمه، إظهار الاسم والصفة المهنية فقط، أو السماح بذكر الانتماء عندما يملك حق ذلك. <strong>ذكر انتماء فرد إلى مؤسسة لا يعني أن المؤسسة نفسها راجعت أو اعتمدت المحتوى.</strong></p>
          <p>قبل إرفاق اسم أو صفة المراجع بالنسخة المعدلة، نرسل له نطاق التعديلات ذات الصلة ومكان الإسناد المقترح، ويملك فرصة قبول الصياغة أو تعديلها أو رفض ظهور اسمه. إذا لم يوافق، نستفيد من الملاحظة عند صحتها دون استخدام الاسم أو الصفة.</p>
        </div>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}><div><span>07</span><h2>ما الذي نطلبه الآن في حزمة الإدمان؟</h2></div><span>Current request</span></div>
        <div className={styles.guideIntro}>
          <p>الطلب الحالي هو <strong>مراجع فردي مستقل مؤهل في الإدمان/تمريض الإدمان أو إحالة إلى شخص مناسب</strong> لمراجعة ثلاث صفحات سلامة أساسية. نطلب الحكم على الدقة العلمية والسلامة وحدود الاستدلال أولًا. إذا كان المراجع قادرًا كذلك على مراجعة المصطلح العربي بصورة مهنية فيمكن إضافة ذلك باتفاق صريح؛ وإلا تبقى مراجعة العربية مسارًا منفصلًا. لا نطلب من جمعية أو مؤسسة أن تمنح اعتمادًا أو تأييدًا للمنصة.</p>
          <p><Link href="/external-review/addiction-safety/">فتح الحزمة المحددة والصفحات وأسئلة المراجعة ←</Link></p>
        </div>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
  </div>;
}
