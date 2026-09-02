import TrustPage from '@/components/trust-page';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'واجهة روافد العامة والمؤسسية للمطورين API',
  description: 'التوثيق الرسمي لـ Rawafid Public & Partner API v1.2 وخلاصات RSS وJSON Feed واكتشاف الأدلة وسجل المصادر مع حقوق الاستخدام وprovenance الترجمة.',
  path: '/developers',
  index: true,
  keywords: ['Rawafid API','واجهة برمجة روافد','Arabic health API','Partner API روافد','RSS روافد','OpenAPI روافد','Europe PMC API','Crossref API','DataCite API','Lens Scholarly API','ROR identifiers','ORCID','translation provenance'],
});

const endpoint = (path: string) => `${SITE_URL}${path}`;

export default function DevelopersPage() {
  return <TrustPage
    eyebrow="Developer Platform"
    title="واجهة روافد العامة والمؤسسية للمطورين"
    intro="طبقة تكامل للقراءة فقط، محددة الإصدار، ومصممة للمحتوى العام المنشور وسجل المصادر واكتشاف الأدلة البحثية، مع حدود حقوق واضحة ومفاتيح مؤسسية اختيارية وحصص استخدام قابلة للقياس."
    sections={[
      { title: '1. العقد الرسمي والإصدار', body: <><p>الإصدار الحالي هو <code>v1.2</code> ضمن المسار المستقر <code>/api/v1</code>. نقطة الاكتشاف: <a href={endpoint('/api/v1')}>{endpoint('/api/v1')}</a>. عقد OpenAPI 3.1: <a href={endpoint('/api/openapi.json')}>{endpoint('/api/openapi.json')}</a>.</p><p>لا تعرض الواجهة المسودات أو المواد غير القابلة للفهرسة.</p></> },
      { title: '2. المحتوى والموارد', body: <><p><code>GET /api/v1/content</code> للقائمة و<code>GET /api/v1/content/&lbrace;slug&rbrace;</code> للتفاصيل. توجد مجموعات للمقالات والأدلة والأبحاث والحالات والمقارنات والأدوات والدورات ومسارات التعلم والموارد والبروتوكولات والتدخلات والتقييمات والمصطلحات والصفحات المؤسسية.</p><p>القوائم تستخدم Cursor Pagination ومرشحات تاريخ النشر والتحديث.</p></> },
      { title: '3. Partner API', body: <><p>يمكن للشريك المؤسسي إرسال المفتاح عبر <code>X-API-Key</code> أو <code>Authorization: Bearer ...</code>. المفتاح يظهر مرة واحدة عند الإصدار ويخزن في قاعدة البيانات كـSHA-256 فقط.</p><p>النطاقات: <code>content:read</code> و<code>sources:read</code> و<code>search:read</code> و<code>changes:read</code> و<code>stats:read</code>. تجاوز الحصة يعيد <code>429</code> و<code>Retry-After</code>.</p></> },
      { title: '4. اكتشاف الأدلة: Europe PMC + Crossref + DataCite + Lens', body: <><p><code>GET /api/v1/evidence-discovery?q=...</code> يبحث بالتوازي في <code>europe_pmc</code> و<code>crossref</code> و<code>datacite</code> و<code>lens</code>. Lens اختياري ويتطلب <code>LENS_SCHOLARLY_API_TOKEN</code> على الخادم؛ تعطل مزود واحد لا يسقط المزودات الأخرى.</p><p>مثال: <a href={endpoint('/api/v1/evidence-discovery?q=autism%20spectrum%20disorder&providers=europe_pmc,crossref,datacite&limit=5')}>{endpoint('/api/v1/evidence-discovery?q=autism%20spectrum%20disorder&providers=europe_pmc,crossref,datacite&limit=5')}</a>.</p></> },
      { title: '5. Cursors والمزامنة البحثية', body: <><p>لكل مزود cursor مستقل: <code>europe_pmc_cursor</code> و<code>crossref_cursor</code> و<code>datacite_cursor</code>. يبقى <code>cursor</code> اسمًا متوافقًا للخلف لـEurope PMC.</p><p>يدعم Crossref المرشحين <code>crossref_from_update_date</code> و<code>crossref_from_index_date</code>. يرسل الخادم هوية اتصال إلى المزودات، ويستخدم DataCite cursor-based pagination مع <code>affiliation=true</code> و<code>publisher=true</code> و<code>detail=true</code> حتى لا تضيع هوية المؤسسة أو تفاصيل السجل المتاحة.</p></> },
      { title: '6. النموذج البحثي الموحّد', body: <><p>تُطبّع النتائج إلى عنوان وملخص وسنة ومجلة وناشر ومؤلفين ومعرفات DOI وPMID وPMCID/Lens/OpenAlex عند توفرها، وعدد الاستشهادات وحالة الوصول المفتوح والسحب، مع <code>provenance</code> لكل سجل.</p><p>DataCite creators/contributors و<code>nameIdentifiers</code> و<code>relatedIdentifiers</code> تُقرأ عندما يوفرها السجل. ORCID يُطبّع للمؤلفين، وROR يُستخدم للهوية المؤسسية والانتماءات عندما يقدمه المصدر أو تنجح المطابقة الموثقة. لا تُنشأ ORCID/ROR تخمينية.</p></> },
      { title: '7. سجل المصادر وConnection Metadata', body: <><p><code>GET /api/v1/sources</code> يعرض سجل المصادر العامة المستخدمة في مواد منشورة، و<code>GET /api/v1/sources/&lbrace;id&rbrace;</code> يعرض التفاصيل.</p><p>التفاصيل تدعم <code>related_identifiers</code> لعلاقات الأعمال، و<code>contributors</code> مع ORCID، وانتماءات المؤسسات مع ROR، إضافة إلى النسخ ومواضع الاستشهاد داخل محتوى روافد. استشهاد روافد المنشور بالمصدر يُمَثَّل آليًا بعلاقة DataCite-compatible من نوع <code>IsReferencedBy</code> إلى الرابط القانوني للصفحة، وتتزامن العلاقة عند تغير الاستشهاد أو حالة النشر. الجداول الأساسية محمية بـRLS ولا تُقرأ مباشرة من العميل.</p></> },
      { title: '8. حقوق البيانات وProvenance الترجمة', body: <><p>تفاصيل المصدر قد تتضمن <code>rights_profiles</code> التي تفصل بين إتاحة metadata وحق إعادة استخدامها، وبين إتاحة المحتوى/البيانات وحق إعادة استخدامها. القيمة <code>unknown</code> محافظة ولا تعني السماح.</p><p>كما قد تتضمن <code>translations</code> لتسجيل الحقل المترجم، اللغة الأصلية والمستهدفة، طريقة الترجمة، أداة الترجمة عند الاستخدام الآلي، وهوية المترجم/المراجع مع ORCID وROR عند توفرها. لا نخلط الترجمة المحلية مع metadata الأصلية بلا provenance.</p></> },
      { title: '9. التزامن والتغييرات', body: <><p>استخدم <code>GET /api/v1/changes?since=ISO_DATE</code> للمزامنة التفاضلية بدل سحب المكتبة كاملة. يعيد المسار أحداث النشر والتحديث والأرشفة مع <code>next_since</code>.</p></> },
      { title: '10. RSS وJSON Feed', body: <><p>RSS العام: <a href={endpoint('/feed.xml')}>{endpoint('/feed.xml')}</a>. RSS المجلة: <a href={endpoint('/magazine/feed.xml')}>{endpoint('/magazine/feed.xml')}</a>. JSON Feed 1.1: <a href={endpoint('/feed.json')}>{endpoint('/feed.json')}</a>.</p><p>الخلاصات تدعم <code>ETag</code> و<code>Last-Modified</code> وطلبات 304. إذا تعذر الوصول إلى الكتالوج الأساسي تعيد <code>503</code> مع <code>Retry-After</code> بدل نشر خلاصة فارغة مضللة.</p></> },
      { title: '11. HTTP وCaching', body: <><p>الاستجابات العامة تدعم <code>If-None-Match</code> و<code>If-Modified-Since</code> وتعيد <code>304 Not Modified</code> عند تطابق validators. كل استجابة API تحمل <code>X-Request-Id</code> و<code>X-Content-Type-Options: nosniff</code>.</p><p>اكتشاف الأدلة يستخدم cache قصير لتقليل الطلبات المتكررة للمزوّدات. المزامنة ذات الحجم الكبير يجب أن تعتمد حالة مزامنة/نسخة محلية مضبوطة أو واجهات الحصاد المخصصة مثل OAI-PMH حيث تكون مناسبة، بدل تحويل واجهة البحث العامة إلى bulk crawler.</p></> },
      { title: '12. الحقوق وProvenance', body: <><p>الوضع المحافظ الافتراضي للمحتوى هو <code>link_and_citation_only</code> ما لم توجد رخصة صريحة تسمح بأكثر. بيانات الاكتشاف لا تمنح تلقائيًا حق إعادة نشر الملخص أو النص الكامل أو مجموعة بيانات المزود.</p><p>يجب احترام رخصة السجل الأصلي وشروط مزود البيانات حتى عندما تكون metadata متاحة عبر واجهة روافد.</p></> },
      { title: '13. التواصل', body: <><p>للتكامل المؤسسي أو حصص أعلى أو استفسارات interoperability تواصل عبر <a href="mailto:contact@healthrenewal.org">contact@healthrenewal.org</a>.</p></> },
    ]}
  />;
}
