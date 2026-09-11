import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, buildSeoMetadata } from '@/lib/seo';
import styles from '@/components/institutional-assurance-page.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'المشاركة الصحية والاستعداد للموعد | إطار روافد المؤسسي',
  description: 'إطار عربي للمشاركة الصحية والاستعداد للموعد والمتابعة: أسئلة وأعراض وأدوية وملفات وخطة كما فهمها المستخدم واحتياجات التواصل، مع حدود غير تشخيصية وقياس قابل للتدقيق.',
  path: '/institutions/patient-participation',
  index: true,
  follow: true,
  keywords: ['المشاركة الصحية', 'الاستعداد للموعد الطبي', 'health literacy', 'patient participation', 'appointment preparation', 'caregiver communication'],
});

const journey = [
  ['قبل الموعد', 'يجمع المستخدم أسئلته والأعراض أو التغيرات التي يريد ذكرها، الأدوية والمكملات، والملفات أو التقارير التي يريد اصطحابها. الهدف تحسين الاستعداد، لا تفسير الأعراض أو تحديد التشخيص.'],
  ['أثناء الموعد', 'تبقى الأداة وسيلة تذكير وتنظيم. القرار السريري والشرح والخطة مسؤولية المختص، ولا تحول روافد قائمة المستخدم إلى توصية علاجية.'],
  ['بعد الموعد', 'يسجل المستخدم ما قاله المختص كما فهمه، وما هي المتابعة أو الخطوة التالية، ثم يستطيع العودة إلى الملاحظات بدل الاعتماد على الذاكرة وحدها.'],
  ['التواصل والوصول', 'يمكن فصل احتياجات التواصل التي يختار المستخدم مشاركتها، مثل تفضيل الكتابة، وقت إضافي للإجابة، نص أكبر، لغة الإشارة، خفض الضوضاء أو وجود شخص موثوق.'],
] as const;

const measures = [
  ['الاستعداد', 'هل وصل المستخدم إلى الموعد ولديه الأسئلة والأدوية والملفات التي أراد مناقشتها؟'],
  ['وضوح المتابعة', 'هل يستطيع المستخدم بعد الموعد تحديد الخطوة التالية وموعدها أو الجهة المسؤولة عنها دون أن نخمن نيابة عنه؟'],
  ['اكتمال التواصل', 'هل استطاع إظهار احتياجات التواصل التي اختارها، وهل فهم الطرف الآخر ما يساعده؟'],
  ['الحمل المعرفي', 'هل تقل الخطوات أو المعلومات التي يضطر المستخدم إلى تذكرها ذهنيًا، دون زيادة تنبيهات أو إدخال مرهق؟'],
  ['قابلية الاستخدام', 'هل يستطيع المستخدم إكمال المهمة فعليًا مع قارئ شاشة أو تكبير أو لوحة مفاتيح أو لمس حسب احتياجه؟'],
  ['السلامة والحدود', 'هل تمنع اللغة والواجهة تحويل التنظيم الشخصي إلى تشخيص أو وصف أو تفسير للخطة الطبية؟'],
] as const;

const pilotGates = [
  'تعريف سؤال الـpilot قبل جمع أي بيانات: مثل تحسن الاستعداد أو وضوح المتابعة، لا إثبات تحسن سريري عام.',
  'استخدام أقل قدر من البيانات اللازمة؛ ولا تجمع روافد بيانات إضافية لمجرد أنها متاحة تقنيًا.',
  'فصل بيانات الاستخدام عن المحتوى الصحي الشخصي متى أمكن، وتحديد مكان التخزين ومدة الاحتفاظ ومن يملك الوصول قبل البداية.',
  'إذا شمل الـpilot أطفالًا أو مرضى أو بيانات صحية حساسة، تُحدد الموافقة والخصوصية والإشراف والمسؤوليات وفق النطاق الفعلي قبل التنفيذ.',
  'تحديد outcome وأداة القياس ووقت القياس ومعيار النجاح مسبقًا، وتسجيل النتائج السلبية أو عدم التحسن مثل النتائج الإيجابية.',
  'عدم تقديم pilot محدود أو تحسن في الاستعداد على أنه إثبات فعالية علاجية أو اعتماد أو صلاحية للاستخدام السريري العام.',
] as const;

