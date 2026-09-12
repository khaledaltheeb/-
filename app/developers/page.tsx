import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

const CANONICAL = '/developers';
const API_BASE = `${SITE_URL}/api/v1`;
const OPENAPI = `${SITE_URL}/api/openapi.json`;

export const metadata: Metadata = buildSeoMetadata({
  title: 'منصة روافد للمطورين | Public & Partner API',
  description: 'التوثيق الرسمي لـ Rawafid Public & Partner API v1.2: Quickstart، OpenAPI 3.1، البحث، المحتوى، المصادر، المزامنة، RSS/JSON Feed، اكتشاف الأدلة، Lens، الحقوق، الحصص والأخطاء.',
  path: CANONICAL,
  index: true,
  follow: true,
  type: 'website',
  hreflang: { ar: '/developers', en: '/en/developers' },
  keywords: [
    'Rawafid API', 'واجهة برمجة روافد', 'Arabic health API', 'health knowledge API',
    'Partner API', 'OpenAPI 3.1', 'REST API Arabic', 'RSS روافد', 'JSON Feed',
    'Europe PMC API', 'Crossref API', 'DataCite API', 'Lens Scholarly API',
    'ORCID', 'ROR', 'translation provenance', 'source provenance', 'incremental sync',
  ],
});

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/developers#webpage`,
      url: `${SITE_URL}/developers`,
      name: 'منصة روافد للمطورين — Public & Partner API',
      description: 'التوثيق الرسمي لواجهة روافد العامة والمؤسسية للمطورين.',
      inLanguage: 'ar',
      dateModified: '2026-09-12',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'TechArticle',
      '@id': `${SITE_URL}/developers#documentation`,
      headline: 'Rawafid Public & Partner API v1.2 — Developer Documentation',
      inLanguage: ['ar', 'en'],
      dateModified: '2026-09-12',
      mainEntityOfPage: { '@id': `${SITE_URL}/developers#webpage` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      about: ['REST API', 'OpenAPI', 'health knowledge', 'scholarly metadata', 'source provenance', 'incremental synchronization'],
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/developers#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'هل تحتاج واجهة روافد العامة إلى مفتاح API؟',
          acceptedAnswer: { '@type': 'Answer', text: 'لا. نقاط القراءة العامة تعمل دون مفتاح. المفتاح المؤسسي اختياري ويضيف هوية شريك وحصص استخدام ونطاقات وصول منظمة.' },
        },
        {
          '@type': 'Question',
          name: 'هل API تمنح حق إعادة نشر المحتوى أو النص الكامل؟',
          acceptedAnswer: { '@type': 'Answer', text: 'لا. الإتاحة التقنية لا تغيّر حقوق المحتوى أو بيانات المزود. الوضع المحافظ الافتراضي هو link_and_citation_only ما لم توجد رخصة صريحة تسمح بأكثر.' },
        },
        {
          '@type': 'Question',
          name: 'كيف تتم المزامنة دون فقد أحداث لها التوقيت نفسه؟',
          acceptedAnswer: { '@type': 'Answer', text: 'ابدأ بمعلمة since ثم استخدم pagination.next_cursor لكل صفحة لاحقة. المؤشر مركب من وقت الحدث ومعرفه لتجنب فقد أحداث متساوية التوقيت.' },
        },
        {
          '@type': 'Question',
          name: 'هل Lens يعمل تلقائيًا في كل بحث؟',
          acceptedAnswer: { '@type': 'Answer', text: 'لا. Lens مزود opt-in صريح ولا يدخل مجموعة المزودات الافتراضية.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'المطورون', item: `${SITE_URL}/developers` },
      ],
    },
  ],
};

