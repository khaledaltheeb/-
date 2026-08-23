import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'من نحن | منصة روافد',
  description:
    'تعرّف على رسالة منصة روافد، فلسفتها الإنسانية، منهجها في المعرفة الموثوقة، مبادئها التحريرية، ونموذجها الذي يربط الفهم بالاختيار والأثر.',
  path: '/about',
  index: true,
  keywords: [
    'منصة روافد',
    'من نحن',
    'معرفة موثوقة',
    'الصحة النفسية العربية',
    'التعافي',
    'الدمج',
    'التمكين',
    'الأدلة العلمية',
  ],
});

const pillars = [
  {
    title: 'نفهم قبل أن نوجّه',
    text: 'نبدأ من السؤال والسياق، لا من إجابة جاهزة. مهمتنا أن نقرّب الصورة، ونوضح الخيارات، ونترك القرار لصاحبه.',
  },
  {
    title: 'نمحّص قبل أن ننشر',
    text: 'نسعى إلى بناء المحتوى على مصادر موثوقة وأدلة قابلة للتحقق، مع تمييز واضح بين المعرفة التثقيفية والرأي والخدمة المهنية.',
  },
  {
    title: 'نبسّط دون أن نختزل',
    text: 'نحوّل التعقيد العلمي إلى معرفة مفهومة وعملية، من دون تبسيط مخل أو وعود أكبر مما تسمح به الأدلة.',
  },
  {
    title: 'نحترم استقلال الإنسان',
    text: 'لا نختار الطريق عنك، ولا نصادر حقك في القرار. نمنحك ما يساعدك على أن ترى بوضوح أكبر وتختار بوعي أكبر.',
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
            padding: 'clamp(2.5rem, 7vw, 6.5rem) clamp(1.25rem, 4vw, 4rem)',
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
                margin: '1rem auto 1.25rem',
                maxWidth: '900px',
                fontSize: 'clamp(2.1rem, 5vw, 4.6rem)',
                lineHeight: 1.25,
                letterSpacing: '-0.03em',
              }}
            >
              لا نستطيع أن نغيّر ما حدث… لكن المعرفة تستطيع أن تغيّر ما تفعله بعده.
            </h1>
            <p
              style={{
                maxWidth: '760px',
                margin: '0 auto',
                fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
                lineHeight: 1.95,
                color: 'var(--muted, #53686b)',
              }}
            >
              عندما تتعثّر، يمكنك أن تنهض… ولهذا نحن هنا. نبني مساحة عربية مؤسسية تساعد الإنسان على أن يفهم ما يواجهه، ويرى خياراته بوضوح، ويصل إلى معرفة يمكن الوثوق بها قبل أن يختار خطوته التالية.
            </p>
          </div>
        </section>

        <section style={{ maxWidth: '980px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 0' }}>
          <p style={{ fontSize: 'clamp(1.2rem, 2.4vw, 1.7rem)', lineHeight: 2, margin: 0 }}>
            أحيانًا، لا تحتاج إلى من يحمل عنك ثقل الطريق، بل إلى ما يساعدك أن ترى <strong>أين تقف، وما الذي تواجهه، وأين يمكن أن تكون خطوتك التالية.</strong>
          </p>
          <p style={{ fontSize: '1.08rem', lineHeight: 2, color: 'var(--muted, #53686b)' }}>
            حين يختلط الخوف بالسؤال، وتتزاحم المعلومات حتى يصبح تمييز ما يمكن الوثوق به أكثر صعوبة، لا يكون ما تحتاجه دائمًا مزيدًا من النصائح. قد يكون ما تحتاجه ببساطة أن ترى الصورة بوضوح: أن تفهم ما يحدث وما تمرّ به، أن تعرف الخيارات والمسارات المتاحة أمامك، وأن تميّز بين المعرفة التي تستحق ثقتك والضجيج الذي يزيدك ارتباكًا.
          </p>
        </section>

        <section
          aria-labelledby="why-title"
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
          <h2 id="why-title" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.7rem)', margin: '.6rem 0 1rem' }}>
            لأن الوصول إلى المعلومة الصحيحة لا ينبغي أن يكون عبئًا إضافيًا.
          </h2>
          <p style={{ lineHeight: 2, fontSize: '1.08rem', marginBottom: '1.25rem' }}>
            نضع بين يديك معرفة موثوقة، وأدلة ممحّصة، ومسارات واضحة، وأدوات تساعدك على الفهم والاختيار. نجمع المعرفة، نمحّص الأدلة، نفكك التعقيد، ونقرّب إليك الصورة كما هي؛ <strong>دون تهويل، ودون اختزال، ودون أن نختار نيابةً عنك.</strong>
          </p>
          <p style={{ lineHeight: 2, fontSize: '1.08rem', margin: 0 }}>
            لا نختار الطريق عنك، بل نساعدك على رؤيته بوضوح. لأن حياتك ليست طريقًا نرسمه لك، وقرارك ليس قرارًا نتخذه عنك. <strong>دورنا أن نجعل الصورة أوضح، حتى تصبح أنت أقدر على اختيار الطريق.</strong>
          </p>
        </section>

        <section aria-labelledby="pillars-title" style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 0' }}>
          <div style={{ maxWidth: '760px', marginBottom: '2rem' }}>
            <span className="eyebrow">مبادئنا</span>
            <h2 id="pillars-title" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.7rem)', margin: '.6rem 0 1rem' }}>
              معرفة تحترم عقلك وقرارك.
            </h2>
            <p style={{ lineHeight: 1.9, color: 'var(--muted, #53686b)' }}>
              القيمة ليست في كثرة المحتوى وحدها، بل في الطريقة التي يُبنى بها، ويُراجع، ويُقدَّم، والحدود التي يلتزم بها.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            {pillars.map((pillar) => (
              <article key={pillar.title} style={{ padding: '1.5rem', borderRadius: '22px', border: '1px solid rgba(7,95,97,.12)', background: '#fff' }}>
                <h3 style={{ marginTop: 0, fontSize: '1.2rem' }}>{pillar.title}</h3>
                <p style={{ marginBottom: 0, lineHeight: 1.9, color: 'var(--muted, #53686b)' }}>{pillar.text}</p>
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
          <span style={{ display: 'inline-block', opacity: .78, fontWeight: 700 }}>منظومة واحدة، مجالات متعددة</span>
          <h2 id="scope-title" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 3rem)', margin: '.6rem 0 1rem', color: '#fff' }}>
            الإنسان هو نقطة الالتقاء.
          </h2>
          <p style={{ maxWidth: '820px', lineHeight: 2, fontSize: '1.08rem', opacity: .92 }}>
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
            {[
              ['01', 'نحدّد الحاجة', 'نبدأ من السؤال الحقيقي الذي يحاول المستخدم فهمه، لا من عنوان عام أو حشو معلوماتي.'],
              ['02', 'نجمع ونقارن', 'نرجع إلى المصادر والأدلة ذات الصلة، ونقارن بينها بدل الاعتماد على مصدر واحد أو صياغة متداولة.'],
              ['03', 'نراجع ونفكك', 'نميّز ما هو مثبت، وما هو محتمل، وما يحتاج إلى مختص، ثم نحول التعقيد إلى لغة عربية واضحة.'],
              ['04', 'نربط المعرفة بالخطوة التالية', 'لا نكتفي بالمعلومة؛ نربطها بالمسارات والأدلة والخدمات والموارد ذات الصلة عندما يكون ذلك مناسبًا.'],
            ].map(([number, title, text]) => (
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
          <p style={{ lineHeight: 2 }}>
            المحتوى في المنصة تثقيفي ومعرفي، ولا يحل محل التشخيص أو التقييم أو الخطة العلاجية الفردية. عندما تتطلب المسألة قرارًا طبيًا أو نفسيًا أو مهنيًا فرديًا، يكون مقدم الخدمة المؤهل هو المرجع المناسب وفق الأنظمة والقوانين المحلية.
          </p>
          <p style={{ lineHeight: 2, marginBottom: 0 }}>
            كما لا ننسب اعتمادًا أو ترخيصًا إلى مختص أو مركز دون بيانات تحقق، وتبقى الوثائق الحساسة خارج العرض العام. <strong>الثقة عندنا ليست عبارة تسويقية؛ بل طريقة عمل وحدود معلنة.</strong>
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
