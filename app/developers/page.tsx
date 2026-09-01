import TrustPage from '@/components/trust-page';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'واجهة روافد العامة والمؤسسية للمطورين API',
  description: 'التوثيق الرسمي لـ Rawafid Public & Partner API v1.2 وخلاصات RSS وJSON Feed والتزامن والمصادر والمصادقة والحصص وحقوق إعادة الاستخدام واكتشاف الأدلة البحثية.',
  path: '/developers',
  index: true,
  keywords: ['Rawafid API','واجهة برمجة روافد','Arabic health API','Partner API روافد','RSS روافد','OpenAPI روافد','Europe PMC API','Lens Scholarly API','ROR identifiers'],
});

const endpoint = (path: string) => `${SITE_URL}${path}`;

export default function DevelopersPage() {
  return <TrustPage
    eyebrow="Developer Platform"
    title="واجهة روافد العامة والمؤسسية للمطورين"
    intro="طبقة تكامل مقروءة آليًا، محددة الإصدار، للمواد العامة المنشورة في روافد. صُممت للاستخدام العام والتكامل المؤسسي واكتشاف الأدلة، مع إسقاط بيانات عام منضبط لا يكشف بيانات التحرير أو الأتمتة أو الهجرة الداخلية."
    sections={[
      {
        title: '1. نقطة البداية والعقد الرسمي',
        body: <><p>الإصدار الحالي هو <code>v1.2.0</code> ضمن المسار المستقر <code>/api/v1</code>. نقطة الاكتشاف: <a href={endpoint('/api/v1')}>{endpoint('/api/v1')}</a>. العقد الرسمي بصيغة OpenAPI 3.1: <a href={endpoint('/api/openapi.json')}>{endpoint('/api/openapi.json')}</a>.</p><p>واجهات v1 للقراءة فقط وتعرض المواد المنشورة والقابلة للفهرسة فقط.</p></>,
      },
      {
        title: '2. المحتوى والمجموعات المسماة',
        body: <><p><code>GET /api/v1/content</code> للقائمة العامة، و<code>GET /api/v1/content/&lbrace;slug&rbrace;</code> للتفاصيل. توجد مجموعات مستقرة للمقالات والأدلة والأبحاث والحالات والمقارنات والأدوات والدورات ومسارات التعلم والموارد والبروتوكولات والتدخلات والتقييمات والمصطلحات والصفحات المؤسسية.</p><p>مثال: <a href={endpoint('/api/v1/research?limit=10')}>{endpoint('/api/v1/research?limit=10')}</a>.</p></>,
      },
      {
        title: '3. حدود البيانات العامة والخصوصية التشغيلية',
        body: <><p>لا تعيد الواجهة metadata التحرير أو الأتمتة أو الهجرة أو أقفال المراجعة أو معرفات التشغيل الداخلية. حقل <code>schema_json</code> في الاستجابة هو إسقاط Structured Data عام مُنقّى بمفاتيح مسموحة، وليس نسخة من سجل الإدارة الداخلي.</p><p>واجهات القطاعات والتصنيفات والوسوم تعرض الحقول العامة اللازمة للاستهلاك فقط، ولا تعرض عمود <code>metadata</code> الداخلي.</p></>,
      },
      {
        title: '4. Partner API والمفاتيح المؤسسية',
        body: <><p>يمكن للشريك إرسال المفتاح عبر <code>X-API-Key</code> أو <code>Authorization: Bearer ...</code>. المفتاح يُعرض مرة واحدة عند الإصدار، وتُخزن بصمته SHA-256 فقط.</p><p>النطاقات الحالية: <code>content:read</code> و<code>sources:read</code> و<code>search:read</code> و<code>changes:read</code> و<code>stats:read</code>. الاستجابات الموثقة تكون <code>private, no-store</code> وتستخدم <code>Vary</code> لمنع تداخل cache بين الشركاء.</p></>,
      },
      {
        title: '5. الحصص والأخطاء',
        body: <><p>الحصص تُنفذ ذريًا لكل مفتاح على مستوى الدقيقة واليوم. تجاوز الحصة يعيد <code>429</code> مع <code>Retry-After</code>. المفتاح غير الصحيح يعيد <code>401</code>، والنطاق غير الممنوح يعيد <code>403</code>، وتعطل الاعتماد الداخلي يعيد <code>503</code>.</p><p>كل خطأ يحمل <code>request_id</code>. معرف الطلب القادم من العميل لا يُعاد إلا إذا اجتاز صيغة آمنة محدودة؛ وإلا تُولد قيمة جديدة.</p></>,
      },
      {
        title: '6. البحث والتصفية',
        body: <><p>البحث العام: <code>GET /api/v1/search?q=...</code>. قوائم المحتوى تدعم النوع وتاريخ النشر والتحديث وCursor Pagination غير معتمد على أرقام الصفحات.</p><p>تعامل مع <code>next_cursor</code> كقيمة opaque بالكامل ولا تحللها أو تنشئها من جهة العميل.</p></>,
      },
      {
        title: '7. التزامن التفاضلي غير الفاقد',
        body: <><p>ابدأ بـ <code>GET /api/v1/changes?since=ISO_DATE</code>. بعد أول صفحة، استخدم <code>pagination.next_cursor</code> حصريًا في الطلب التالي: <code>/api/v1/changes?cursor=...</code>. ترتيب الأحداث ثابت على الزوج <code>(occurred_at, id)</code> حتى لا تضيع أحداث عندما تحمل دفعة كاملة الطابع الزمني نفسه.</p><p><code>next_since</code> موجود للتوافق فقط، ولا يجب استخدامه كـpagination token. الحد الأعلى 500 حدث للطلب العام و1000 للشريك الموثق.</p></>,
      },
      {
        title: '8. سجل المصادر وProvenance',
        body: <><p><code>GET /api/v1/sources</code> يعرض المصادر المرتبطة بمواد عامة منشورة، و<code>GET /api/v1/sources/&lbrace;id&rbrace;</code> يعرض التفاصيل والإصدارات والعلاقات. كما يمكن طلب <code>GET /api/v1/content/&lbrace;slug&rbrace;/sources</code>.</p><p>وجود مصدر في السجل يعني أنه مرجع قابل للتتبع، ولا يعني أن روافد أو المستهلك يملك حق إعادة نشر محتوى الطرف الثالث.</p></>,
      },
      {
        title: '9. ROR وORCID والهوية البحثية',
        body: <><p>يدعم نموذج الأدلة ROR للهوية المؤسسية وORCID لهوية الباحث عندما يرد المعرّف بنوع وصيغة صالحين. سجل المصادر يحتفظ بعلاقة المؤسسة وطريقة الحل وبيانات provenance بدل الاعتماد على اسم ناشر نصي فقط.</p><p>المطابقة الآلية عبر ROR API لا تقبل ترتيب الدرجة وحده؛ يعتمد التكامل نتيجة <code>chosen=true</code> أو مطابقة dataset حتمية ضمن قواعد منفصلة.</p></>,
      },
      {
        title: '10. Evidence Discovery',
        body: <><p><code>GET /api/v1/evidence-discovery?q=...</code> يقدم طبقة بحث موحدة. المزود الافتراضي هو <code>europe_pmc</code>. يمكن طلب Lens صراحة عبر <code>providers=europe_pmc,lens</code> عندما يكون Scholarly API مضبوطًا على الخادم.</p><p>مثال: <a href={endpoint('/api/v1/evidence-discovery?q=autism%20spectrum%20disorder&providers=europe_pmc&limit=5')}>{endpoint('/api/v1/evidence-discovery?q=autism%20spectrum%20disorder&providers=europe_pmc&limit=5')}</a>.</p></>,
      },
      {
        title: '11. Europe PMC',
        body: <><p>التكامل يستخدم REST API و<code>resultType=core</code> وCursor Pagination، مع دعم داخلي للمراجع والاستشهادات وFull Text XML والملفات التكميلية عندما يتيحها السجل الأصلي.</p><p>إتاحة النص الكامل أو ملف تكميلي لا تغير حقوق إعادة الاستخدام؛ يجب فحص رخصة السجل والمصدر الأصلي.</p></>,
      },
      {
        title: '12. Lens Scholarly API',
        body: <><p>Lens يعمل server-side فقط ولا يُكشف <code>LENS_SCHOLARLY_API_TOKEN</code> للمتصفح أو في المستودع. إذا طُلب Lens دون اعتماد، تعيد حالة المزود <code>not_configured</code> ولا تُسقط نتائج Europe PMC.</p><p>Correction أو Expression of Concern أو Reinstatement لا تُعامل كسحب؛ علامة السحب لا تُرفع إلا لتحديث Retraction الفعلي.</p></>,
      },
      {
        title: '13. حقوق إعادة الاستخدام',
        body: <><p>كل سجل محتوى يعيد كائن <code>rights</code>. الافتراضي المحافظ هو <code>link_and_citation_only</code> ما لم توجد بيانات ترخيص صريحة تسمح بأكثر من ذلك. غياب الرخصة لا يُفسر كإذن بإعادة نشر النص الكامل.</p></>,
      },
      {
        title: '14. HTTP وCaching',
        body: <><p>تدعم الاستجابات العامة <code>ETag</code> و<code>If-None-Match</code> و<code>If-Modified-Since</code>، وتعيد <code>304 Not Modified</code> عندما تكون النسخة المحلية حديثة. ترسل الواجهة <code>X-Request-Id</code> وتستخدم رؤوس CORS واضحة لمسارات القراءة العامة.</p></>,
      },
      {
        title: '15. الخلاصات',
        body: <><p>RSS العام: <a href={endpoint('/feed.xml')}>{endpoint('/feed.xml')}</a>. RSS المجلة: <a href={endpoint('/magazine/feed.xml')}>{endpoint('/magazine/feed.xml')}</a>. JSON Feed 1.1: <a href={endpoint('/feed.json')}>{endpoint('/feed.json')}</a>.</p></>,
      },
      {
        title: '16. سياسة التوافق والتغييرات',
        body: <><p>يبقى مسار <code>/api/v1</code> ثابتًا للتغييرات المتوافقة. رقم الإصدار داخل الاستجابة وOpenAPI يتبع إصدار العقد. التغييرات الكاسرة مستقبلًا يجب أن تستخدم مسار إصدار رئيسي جديد بدل تغيير v1 بصمت.</p></>,
      },
    ]}
  />;
}
