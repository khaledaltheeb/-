import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = buildSeoMetadata({
  title: 'لنرتقي بقدراتهم | قطاع القدرات والبروتوكولات والأدوات العملية',
  description: 'قطاع تطبيقي لاكتشاف القدرات وإزالة حواجز الأداء: 100 دليل حالة، بروتوكول عملي، منهجية أدلة، أوراق قابلة للطباعة وأفكار مبتكرة قابلة للقياس.',
  path: '/sectors/capabilities',
  index: true,
  keywords: ['لنرتقي بقدراتهم', 'اكتشاف القدرات', 'التربية الخاصة', 'الدمج', 'البروتوكولات', 'أوراق عمل', 'التكييفات', 'الدعم الوظيفي'],
});

type JsonRecord = Record<string, unknown>;
type CapabilityRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_type: string;
  canonical_url: string | null;
  schema_json: unknown;
  updated_at: string | null;
};

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

function schemaRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};
}

function legacyRank(row: CapabilityRow) {
  const value = schemaRecord(row.schema_json).legacy_rank;
  const rank = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  return Number.isInteger(rank) && rank >= 1 && rank <= 100 ? rank : null;
}

function capabilityHref(row: CapabilityRow) {
  if (row.canonical_url?.startsWith('/capabilities/')) return row.canonical_url;
  return `/capabilities/${row.slug.replace(/^capabilities-/, '')}/`;
}

