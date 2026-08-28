import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'لنرتقي بقدراتهم | قطاع القدرات والبروتوكولات والأدوات العملية',
  description: 'قطاع تطبيقي لاكتشاف القدرات وإزالة حواجز الأداء: 100 دليل حالة، بروتوكول عملي، منهجية أدلة، أوراق قابلة للطباعة وأفكار مبتكرة قابلة للقياس.',
  path: '/sectors/capabilities',
  index: true,
  keywords: ['لنرتقي بقدراتهم', 'اكتشاف القدرات', 'التربية الخاصة', 'الدمج', 'البروتوكولات', 'أوراق عمل', 'التكييفات', 'الدعم الوظيفي'],
});

const paths = [
  { href: '/capabilities/', title: 'ابدأ من مرجع القدرات', text: 'افهم الفكرة الأساسية: لا نفترض موهبة من التشخيص، بل نختبر الأداء بعد إزالة الحواجز المناسبة.' },
  { href: '/capabilities/registry/', title: 'أدلة الحالات المئة', text: 'مئة حالة ضمن ستة مجالات، مع الوصول إلى الدليل التفصيلي لكل حالة بدل التعميم على الأشخاص.' },
  { href: '/capabilities/protocol/', title: 'البروتوكول العملي', text: 'تسع مراحل من الأمان وصوت الشخص إلى التجربة والقياس والنقل واتخاذ القرار.' },
  { href: '/capabilities/printables/', title: 'أوراق قابلة للطباعة', text: 'خط أساس، تجربة تكييف، الأمان، التواصل، الطاقة، التقدم وقرار الفريق في نماذج قابلة للطباعة.' },
  { href: '/capabilities/ideas/', title: 'أفكار خارج الصندوق', text: 'تجارب صغيرة مبتكرة، لكل منها حاجز محدد ومقياس نتيجة وقاعدة توقف، لا نصائح عشوائية.' },
  { href: '/capabilities/methodology/', title: 'المنهجية والأدلة', text: 'كيف نختار المصادر، نحد الادعاء، نتعامل مع التباين الفردي، ونفرق بين القوة المحتملة والقصة الجذابة غير المثبتة.' },
];

const principles = [
  ['القدرة لا تُستنتج من التشخيص', 'اسم الحالة لا يحدد الذكاء أو الموهبة أو المهنة أو مقدار الاستقلال.'],
  ['الوصول قبل الحكم', 'قد تخفي طريقة التواصل أو العرض أو الحركة أو البيئة معرفةً أو مهارة موجودة.'],
  ['الأمان قبل الأداء', 'الألم والنوبات والتدهور الصحي والإرهاق الشديد والعوامل النفسية الحادة تُراجع قبل تفسير انخفاض الأداء.'],
  ['القياس بدل الانطباع', 'نقارن مهمة محددة قبل تعديل واحد وبعده، ونقيس الدقة والاستقلال والجهد والرضا.'],
  ['صوت الشخص جزء من الدليل', 'الهدف لا يصبح جيدًا إذا كان يريح المؤسسة لكنه لا يهم الشخص أو يسبب له عبئًا غير مقبول.'],
  ['الفائدة يجب أن تنتقل إلى الحياة', 'لا تكفي نتيجة اختبار أو تمرين إذا لم تحسن المشاركة أو الاستقلال أو هدفًا وظيفيًا حقيقيًا.'],
];

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/sectors/capabilities#collection`,
  url: `${SITE_URL}/sectors/capabilities`,
  name: 'لنرتقي بقدراتهم',
  description: 'قطاع تطبيقي لاكتشاف القدرات وإزالة حواجز الأداء عبر أدلة الحالات والبروتوكولات والأدوات العملية والمنهجية العلمية.',
  inLanguage: 'ar',
  numberOfItems: paths.length,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: paths.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      url: `${SITE_URL}${item.href}`,
    })),
  },
};