const endpoints = [
  ['/api/v1', 'Discovery', 'وصف آلي للإصدار، الموارد، OpenAPI والخلاصات.'],
  ['/api/v1/content', 'Content', 'قائمة المحتوى العام المنشور والقابل للفهرسة مع Cursor Pagination.'],
  ['/api/v1/content/{slug}', 'Content detail', 'تفاصيل مادة واحدة، بما فيها النص والمراجع وملف الحقوق.'],
  ['/api/v1/content/{slug}/sources', 'Content sources', 'المصادر المطبّعة المرتبطة بمادة عامة.'],
  ['/api/v1/search', 'Search', 'بحث مرتب في المحتوى العام، مع حد أعلى مختلف للمجهول والشريك.'],
  ['/api/v1/sources', 'Source registry', 'سجل المصادر العام مع publisher/type/q وOffset Pagination.'],
  ['/api/v1/sources/{id}', 'Source detail', 'المعرفات والعلاقات وORCID/ROR والحقوق وإثبات منشأ الترجمة.'],
  ['/api/v1/evidence-discovery', 'Evidence discovery', 'Europe PMC وCrossref وDataCite افتراضيًا؛ Lens اختيار صريح.'],
  ['/api/v1/lens', 'Lens manifest', 'عقد آلي لحالة تكامل Lens والحصص والإسناد والخصوصية.'],
  ['/api/v1/changes', 'Change stream', 'مزامنة تفاضلية lossless باستخدام since ثم composite cursor.'],
  ['/api/v1/stats', 'Statistics', 'إحصاءات عامة لكتالوج API.'],
  ['/api/v1/{resource}', 'Named collections', 'articles، guides، research، conditions، tools وغيرها.'],
] as const;

const scopes = [
  ['content:read', 'قراءة المحتوى والمجموعات العامة.'],
  ['sources:read', 'قراءة سجل المصادر والتفاصيل.'],
  ['search:read', 'البحث واكتشاف الأدلة.'],
  ['changes:read', 'مزامنة التغييرات.'],
  ['stats:read', 'قراءة الإحصاءات العامة.'],
] as const;

const codeStyle = { overflowX: 'auto' as const, padding: '1rem', borderRadius: '0.75rem', direction: 'ltr' as const, textAlign: 'left' as const };