export default async function CapabilitiesSectorPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,content_type,canonical_url,schema_json,updated_at')
    .eq('status', 'published')
    .lte('published_at', now)
    .eq('robots_index', true)
    .like('canonical_url', '/capabilities/%')
    .order('updated_at', { ascending: false })
    .limit(200);
  if (error) throw new Error(`capabilities sector library query failed: ${error.message}`);

  const rows = (data ?? []) as CapabilityRow[];
  const core = rows
    .filter((row) => legacyRank(row) !== null)
    .sort((a, b) => (legacyRank(a) ?? 999) - (legacyRank(b) ?? 999));
  const extendedConditions = rows
    .filter((row) => legacyRank(row) === null && row.content_type === 'condition')
    .sort((a, b) => a.title.localeCompare(b.title, 'ar'));
  const supporting = rows
    .filter((row) => legacyRank(row) === null && row.content_type !== 'condition' && row.canonical_url !== '/capabilities/')
    .sort((a, b) => a.title.localeCompare(b.title, 'ar'));

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'القطاعات', path: '/sectors' },
    { name: 'لنرتقي بقدراتهم', path: '/sectors/capabilities' },
  ]);
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/sectors/capabilities#collection`,
    url: `${SITE_URL}/sectors/capabilities`,
    name: 'لنرتقي بقدراتهم',
    description: 'برنامج تطبيقي لاكتشاف القدرات ونقاط القوة وإزالة حواجز الوصول عبر أدلة حالة وبروتوكولات وقياس وتجارب صغيرة قابلة للمراجعة.',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: rows.length,
      itemListElement: rows.slice(0, 100).map((row, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: row.title,
        url: `${SITE_URL}${capabilityHref(row)}`,
      })),
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="trust-page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collection]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors">القطاعات</Link><span>/</span><span aria-current="page">لنرتقي بقدراتهم</span>
        </nav>

        <section style={{ maxWidth: 1050, margin: '0 auto 2rem', padding: 'clamp(2.5rem,7vw,6rem) clamp(1.25rem,4vw,4rem)', borderRadius: 30, background: '#f7fbfa', border: '1px solid rgba(7,95,97,.14)' }}>
          <span className="eyebrow">قطاع تطبيقي مرتبط بمكتبته الحقيقية</span>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)', lineHeight: 1.2, margin: '.8rem 0 1rem' }}>لنرتقي بقدراتهم</h1>
          <p style={{ maxWidth: 820, fontSize: 'clamp(1.1rem,2vw,1.4rem)', lineHeight: 2 }}>
            لا نسأل: «ما الموهبة التي يمنحها هذا التشخيص؟». نسأل سؤالًا أدق وأكثر احترامًا للإنسان: <strong>ما الذي يستطيع هذا الشخص فعله، وما الذي قد يخفي قدرته، وما التعديل الذي يستحق التجربة، وكيف نعرف أن النتيجة مفيدة وآمنة ومستدامة؟</strong>
          </p>
          <p style={{ maxWidth: 820, lineHeight: 2, color: 'var(--muted, #53686b)' }}>
            هذه الصفحة لا تعتمد على فئة فارغة في شجرة الأقسام. هي الآن تقرأ مباشرةً مكتبة <code>/capabilities/*</code> المنشورة، لذلك يبقى لكل دليل مساره وCanonical الخاص به من دون نسخ أو إنشاء صفحات مكررة.
          </p>
          <div className="public-stat-strip">
            <span>{rows.length.toLocaleString('ar')} صفحة فعلية مرتبطة بالبرنامج</span>
            <span>{core.length.toLocaleString('ar')} دليل حالة أساسي</span>
            {extendedConditions.length > 0 && <span>{extendedConditions.length.toLocaleString('ar')} توسعات تخصصية إضافية</span>}
          </div>
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

        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 0' }} aria-labelledby="core-capabilities-title">
          <div className="section-heading">
            <span>المكتبة الأساسية</span>
            <h2 id="core-capabilities-title">أدلة الحالات المئة مرتبطة مباشرة بالقطاع</h2>
            <p>هذه ليست نسخًا جديدة؛ الروابط أدناه تشير إلى السجلات الأصلية نفسها في برنامج القدرات.</p>
          </div>
          <div className="related-content-grid">
            {core.slice(0, 18).map((row) => (
              <article key={row.id}>
                <span className="content-type-pill">الحالة {legacyRank(row)}</span>
                <h3><Link href={capabilityHref(row)}>{row.title}</Link></h3>
                {row.excerpt && <p>{row.excerpt}</p>}
                <Link href={capabilityHref(row)}>فتح الدليل الأصلي ←</Link>
              </article>
            ))}
          </div>
          <div style={{ marginTop: '1.25rem' }}><Link href="/capabilities/registry/" className="button">فتح سجل الحالات المئة كاملًا</Link></div>
        </section>

        {extendedConditions.length > 0 && <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 0' }} aria-labelledby="extended-capabilities-title">
          <div className="section-heading">
            <span>امتداد تخصصي</span>
            <h2 id="extended-capabilities-title">صفحات إضافية مرتبطة بالبرنامج خارج السجل الأساسي</h2>
            <p>هذه الصفحات كانت غير ظاهرة بوضوح من صفحة القطاع رغم أن Canonical الخاص بها يقع داخل <code>/capabilities/</code>. أصبحت الآن قابلة للاكتشاف من القطاع مباشرة.</p>
          </div>
          <div className="related-content-grid">
            {extendedConditions.map((row) => (
              <article key={row.id}>
                <span className="content-type-pill">حالة تخصصية</span>
                <h3><Link href={capabilityHref(row)}>{row.title}</Link></h3>
                {row.excerpt && <p>{row.excerpt}</p>}
                <Link href={capabilityHref(row)}>فتح الصفحة ←</Link>
              </article>
            ))}
          </div>
        </section>}

        {supporting.length > 0 && <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 0' }} aria-labelledby="supporting-capabilities-title">
          <div className="section-heading">
            <span>بحث ومنهج وتوسعات</span>
            <h2 id="supporting-capabilities-title">الطبقة البحثية والمنهجية المتصلة بالقطاع</h2>
          </div>
          <div className="related-content-grid">
            {supporting.map((row) => (
              <article key={row.id}>
                <span className="content-type-pill">{row.content_type}</span>
                <h3><Link href={capabilityHref(row)}>{row.title}</Link></h3>
                {row.excerpt && <p>{row.excerpt}</p>}
                <Link href={capabilityHref(row)}>فتح الصفحة ←</Link>
              </article>
            ))}
          </div>
        </section>}

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
            <Link href="/capabilities/ideas/" className="button button-secondary">أفكار خارج الصندوق</Link>
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