export default function CapabilitiesSectorPage() {
  return (
    <>
      <SiteHeader />
      <main className="trust-page-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, '\\u003c') }}
        />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors">القطاعات</Link><span>/</span><span aria-current="page">لنرتقي بقدراتهم</span>
        </nav>

        <section style={{ maxWidth: 1050, margin: '0 auto 2rem', padding: 'clamp(2.5rem,7vw,6rem) clamp(1.25rem,4vw,4rem)', borderRadius: 30, background: '#f7fbfa', border: '1px solid rgba(7,95,97,.14)' }}>
          <span className="eyebrow">قطاع تطبيقي</span>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)', lineHeight: 1.2, margin: '.8rem 0 1rem' }}>لنرتقي بقدراتهم</h1>
          <p style={{ maxWidth: 820, fontSize: 'clamp(1.1rem,2vw,1.4rem)', lineHeight: 2 }}>
            لا نسأل: «ما الموهبة التي يمنحها هذا التشخيص؟». نسأل سؤالًا أدق وأكثر احترامًا للإنسان: <strong>ما الذي يستطيع هذا الشخص فعله، وما الذي قد يخفي قدرته، وما التعديل الذي يستحق التجربة، وكيف نعرف أن النتيجة مفيدة وآمنة ومستدامة؟</strong>
          </p>
          <p style={{ maxWidth: 820, lineHeight: 2, color: 'var(--muted, #53686b)' }}>
            هذا القطاع يجمع المعرفة العلمية مع التطبيق اليومي للأسرة والمدرسة والمختص ومقدم الرعاية. يربط أدلة الحالات ببروتوكول قرار، أوراق قياس قابلة للطباعة، تكييفات عملية وأفكار مبتكرة، مع إبقاء الصحة وحق الاختيار والتباين الفردي في مركز كل خطوة.
          </p>
        </section>

        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 0' }}>
          <span className="eyebrow">ماذا ستجد هنا؟</span>
          <h2>من الفهم إلى تجربة قابلة للقياس</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            {paths.map((item) => (
              <Link key={item.href} href={item.href} style={{ display: 'block', padding: '1.4rem', border: '1px solid rgba(7,95,97,.14)', borderRadius: 20, background: '#fff', textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ marginTop: 0 }}>{item.title}</h3>
                <p style={{ marginBottom: 0, lineHeight: 1.85, color: 'var(--muted, #53686b)' }}>{item.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: '2rem auto', padding: 'clamp(2rem,5vw,4rem)', borderRadius: 28, background: '#0d4d50', color: '#fff' }}>
          <span style={{ opacity: .8, fontWeight: 700 }}>ست قواعد لا نتجاوزها</span>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.7rem,3vw,2.7rem)' }}>القيمة ليست في كثرة النصائح، بل في جودة القرار.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' }}>
            {principles.map(([title, text]) => (
              <article key={title} style={{ padding: '1.2rem', border: '1px solid rgba(255,255,255,.2)', borderRadius: 18, background: 'rgba(255,255,255,.06)' }}>
                <h3 style={{ color: '#fff', marginTop: 0 }}>{title}</h3>
                <p style={{ marginBottom: 0, lineHeight: 1.8, opacity: .92 }}>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 950, margin: '0 auto', padding: '3rem 0', lineHeight: 1.95 }}>
          <span className="eyebrow">كيف نستخدم الدليل؟</span>
          <h2>ابدأ بسؤال وظيفي، لا بحكم على الشخص.</h2>
          <ol>
            <li><strong>حدّد الهدف:</strong> شيء يهم الشخص في التعلم أو التواصل أو الحركة أو الاستقلال أو المشاركة.</li>
            <li><strong>افحص الأمان:</strong> لا تفسر الأداء قبل التعامل مع عامل صحي أو نفسي قد يجعل التجربة غير آمنة أو غير صالحة.</li>
            <li><strong>حدّد الحاجز:</strong> هل المشكلة في المهمة، البيئة، طريقة العرض، طريقة الاستجابة، الطاقة، التواصل أم الأداة؟</li>
            <li><strong>غيّر عنصرًا واحدًا:</strong> اختبر تكييفًا يمكن عكسه بدل بناء خطة كبيرة على انطباع واحد.</li>
            <li><strong>قِس ما يهم:</strong> الدقة، الاستقلال، نوع المساعدة، الوقت، الجهد، الرضا والتعميم.</li>
            <li><strong>اتخذ قرارًا:</strong> احتفظ بما يفيد، عدّل ما يحتاج تعديلًا، وأوقف ما لا يفيد أو يزيد العبء.</li>
          </ol>
        </section>

        <section style={{ maxWidth: 950, margin: '0 auto 3rem', padding: '2rem', border: '1px solid rgba(7,95,97,.14)', borderRadius: 22, lineHeight: 1.9 }}>
          <h2 style={{ marginTop: 0 }}>المصادر ليست زينة في نهاية الصفحة</h2>
          <p>تُبنى الأدلة على مزيج من الإرشادات والمراجع الرسمية، المراجعات المنهجية، الدراسات المحكمة والمصادر المتخصصة المناسبة للسؤال. من الجهات المستخدمة بحسب الموضوع: منظمة الصحة العالمية، PubMed/NCBI، NICE، CDC، ASHA، UNICEF، CAST، GeneReviews، AAIDD، IES وغيرها. وجود اسم جهة في المراجع لا يعني شراكة أو اعتمادًا منها.</p>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <Link href="/capabilities/methodology/" className="button">اقرأ المنهجية</Link>
            <Link href="/sources" className="button button-secondary">منهج المصادر في المنصة</Link>
          </div>
        </section>

        <aside className="medical-disclaimer" style={{ maxWidth: 950, margin: '0 auto 4rem' }}>
          <strong>حدود القطاع</strong>
          <p>هذا القطاع للتثقيف والدعم الوظيفي العام. لا يشخّص، ولا يتنبأ بذكاء أو موهبة أو مهنة من اسم الحالة، ولا يصف علاجًا فرديًا. عندما توجد مخاطر صحية أو نفسية أو احتياجات تقييم متخصصة، تكون الرعاية المهنية المناسبة جزءًا أساسيًا من القرار.</p>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