export default function DevelopersPage() {
  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell" id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />

      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">منصة المطورين</span>
      </nav>

      <header className="public-index-hero">
        <span className="eyebrow">Developer Platform · Production API · Read-only</span>
        <h1>منصة روافد للمطورين</h1>
        <p>واجهة عامة ومؤسسية قابلة للتكامل للوصول المنظم إلى المعرفة المنشورة، سجل المصادر، البحث، المزامنة، والخدمات البحثية. العقد الحالي هو <strong>Rawafid Public &amp; Partner API v1.2.0</strong> على مسار إنتاج ثابت.</p>
        <div className="public-stat-strip">
          <span>API v1.2.0 · Stable</span>
          <span>Read-only · Published-only</span>
          <span>OpenAPI 3.1 · JSON Schema 2020-12</span>
          <span>ETag · 304 · CORS · Request IDs</span>
        </div>
        <p><strong>Production base URL:</strong> <a href={API_BASE}><code dir="ltr">{API_BASE}</code></a></p>
        <p><strong>Machine-readable contract:</strong> <a href={OPENAPI}><code dir="ltr">{OPENAPI}</code></a></p>
        <p><Link href="/en/developers" lang="en" hrefLang="en">English developer documentation →</Link></p>
      </header>

      <nav className="rawafid-subnav" aria-label="أقسام توثيق API">
        <a href="#quickstart">ابدأ خلال دقيقة</a>
        <a href="#contract">العقد والإصدار</a>
        <a href="#endpoints">النقاط النهائية</a>
        <a href="#auth">المصادقة والشركاء</a>
        <a href="#pagination">Pagination</a>
        <a href="#evidence">الأدلة والـLens</a>
        <a href="#http">HTTP وCaching</a>
        <a href="#errors">الأخطاء</a>
        <a href="#rights">الحقوق وProvenance</a>
        <a href="#feeds">الخلاصات</a>
        <a href="#faq">FAQ</a>
      </nav>

      <section id="quickstart" aria-labelledby="quickstart-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Quickstart</span><h2 id="quickstart-title">ابدأ خلال أقل من دقيقة</h2></div><span>لا يحتاج المسار العام إلى مفتاح</span></div>
        <p>جميع الأمثلة التالية هي طلبات قراءة. لا ترسل بيانات حساسة في query string، ولا تضع مفاتيح الشركاء في كود عميل عام أو تطبيق متصفح يمكن فحصه.</p>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>1. اكتشف العقد</h3><pre style={codeStyle}><code>{`curl -sS \\\n  '${API_BASE}'`}</code></pre></article>
          <article className="institutional-sector-card"><h3>2. اقرأ أحدث المحتوى</h3><pre style={codeStyle}><code>{`curl -sS \\\n  '${API_BASE}/content?limit=5'`}</code></pre></article>
          <article className="institutional-sector-card"><h3>3. ابحث</h3><pre style={codeStyle}><code>{`curl -sS \\\n  '${API_BASE}/search?q=autism&limit=5'`}</code></pre></article>
          <article className="institutional-sector-card"><h3>4. اكتشف أدلة بحثية</h3><pre style={codeStyle}><code>{`curl -sS \\\n  '${API_BASE}/evidence-discovery?q=autism&providers=europe_pmc,crossref,datacite&limit=5'`}</code></pre></article>
        </div>
        <h3>مثال JavaScript</h3>
        <pre style={codeStyle}><code>{`const response = await fetch(
  '${API_BASE}/content?limit=5',
  { headers: { Accept: 'application/json' } }
);
if (!response.ok) throw new Error(\`Rawafid API: \${response.status}\`);
const payload = await response.json();
console.log(payload.data, payload.pagination);`}</code></pre>
      </section>

      <section id="contract" aria-labelledby="contract-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Contract</span><h2 id="contract-title">العقد الرسمي، الإصدار وحدود الاستقرار</h2></div><span>v1.2.0</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>إصدار API</h3><p><code>/api/v1</code> هو المسار المستقر الحالي، والإصدار الدلالي داخل الاستجابات والعقد هو <code>1.2.0</code>. لا تُعرض المسودات ولا المواد غير القابلة للفهرسة في واجهة المحتوى العامة.</p></article>
          <article className="institutional-sector-card"><h3>OpenAPI</h3><p>العقد الآلي منشور بصيغة <strong>OpenAPI 3.1.0</strong> مع JSON Schema 2020-12. الاحتفاظ بسلسلة 3.1 هنا قرار توافق tooling، وليس ادعاء بأنها أحدث نسخة منشورة من مواصفة OpenAPI.</p><p><a href={OPENAPI}>فتح OpenAPI JSON ↗</a></p></article>
          <article className="institutional-sector-card"><h3>تغييرات Breaking</h3><p>العقد العام يعامل v1 كواجهة مستقرة. أي تغيير يكسر أسماء الحقول أو دلالتها أو سلوك pagination يجب ألا يُدفع بصمت داخل التكاملات القائمة؛ التغييرات الإضافية غير الكاسرة يمكن أن تظهر داخل v1.</p></article>
          <article className="institutional-sector-card"><h3>لا SDK إلزامي</h3><p>لا تحتاج إلى SDK خاص. HTTP + JSON + OpenAPI هي نقطة التكامل الرسمية، ويمكن توليد عميل باستخدام tooling متوافق مع OpenAPI عند الحاجة.</p></article>
        </div>
      </section>

      <section id="endpoints" aria-labelledby="endpoints-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Endpoint map</span><h2 id="endpoints-title">خريطة النقاط النهائية</h2></div><span>GET · HEAD/OPTIONS حيث ينطبق</span></div>
        <div className="institutional-sector-grid">
          {endpoints.map(([path, name, note]) => <article className="institutional-sector-card" key={path}>
            <span className="eyebrow">GET</span><h3>{name}</h3><p><code dir="ltr">{path}</code></p><p>{note}</p>
          </article>)}
        </div>
        <p>المجموعات المسماة تشمل: <code>articles</code>، <code>guides</code>، <code>research</code>، <code>conditions</code>، <code>comparisons</code>، <code>tools</code>، <code>courses</code>، <code>learning-paths</code>، <code>resources</code>، <code>protocols</code>، <code>interventions</code>، <code>assessments</code>، <code>glossary</code>، <code>pages</code>، <code>sectors</code>، <code>categories</code> و<code>tags</code>.</p>
      </section>

      <section id="auth" aria-labelledby="auth-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Public + Partner</span><h2 id="auth-title">المصادقة، النطاقات والحصص</h2></div></div>
        <p><strong>القراءة العامة لا تتطلب مفتاحًا.</strong> عند وجود تكامل مؤسسي يمكن إرسال مفتاح اختياري عبر <code>X-API-Key</code> أو <code>Authorization: Bearer …</code>. المفتاح يظهر مرة واحدة عند الإصدار، ولا يخزن في قاعدة البيانات بنصه الخام؛ يخزن SHA-256 فقط.</p>
        <div className="institutional-sector-grid">
          {scopes.map(([scope, note]) => <article className="institutional-sector-card" key={scope}><h3><code dir="ltr">{scope}</code></h3><p>{note}</p></article>)}
        </div>
        <h3>مثال طلب شريك من الخادم</h3>
        <pre style={codeStyle}><code>{`curl -sS \\\n  -H 'X-API-Key: rawafid_live_REDACTED' \\\n  '${API_BASE}/content?limit=25'`}</code></pre>
        <p>الحصة الافتراضية للشريك الجديد في البنية الحالية هي <strong>120 طلبًا/دقيقة</strong> و<strong>25,000 طلب/يوم</strong>، لكنها قابلة للتخصيص لكل شريك. اعتبر رؤوس الاستجابة هي المصدر التشغيلي النهائي: <code>X-RateLimit-Minute-Limit</code>، <code>X-RateLimit-Minute-Remaining</code>، <code>X-RateLimit-Day-Limit</code>، <code>X-RateLimit-Day-Remaining</code>. عند التجاوز يعود <code>429</code> و<code>Retry-After</code>.</p>
        <p><strong>قاعدة أمنية:</strong> مفتاح Partner API سر مؤسسي؛ لا تضعه في JavaScript عام، تطبيق ويب مكشوف، مستودع، سجل analytics أو URL.</p>
      </section>

      <section id="pagination" aria-labelledby="pagination-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Pagination & synchronization</span><h2 id="pagination-title">أنواع pagination والمزامنة</h2></div><span>لا يوجد أسلوب واحد لكل الموارد</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>المحتوى والمجموعات</h3><p>استخدم <code>pagination.next_cursor</code>. المؤشر opaque ومركب من ترتيب النشر والمعرف؛ لا تحاول تحليله أو إنشاؤه بنفسك.</p></article>
          <article className="institutional-sector-card"><h3>سجل المصادر</h3><p><code>/sources</code> يستخدم <code>limit</code> + <code>offset</code> ويعيد <code>next_offset</code>. لا تخلط هذا النموذج مع cursor الخاص بالمحتوى.</p></article>
          <article className="institutional-sector-card"><h3>Change stream</h3><p>ابدأ بـ<code>since=ISO_DATE</code>. إذا كان <code>has_more=true</code> احتفظ بقيمة <code>since</code> نفسها ومرر <code>next_cursor</code> في الصفحة التالية. المؤشر مركب من <code>occurred_at + id</code> حتى لا تضيع أحداث تتشارك التوقيت نفسه.</p></article>
          <article className="institutional-sector-card"><h3>اكتشاف الأدلة</h3><p>لكل مزود cursor مستقل: <code>europe_pmc_cursor</code> و<code>crossref_cursor</code> و<code>datacite_cursor</code>. الاسم <code>cursor</code> محفوظ فقط كـalias قديم لـEurope PMC.</p></article>
        </div>
        <pre style={codeStyle}><code>{`# First change-stream page
curl -sS '${API_BASE}/changes?since=2026-09-01T00:00:00Z&limit=100'

# Subsequent page: keep since and pass the opaque next_cursor
curl -sS '${API_BASE}/changes?since=2026-09-01T00:00:00Z&limit=100&cursor=NEXT_CURSOR'`}</code></pre>
      </section>

      <section id="content-model" aria-labelledby="content-model-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Data model</span><h2 id="content-model-title">نموذج المحتوى وسجل المصادر</h2></div></div>
        <p><code>GET /api/v1/content</code> يعرض فقط المحتوى الذي حالته <code>published</code> وقابل للفهرسة ووقت نشره قد حل. تفاصيل المادة تضيف النص المنظم/النصي، المراجع وملف الحقوق.</p>
        <p><code>GET /api/v1/sources</code> و<code>/sources/&#123;id&#125;</code> يوفران سجلًا عامًا للمصادر المستخدمة في مواد منشورة. التفاصيل قد تشمل <code>related_identifiers</code>، contributors مع ORCID، انتماءات مؤسسية مع ROR، الإصدارات، مواضع الاستشهاد، <code>rights_profiles</code> و<code>translations</code>.</p>
        <p>العلاقات من روافد إلى المصدر يمكن تمثيلها آليًا بعلاقة DataCite-compatible مثل <code>IsReferencedBy</code> نحو الصفحة القانونية المنشورة، مع عدم اختلاق ORCID/ROR عند غياب تحقق موثوق.</p>
      </section>

      <section id="evidence" aria-labelledby="evidence-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Scholarly discovery</span><h2 id="evidence-title">اكتشاف الأدلة: Europe PMC + Crossref + DataCite + Lens</h2></div></div>
        <p><code>GET /api/v1/evidence-discovery?q=...</code> يستخدم افتراضيًا <code>europe_pmc,crossref,datacite</code>. فشل مزود واحد يُعزل ويظهر في حالة المزود بدل إسقاط بقية النتائج.</p>
        <p>النتائج المطبّعة قد تتضمن العنوان، الملخص عند توفره، السنة، المجلة/الناشر، المؤلفين، DOI وPMID وPMCID وLens/OpenAlex عند توفرها، حالة الوصول المفتوح/السحب، الاستشهادات، و<code>provenance</code>. DataCite creators/contributors و<code>nameIdentifiers</code> و<code>relatedIdentifiers</code> تُقرأ عندما يقدمها السجل. ORCID وROR لا يُنشآن تخمينيًا.</p>
        <h3>Lens هو opt-in فقط</h3>
        <p>لا يدخل Lens في المجموعة الافتراضية. لاستخدامه أرسل <code>providers=lens</code> أو أضفه صراحة إلى المزودات. الاعتماد <code>LENS_SCHOLARLY_API_TOKEN</code> يبقى server-side.</p>
        <p>الحصة التشغيلية المطبقة على Lens هي <strong>10 طلبات/دقيقة</strong> و<strong>20,000 طلب/شهر</strong> مع fail-closed guard مشترك بين الخوادم. كل سجل Lens يحتفظ بـLens ID ورابط السجل الأصلي، وعند عرضه يجب إظهار <strong>Data Sourced from The Lens</strong> وفق سياسة الإسناد.</p>
        <p><Link href="/developers/lens">التوثيق التفصيلي لتكامل Lens →</Link> · <a href={`${API_BASE}/lens`}>Machine-readable Lens manifest ↗</a></p>
      </section>

      <section id="http" aria-labelledby="http-title">
        <div className="section-mini-heading"><div><span className="eyebrow">HTTP semantics</span><h2 id="http-title">Caching، CORS والطلبات الشرطية</h2></div></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>Conditional GET</h3><p>استجابات JSON العامة تنتج <code>ETag</code>، وبعض المسارات تضيف <code>Last-Modified</code>. استخدم <code>If-None-Match</code> أو <code>If-Modified-Since</code> لتحصل على <code>304 Not Modified</code> عندما لا تتغير التمثيلات.</p></article>
          <article className="institutional-sector-card"><h3>Request correlation</h3><p>كل استجابة API تحمل <code>X-Request-Id</code>. احتفظ به عند الإبلاغ عن خطأ تشغيلي حتى يمكن ربط المشكلة بطلب محدد.</p></article>
          <article className="institutional-sector-card"><h3>CORS</h3><p>واجهة API تسمح <code>GET, HEAD, OPTIONS</code> عبر CORS، وتقبل <code>Authorization</code> و<code>X-API-Key</code>. استخدام مفتاح مؤسسي من متصفح عام غير موصى به لأن المفتاح سر.</p></article>
          <article className="institutional-sector-card"><h3>Security headers</h3><p>الاستجابات تضيف <code>X-Content-Type-Options: nosniff</code> و<code>Referrer-Policy: no-referrer</code>. بيانات API نفسها تحمل <code>X-Robots-Tag: noindex, nofollow</code> لأنها واجهة آلة وليست صفحة بحث، بينما صفحة التوثيق هذه قابلة للفهرسة.</p></article>
        </div>
        <h3>مثال ETag</h3>
        <pre style={codeStyle}><code>{`ETAG=$(curl -sSI '${API_BASE}/content?limit=5' | awk -F': ' 'tolower($1)=="etag" {print $2}' | tr -d '\\r')
curl -i -H "If-None-Match: $ETAG" '${API_BASE}/content?limit=5'`}</code></pre>
      </section>

      <section id="errors" aria-labelledby="errors-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Error contract</span><h2 id="errors-title">نموذج الأخطاء والحالات المتوقعة</h2></div></div>
        <p>الأخطاء تعود JSON مع <code>error.code</code> و<code>error.message</code> و<code>error.request_id</code>، وقد يظهر <code>error.parameter</code> لخطأ معلمة محددة.</p>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>400</h3><p>معلمة، تاريخ أو cursor غير صالح.</p></article>
          <article className="institutional-sector-card"><h3>401</h3><p>مفتاح شريك غير صالح/منتهي/ملغى عند إرساله.</p></article>
          <article className="institutional-sector-card"><h3>403</h3><p>المفتاح صالح لكن لا يملك scope المطلوب.</p></article>
          <article className="institutional-sector-card"><h3>404</h3><p>المورد العام المطلوب غير موجود.</p></article>
          <article className="institutional-sector-card"><h3>429</h3><p>تجاوز حصة الشريك؛ راقب <code>Retry-After</code>.</p></article>
          <article className="institutional-sector-card"><h3>503</h3><p>خدمة داخلية أو مزود مطلوب غير متاح مؤقتًا. لا تحول 503 إلى نتيجة فارغة ناجحة.</p></article>
        </div>
        <pre style={codeStyle}><code>{`{
  "error": {
    "code": "invalid_parameter",
    "message": "...",
    "parameter": "q",
    "request_id": "..."
  },
  "meta": { "api_version": "1.2.0" }
}`}</code></pre>
      </section>

      <section id="rights" aria-labelledby="rights-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Rights & provenance</span><h2 id="rights-title">الحقوق، إعادة الاستخدام وProvenance الترجمة</h2></div></div>
        <p>الوضع المحافظ الافتراضي للمحتوى هو <code>link_and_citation_only</code> ما لم توجد رخصة صريحة تسمح بأكثر. وجود record في API أو availability للـmetadata لا يمنح تلقائيًا حق إعادة نشر الملخص أو النص الكامل أو الصور أو مجموعة بيانات المزود.</p>
        <p><code>rights_profiles</code> تفصل بين إتاحة metadata وحق إعادة استخدامها وبين إتاحة المحتوى وحق إعادة استخدامه. القيمة <code>unknown</code> تعني أن الإذن غير مثبت، لا أنها موافقة.</p>
        <p><code>translations</code> يمكن أن يسجل الحقل المترجم، لغة المصدر والهدف، طريقة الترجمة، الأداة/الإصدار عند الاستخدام الآلي، هوية المترجم والمراجع وORCID/ROR عند توفر تحقق، وحالة المراجعة. الترجمة المحلية لا تُعرض كأنها metadata أصلية بلا provenance.</p>
      </section>

      <section id="feeds" aria-labelledby="feeds-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Feeds</span><h2 id="feeds-title">RSS وJSON Feed</h2></div></div>
        <div className="institutional-sector-grid">
          <a className="institutional-sector-card" href={`${SITE_URL}/feed.xml`}><h3>RSS العام</h3><p><code dir="ltr">/feed.xml</code></p><span className="sector-open">فتح الخلاصة ↗</span></a>
          <a className="institutional-sector-card" href={`${SITE_URL}/magazine/feed.xml`}><h3>RSS المجلة</h3><p><code dir="ltr">/magazine/feed.xml</code></p><span className="sector-open">فتح الخلاصة ↗</span></a>
          <a className="institutional-sector-card" href={`${SITE_URL}/feed.json`}><h3>JSON Feed 1.1</h3><p><code dir="ltr">/feed.json</code></p><span className="sector-open">فتح الخلاصة ↗</span></a>
        </div>
        <p>الخلاصات تدعم validators وطلبات <code>304</code>. إذا تعذر الوصول إلى كتالوج المحتوى الأساسي فإنها تعيد <code>503</code> مع <code>Retry-After</code> بدل نشر خلاصة فارغة تبدو سليمة.</p>
      </section>

      <section id="operations" aria-labelledby="operations-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Operational contract</span><h2 id="operations-title">ضوابط تشغيلية وأمنية</h2></div></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>Published-only</h3><p>واجهة المحتوى العامة لا تعيد مسودات أو مواد خارج نافذة النشر أو مواد <code>robots_index=false</code>.</p></article>
          <article className="institutional-sector-card"><h3>Read-only</h3><p>هذه الوثائق لا تعرض API عامة للكتابة في المحتوى. عمليات الإدارة منفصلة عن العقد العام.</p></article>
          <article className="institutional-sector-card"><h3>Provider isolation</h3><p>اكتشاف الأدلة يعزل أعطال المزودات ويعيد حالة كل مزود، مع عدم جعل Lens مزودًا افتراضيًا.</p></article>
          <article className="institutional-sector-card"><h3>Secret boundaries</h3><p>اعتمادات المزودات الخارجية ومفاتيح Partner API لا تُعرض في الاستجابات العامة أو المستودع. مفاتيح الشركاء تتحقق من digest مخزن وليس من plaintext.</p></article>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title">
        <div className="section-mini-heading"><div><span className="eyebrow">FAQ</span><h2 id="faq-title">أسئلة تكامل متكررة</h2></div></div>
        <h3>هل أحتاج مفتاح API للبدء؟</h3><p>لا. ابدأ بالواجهة العامة. المفتاح المؤسسي اختياري ويستخدم عندما نحتاج تعريف الشريك، scopes وحصصًا مضبوطة.</p>
        <h3>هل يمكنني سحب المكتبة كلها عبر البحث؟</h3><p>لا يُنصح بتحويل endpoint البحث إلى bulk crawler. استخدم pagination للمحتوى، change stream للمزامنة التفاضلية، والخلاصات أو واجهات الحصاد المناسبة للمهمة.</p>
        <h3>هل <code>next_since</code> كافٍ للمزامنة متعددة الصفحات؟</h3><p>استخدم <code>next_cursor</code> طالما <code>has_more=true</code>. <code>next_since</code> موجود للتوافق كـtimestamp checkpoint ولا يحل محل المؤشر المركب عند وجود صفحات لاحقة.</p>
        <h3>هل API تعني أن كل البيانات قابلة لإعادة التوزيع؟</h3><p>لا. افحص ملف الحقوق ورخصة المصدر وشروط المزود. الإتاحة التقنية ليست ترخيصًا.</p>
        <h3>أين أجد العقد الآلي؟</h3><p><a href={OPENAPI}>{OPENAPI}</a>. ويمكن بدء الاكتشاف من <a href={API_BASE}>{API_BASE}</a>.</p>
      </section>

      <section id="contact" aria-labelledby="contact-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Institutional integration</span><h2 id="contact-title">التكامل المؤسسي والدعم</h2></div></div>
        <p>لطلب Partner API، نطاقات مختلفة، مراجعة interoperability أو الإبلاغ عن مشكلة مع <code>X-Request-Id</code>، تواصل عبر <a href="mailto:contact@healthrenewal.org">contact@healthrenewal.org</a>.</p>
        <p><strong>عند الإبلاغ عن مشكلة:</strong> أرسل المسار، وقت الطلب، حالة HTTP، و<code>X-Request-Id</code>. لا ترسل مفتاح API كاملًا بالبريد.</p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
