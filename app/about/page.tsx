import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { BRAND_NAME, buildSeoMetadata } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: `من نحن | رسالة ${BRAND_NAME} ومنهجها في المعرفة والثقة`,
  description:
    `${BRAND_NAME} منصة عربية معرفية تنظّم المعرفة الصحية والنفسية والتربوية والخدمية ضمن مسارات واضحة، مع منهج معلن للمصادر والمراجعة والحدود المهنية.`,
  path: '/about',
  index: true,
  keywords: [
    BRAND_NAME,
    'من نحن',
    'منصة عربية معرفية',
    'معرفة موثوقة',
    'المراجعة العلمية',
    'المصادر الطبية الموثوقة',
    'الصحة النفسية العربية',
    'التربية الخاصة والدمج',
    'التعافي',
    'سرطان الأطفال',
  ],
});

const principles = [
  {
    title: 'نفهم قبل أن نوجّه',
    text: 'نبدأ من السؤال والسياق، لا من إجابة جاهزة. نقرّب الصورة، ونوضح الخيارات، ونترك القرار لصاحبه.',
  },
  {
    title: 'نمحّص قبل أن ننشر',
    text: 'نسعى إلى ربط الادعاءات بمصادر قابلة للتتبع، مع تمييز واضح بين المعلومة التثقيفية والرأي والخدمة المهنية.',
  },
  {
    title: 'نبسّط دون أن نختزل',
    text: 'نحوّل التعقيد العلمي إلى لغة عربية مفهومة وعملية، من دون تبسيط مخل أو وعود أكبر مما تسمح به الأدلة.',
  },
  {
    title: 'نحترم استقلال الإنسان',
    text: 'لا نختار الطريق عنك، ولا نصادر حقك في القرار. نساعدك على أن ترى الصورة بوضوح أكبر وتختار بوعي أكبر.',
  },
];

const offerings = [
  {
    title: 'معرفة قابلة للتتبع',
    text: 'محتوى منظم يقرّب المفاهيم والأدلة إلى القارئ العربي، مع إحالات ومراجع تساعده على معرفة مصدر المعلومة وحدودها.',
  },
  {
    title: 'مسارات بدل المعلومات المتناثرة',
    text: 'نربط المقالات والأدلة والموارد والخدمات ذات الصلة حتى لا يضطر المستخدم إلى إعادة بناء الصورة من عشرات الصفحات المتفرقة.',
  },
  {
    title: 'أدوات وخدمات ضمن حدود واضحة',
    text: 'نوفر أدلة عملية وأدوات معرفية ومسارات للوصول إلى مختصين ومراكز، مع فصل واضح بين التثقيف العام وبين التشخيص والعلاج والخدمة المهنية.',
  },
];

const domains = [
  'الصحة النفسية',
  'التعافي والإدمان',
  'الأسرة والرعاية',
  'التربية الخاصة والدمج',
  'سرطان الأطفال',
  'المعرفة والموسوعات',
  'الأدلة والمسارات العملية',
  'المختصون والمراكز والخدمات',
];

const methodSteps = [
  ['01', 'نحدّد الحاجة', 'نبدأ من السؤال الحقيقي الذي يحاول المستخدم فهمه، لا من عنوان عام أو حشو معلوماتي.'],
  ['02', 'نجمع ونقارن', 'نرجع إلى المصادر والأدلة ذات الصلة، ونقارن بينها بدل الاعتماد على مصدر واحد أو صياغة متداولة.'],
  ['03', 'نراجع ونفكك', 'نميّز ما هو مثبت، وما هو محتمل، وما يحتاج إلى مختص، ثم نحول التعقيد إلى لغة عربية واضحة.'],
  ['04', 'نربط المعرفة بالخطوة التالية', 'لا نكتفي بالمعلومة؛ نربطها بالمسارات والأدلة والخدمات والموارد ذات الصلة عندما يكون ذلك مناسبًا.'],
];