export default function PatientParticipationPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Rawafid Patient Participation and Appointment Readiness Framework',
    url: absoluteSiteUrl('/institutions/patient-participation'),
    inLanguage: 'ar',
    isPartOf: { '@id': `${absoluteSiteUrl('/')}#website` },
    dateModified: '2026-09-11',
  };

  return <div className={styles.page}>
    <SiteHeader />
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <span className={styles.eyebrow}>Patient participation · Appointment readiness · Accessibility</span>
            <h1 className={styles.title}>من «لدي موعد» إلى مسار يمكن للمستخدم متابعته بنفسه.</h1>
            <p className={styles.lead}>طورت روافد في تطبيق Android مسارًا عربيًا مستقلًا لتنظيم الاستعداد للموعد والمتابعة واحتياجات التواصل. القيمة المقصودة ليست إعطاء إجابات طبية للمستخدم، بل تقليل ما قد يضيع بين التذكر والزيارة والمتابعة، مع إبقاء التفسير السريري والقرار العلاجي عند المختص.</p>
            <div className={styles.actions}>
              <a className={styles.primary} href="https://github.com/khaledaltheeb/-/blob/main/android/app/src/main/java/org/healthrenewal/rawafid/AppointmentCompanionActivity.kt" target="_blank" rel="noreferrer">شفرة رفيق الموعد</a>
              <a className={styles.secondary} href="https://github.com/khaledaltheeb/-/blob/main/android/app/src/main/java/org/healthrenewal/rawafid/SupportPassportActivity.kt" target="_blank" rel="noreferrer">شفرة جواز الاحتياجات</a>
            </div>
          </div>
          <aside className={styles.heroCard}>
            <h2>ما الذي لا تدعيه هذه الطبقة؟</h2>
            <ul>
              <li>لا تشخص ولا تفرز الخطر ولا تستبدل المختص.</li>
              <li>لا تفسر الخطة الطبية أو تغير الدواء.</li>
              <li>لا تدعي أنها أداة قياس سريري مُتحقق الصدق.</li>
              <li>لا تدعي فعالية علاجية قبل دراسة مناسبة.</li>
              <li>لا تستخدم إطار جهة خارجية أو محتواها المحمي دون حق واضح.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>User journey</p><h2>رحلة واحدة بأربع نقاط تسليم</h2><p>نحافظ على الاستمرارية بين ما يريد المستخدم قوله، ما يسمعه، وما يحتاج فعله لاحقًا. كل نقطة تسليم لها حد واضح حتى لا تختلط المشاركة الصحية بالممارسة السريرية.</p></div>
        <div className={styles.grid}>{journey.map(([title, description]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.twoColumn}>
          <article className={styles.panel}>
            <h2>البيانات الحالية في رفيق الموعد</h2>
            <ul>
              <li>أسئلتي.</li>
              <li>الأعراض أو التغيرات التي أريد ذكرها.</li>
              <li>الأدوية أو المكملات التي أريد إبلاغ المختص بها.</li>
              <li>الملفات أو التقارير التي أريد أخذها.</li>
              <li>ما قاله المختص / الخطة كما فهمتها.</li>
              <li>المتابعة أو الخطوة القادمة.</li>
            </ul>
            <p>يحفظ التطبيق هذه الملاحظات محليًا بصورة مشفرة في التنفيذ الحالي، وهو اختيار يقلل الحاجة إلى نقل محتوى الزيارة خارج الجهاز.</p>
          </article>
          <article className={styles.panel}>
            <h2>جواز احتياجات التواصل</h2>
            <p>طبقة منفصلة تسمح للمستخدم باختيار الاحتياجات التي يريد إظهارها أو مشاركتها، بدل افتراض أن التشخيص وحده يخبرنا بطريقة التواصل المناسبة.</p>
            <ul>
              <li>تعليمات قصيرة ووقت إضافي للإجابة.</li>
              <li>الكتابة أو لغة الإشارة أو الدعم السمعي.</li>
              <li>النص الكبير والحساسية للضوضاء أو المثيرات.</li>
              <li>احتياجات الحركة أو التبسيط الإدراكي.</li>
              <li>وجود مرافق أو شخص موثوق عندما يختاره المستخدم.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>Measurement model</p><h2>نقيس المهمة التي صممنا الأداة من أجلها</h2><p>لا يكفي أن يقول المستخدم إن الأداة «مفيدة». يجب تحديد outcome يمكن ربطه بوظيفة المنتج، مع عدم الخلط بين تجربة الاستخدام والنتائج الصحية.</p></div>
        <div className={styles.grid}>{measures.map(([title, description]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>Pilot governance</p><h2>قبل أي تعاون ممول أو تقييم ميداني</h2></div>
        <article className={styles.panel}><ol>{pilotGates.map((item) => <li key={item}>{item}</li>)}</ol></article>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.twoColumn}>
          <article className={styles.panel}>
            <h2>كيف يمكن أن يدخل إطار خارجي لاحقًا؟</h2>
            <p>إذا وجد شريك يملك منهجًا أو مادة تعليمية أو أدوات مشاركة صحية، لا نخلطها مباشرة مع تنفيذ روافد الحالي. نحدد أولًا الملكية الفكرية والترخيص، ثم ما الذي يضيفه الإطار فوق الوظائف المستقلة الموجودة، ومن يراجع الدقة، وكيف تقاس fidelity، ومن يملك التحديثات والبيانات.</p>
            <p>بهذه الطريقة يمكن بناء pilot صغير يحترم حق الطرف الخارجي ولا يوحي أن الوظائف الحالية مشتقة من مادته.</p>
          </article>
          <article className={styles.panel}>
            <h2>مسارات مرتبطة داخل روافد</h2>
            <ul>
              <li><Link href="/institutions/technology-evaluation">إطار تقييم التقنيات قبل الـpilot</Link></li>
              <li><Link href="/institutions/arabic-rtl-assurance">ضمان العربية وRTL والوصولية</Link></li>
              <li><Link href="/institutions/terminology-qa">المصطلحات وضمان الترجمة</Link></li>
              <li><Link href="/medical-review-policy">سياسة المراجعة العلمية</Link></li>
              <li><Link href="/privacy">الخصوصية</Link></li>
            </ul>
          </article>
        </div>
        <div className={styles.notice}><strong>حد العلاقة المؤسسية:</strong> هذه الصفحة تصف قدرات ومنهج روافد. لا يعني استخدامها في مراسلة جهة أن الجهة شاركت في تصميم رفيق الموعد أو جواز الاحتياجات، أو راجعتهما، أو أيدتهما. أي تعاون أو ترخيص أو تمويل يذكر فقط بعد توثيقه.</div>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
  </div>;
}