const trustLinks = [
  {
    href: '/sources',
    title: 'منهج المصادر والمراجع',
    text: 'كيف نختار المصدر المناسب للسؤال، وكيف نفرّق بين الإرشاد الرسمي والمراجعة المنهجية والدراسة الأصلية والمصدر التعريفي.',
  },
  {
    href: '/editorial-policy',
    title: 'السياسة التحريرية',
    text: 'قواعد الدقة واللغة والاستقلال التحريري والاستشهاد والتحديث والتصحيح.',
  },
  {
    href: '/medical-review-policy',
    title: 'المراجعة العلمية والطبية',
    text: 'كيف نتعامل مع المحتوى الصحي والنفسي عالي الحساسية، ومتى يحتاج إلى مراجعة علمية متخصصة.',
  },
  {
    href: '/privacy',
    title: 'الخصوصية وحماية المستخدم',
    text: 'المبادئ التي تحكم التعامل مع بيانات المستخدم والحدود بين ما يُعرض للعامة وما يبقى خاصًا.',
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="trust-page-shell" style={{ overflow: 'hidden' }}>
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link>
          <span>/</span>
          <span aria-current="page">من نحن</span>
        </nav>

        <section
          aria-labelledby="about-hero-title"
          style={{
            position: 'relative',
            padding: 'clamp(2.75rem, 7vw, 6.75rem) clamp(1.25rem, 4vw, 4rem)',
            borderRadius: '32px',
            border: '1px solid rgba(7,95,97,.14)',
            background: '#f8fcfb',
            marginBottom: '2rem',
          }}
        >
          <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
            <span className="eyebrow">من نحن</span>
            <h1
              id="about-hero-title"
              style={{
                margin: '1rem auto 1.2rem',
                maxWidth: '920px',
                fontSize: 'clamp(2.05rem, 5vw, 4.55rem)',
                lineHeight: 1.22,
                letterSpacing: '-0.03em',
              }}
            >
              لا نستطيع أن نغيّر ما حدث… لكن المعرفة تستطيع أن تغيّر ما تفعله بعده.
            </h1>
            <p style={{ margin: '0 auto .9rem', fontSize: 'clamp(1.15rem, 2.1vw, 1.5rem)', fontWeight: 800, lineHeight: 1.8 }}>
              عندما تتعثّر، يمكنك أن تنهض… ولهذا نحن هنا.
            </p>
            <p
              style={{
                maxWidth: '790px',
                margin: '0 auto',
                fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                lineHeight: 1.95,
                color: 'var(--muted, #53686b)',
              }}
            >
              {BRAND_NAME} منصة عربية معرفية تنظّم المعرفة الصحية والنفسية والتربوية والخدمية في تجربة واحدة؛ لتساعد الإنسان على فهم ما يواجهه، وتمييز ما يمكن الوثوق به، ورؤية خياراته بوضوح أكبر قبل أن يختار خطوته التالية.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '.75rem', marginTop: '1.7rem' }}>
              <a href="#why-we-exist" className="button">لماذا وُجدنا؟</a>
              <Link href="/sources" className="button button-secondary">كيف نختار مصادرنا؟</Link>
            </div>
          </div>
        </section>

        <section id="why-we-exist" aria-labelledby="why-we-exist-title" style={{ maxWidth: '980px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4.5rem) 0', scrollMarginTop: '7rem' }}>
          <span className="eyebrow">الفكرة التي بدأنا منها</span>
          <h2 id="why-we-exist-title" style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.9rem)', lineHeight: 1.45, margin: '.7rem 0 1rem', maxWidth: '820px' }}>
            حين تصبح الإجابات كثيرة، قد يصبح الوضوح هو الشيء الأصعب في الوصول إليه.
          </h2>
          <p style={{ fontSize: 'clamp(1.15rem, 2.3vw, 1.6rem)', lineHeight: 2, margin: '0 0 1rem' }}>
            أحيانًا، لا تحتاج إلى من يحمل عنك ثقل الطريق، بل إلى ما يساعدك أن ترى <strong>أين تقف، وما الذي تواجهه، وأين يمكن أن تكون خطوتك التالية.</strong>
          </p>
          <p style={{ fontSize: '1.08rem', lineHeight: 2, color: 'var(--muted, #53686b)', maxWidth: '900px' }}>
            حين يختلط الخوف بالسؤال، وتتزاحم المعلومات حتى يصبح تمييز ما يمكن الوثوق به أكثر صعوبة، لا يكون ما تحتاجه دائمًا مزيدًا من النصائح. قد يكون ما تحتاجه ببساطة أن ترى الصورة بوضوح: أن تفهم ما يحدث، أن تعرف الخيارات والمسارات المتاحة، وأن تميّز بين المعرفة التي تستحق ثقتك والضجيج الذي يزيدك ارتباكًا.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '.8rem', marginTop: '1.75rem' }}>
            {['افهم ما يحدث', 'اعرف خياراتك', 'ميّز ما يستحق الثقة', 'اختر خطوتك التالية بوعي'].map((item) => (
              <div key={item} style={{ padding: '1rem 1.1rem', borderRadius: '18px', background: '#fff', border: '1px solid rgba(7,95,97,.12)', fontWeight: 800 }}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="purpose-title"
          style={{
            maxWidth: '1100px',
            margin: '0 auto 2rem',
            padding: 'clamp(2rem, 5vw, 4rem)',
            borderRadius: '28px',
            background: '#ffffff',
            border: '1px solid rgba(7,95,97,.12)',
            boxShadow: '0 18px 50px rgba(20,50,55,.06)',
          }}
        >
          <span className="eyebrow">لماذا وُجدنا؟</span>
          <h2 id="purpose-title" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.7rem)', margin: '.6rem 0 1rem' }}>
            لأن الوصول إلى المعلومة الصحيحة لا ينبغي أن يكون عبئًا إضافيًا.
          </h2>
          <p style={{ lineHeight: 2, fontSize: '1.08rem', marginBottom: '1.25rem' }}>
            نضع بين يديك معرفة يمكن تتبع مصادرها، وأدلة ومسارات تساعدك على الفهم والاختيار. نجمع، نقارن، نفكك التعقيد، ونقرّب إليك الصورة كما هي؛ <strong>دون تهويل، ودون اختزال، ودون أن نختار نيابةً عنك.</strong>
          </p>
          <p style={{ lineHeight: 2, fontSize: '1.08rem', margin: 0 }}>
            لا نختار الطريق عنك، بل نساعدك على رؤيته بوضوح. لأن حياتك ليست طريقًا نرسمه لك، وقرارك ليس قرارًا نتخذه عنك. <strong>دورنا أن نجعل الصورة أوضح، حتى تصبح أنت أقدر على اختيار الطريق.</strong>
          </p>
        </section>

        <section aria-labelledby="what-title" style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 0' }}>
          <div style={{ maxWidth: '780px', marginBottom: '2rem' }}>
            <span className="eyebrow">ماذا نبني؟</span>
            <h2 id="what-title" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.7rem)', margin: '.6rem 0 1rem' }}>
              ليس مخزنًا للمقالات، بل بنية تساعدك على الانتقال من السؤال إلى صورة أوضح.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {offerings.map((item) => (
              <article key={item.title} style={{ padding: '1.6rem', borderRadius: '22px', border: '1px solid rgba(7,95,97,.12)', background: '#fff' }}>
                <h3 style={{ marginTop: 0, fontSize: '1.22rem' }}>{item.title}</h3>
                <p style={{ marginBottom: 0, lineHeight: 1.9, color: 'var(--muted, #53686b)' }}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="principles-title" style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 0' }}>
          <div style={{ maxWidth: '760px', marginBottom: '2rem' }}>
            <span className="eyebrow">مبادئنا</span>
            <h2 id="principles-title" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.7rem)', margin: '.6rem 0 1rem' }}>
              معرفة تحترم عقلك وقرارك.
            </h2>
            <p style={{ lineHeight: 1.9, color: 'var(--muted, #53686b)' }}>
              القيمة ليست في كثرة المحتوى وحدها، بل في الطريقة التي يُبنى بها، ويُراجع، ويُقدَّم، والحدود التي يلتزم بها.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            {principles.map((principle) => (
              <article key={principle.title} style={{ padding: '1.5rem', borderRadius: '22px', border: '1px solid rgba(7,95,97,.12)', background: '#fff' }}>
                <h3 style={{ marginTop: 0, fontSize: '1.2rem' }}>{principle.title}</h3>
                <p style={{ marginBottom: 0, lineHeight: 1.9, color: 'var(--muted, #53686b)' }}>{principle.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="scope-title"
          style={{
            maxWidth: '1100px',
            margin: '0 auto 2rem',
            padding: 'clamp(2rem, 5vw, 4rem)',
            borderRadius: '28px',
            background: '#0d4d50',
            color: '#fff',
          }}
        >
          <span style={{ display: 'inline-block', opacity: .8, fontWeight: 700 }}>منظومة واحدة، مجالات متعددة</span>
          <h2 id="scope-title" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 3rem)', margin: '.6rem 0 1rem', color: '#fff' }}>
            الإنسان هو نقطة الالتقاء.
          </h2>
          <p style={{ maxWidth: '830px', lineHeight: 2, fontSize: '1.08rem', opacity: .94 }}>
            لا نحصر الإنسان في تشخيص أو تخصص واحد. لذلك تتقاطع في المنصة المعرفة الصحية والنفسية والتربوية والأسرية والخدمية ضمن تجربة واحدة، لأن حياة الإنسان لا تنقسم إلى ملفات منفصلة كما تنقسم التخصصات.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.65rem', marginTop: '1.4rem' }}>
            {domains.map((domain) => (
              <span key={domain} style={{ padding: '.55rem .9rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,.24)', background: 'rgba(255,255,255,.08)' }}>
                {domain}
              </span>
            ))}
          </div>
        </section>

        <section aria-labelledby="method-title" style={{ maxWidth: '980px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 0' }}>
          <span className="eyebrow">كيف نعمل</span>
          <h2 id="method-title" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.7rem)', margin: '.6rem 0 1rem' }}>
            من السؤال إلى معرفة يمكن البناء عليها.
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {methodSteps.map(([number, title, text]) => (
              <article key={number} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'start', padding: '1.25rem 0', borderBottom: '1px solid rgba(7,95,97,.12)' }}>
                <strong aria-hidden="true" style={{ fontSize: '1.1rem', color: '#0b7f7c' }}>{number}</strong>
                <div>
                  <h3 style={{ margin: '0 0 .35rem', fontSize: '1.18rem' }}>{title}</h3>
                  <p style={{ margin: 0, lineHeight: 1.9, color: 'var(--muted, #53686b)' }}>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="trust-title"
          style={{
            maxWidth: '1100px',
            margin: '0 auto 2rem',
            padding: 'clamp(2rem, 5vw, 4rem)',
            borderRadius: '28px',
            background: '#f6faf9',
            border: '1px solid rgba(7,95,97,.14)',
          }}
        >
          <span className="eyebrow">شفافية يمكن التحقق منها</span>
          <h2 id="trust-title" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', margin: '.6rem 0 1rem' }}>
            الثقة لا نطلبها منك؛ نحاول أن نبني ما يجعلك قادرًا على فحصها.
          </h2>
          <p style={{ maxWidth: '850px', lineHeight: 2, fontSize: '1.06rem', color: 'var(--muted, #53686b)' }}>
            لا نكتفي بعبارة «محتوى موثوق». لذلك ننشر منهج المصادر، وقواعد التحرير، وسياسة المراجعة العلمية والطبية، وحدود الخصوصية؛ لتعرف كيف تُبنى المعرفة في المنصة وما الذي تعنيه — وما الذي لا تعنيه.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.6rem' }}>
            {trustLinks.map((item) => (
              <Link key={item.href} href={item.href} style={{ display: 'block', padding: '1.4rem', borderRadius: '20px', border: '1px solid rgba(7,95,97,.12)', background: '#fff', color: 'inherit', textDecoration: 'none' }}>
                <h3 style={{ margin: '0 0 .45rem', fontSize: '1.15rem' }}>{item.title}</h3>
                <p style={{ margin: 0, lineHeight: 1.8, color: 'var(--muted, #53686b)', fontSize: '.98rem' }}>{item.text}</p>
                <span style={{ display: 'inline-block', marginTop: '.8rem', color: '#0b7f7c', fontWeight: 800 }}>اقرأ السياسة ←</span>
              </Link>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="boundaries-title"
          style={{
            maxWidth: '980px',
            margin: '0 auto 2rem',
            padding: 'clamp(2rem, 5vw, 3.5rem)',
            borderRadius: '26px',
            border: '1px solid rgba(7,95,97,.14)',
            background: '#fbfdfc',
          }}
        >
          <span className="eyebrow">الثقة تبدأ بالحدود الواضحة</span>
          <h2 id="boundaries-title" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', margin: '.6rem 0 1rem' }}>
            ما الذي نفعله — وما الذي لا ندّعيه.
          </h2>
          <ul style={{ margin: '1rem 0 0', paddingInlineStart: '1.25rem', display: 'grid', gap: '.8rem', lineHeight: 1.9 }}>
            <li>المحتوى في المنصة تثقيفي ومعرفي، ولا يحل محل التشخيص أو التقييم أو الخطة العلاجية الفردية.</li>
            <li>عندما تتطلب المسألة قرارًا طبيًا أو نفسيًا أو مهنيًا فرديًا، يكون مقدم الخدمة المؤهل هو المرجع المناسب وفق السياق والأنظمة المحلية.</li>
            <li>ظهور مختص أو مركز في الدليل لا يعني ضمان نتيجة علاجية، ولا ننسب اعتمادًا أو ترخيصًا دون بيانات تحقق.</li>
            <li>الاستشهاد بمنظمة أو جامعة أو إرشاد لا يعني وجود شراكة أو تأييد منها ما لم نعلن ذلك صراحةً وبصورة موثقة.</li>
          </ul>
          <p style={{ lineHeight: 2, margin: '1.25rem 0 0' }}>
            <strong>الثقة عندنا ليست عبارة تسويقية؛ بل طريقة عمل وحدود معلنة يمكن الرجوع إليها.</strong>
          </p>
        </section>

        <section style={{ maxWidth: '920px', margin: '0 auto', padding: 'clamp(3rem, 7vw, 6rem) 0', textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(1.15rem, 2.2vw, 1.55rem)', lineHeight: 2, marginBottom: '1.4rem' }}>
            قد لا نستطيع أن نجعل كل طريق سهلًا، ولا أن نمنع كل تعثّر؛ لكن التعثّر لا يعني نهاية الطريق. فالإنسان حين يفهم ما يواجهه، ويرى ما أمامه بوضوح، يستعيد شيئًا بالغ الأهمية: <strong>قدرته على أن يختار ما يفعله بعد ذلك.</strong>
          </p>
          <p style={{ fontSize: 'clamp(1.35rem, 2.8vw, 2rem)', lineHeight: 1.8, fontWeight: 800 }}>
            فالعودة لا تبدأ دائمًا حين يتوقف الألم، والنهوض لا يبدأ دائمًا بالقوة؛<br />
            أحيانًا، يبدأ كل شيء حين تفهم أين تقف… وترى إلى أين يمكنك أن تمضي.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 900 }}>مَعْرِفَةٌ تَقُودُ إِلَى أَثَر.</div>
            <p style={{ marginTop: '.65rem', fontSize: '1.08rem', fontWeight: 700 }}>افهم أكثر. اختر بوعي. وامضِ من حيث أنت.</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '.75rem', marginTop: '2rem' }}>
            <Link href="/sectors" className="button">استكشف القطاعات</Link>
            <Link href="/sources" className="button button-secondary">تعرّف على منهج المصادر</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
