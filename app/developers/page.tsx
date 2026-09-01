import Link from 'next/link';
import TrustPage from '@/components/trust-page';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'واجهة روافد العامة والمؤسسية للمطورين API',
  description: 'التوثيق الرسمي لـ Rawafid Public & Partner API v1.1 وخلاصات RSS وJSON Feed وآليات التزامن والمصادر والمصادقة والحصص وحقوق إعادة الاستخدام.',
  path: '/developers',
  index: true,
  keywords: ['Rawafid API','واجهة برمجة روافد','Arabic health API','Partner API روافد','RSS روافد','OpenAPI روافد'],
});

const endpoint = (path: string) => `${SITE_URL}${path}`;

export default function DevelopersPage() {
  return <TrustPage
    eyebrow="Developer Platform"
    title="واجهة روافد العامة والمؤسسية للمطورين"
    intro="طبقة تكامل مقروءة آليًا، محددة الإصدار، ومصممة للمواد المنشورة في روافد. تدعم الاستخدام العام، والتكامل المؤسسي بمفاتيح شراكة اختيارية وحصص قابلة للقياس، دون كشف المسودات أو البيانات الخاصة."
    sections={[
      {
        title: '1. نقطة البداية والعقد الرسمي',
        body: <><p>الإصدار الحالي هو <code>v1.1</code> ضمن المسار المستقر <code>/api/v1</code>. ابدأ من <a href={endpoint('/api/v1')}>{endpoint('/api/v1')}</a>، والعقد القابل للقراءة آليًا منشور بصيغة OpenAPI 3.1 على <a href={endpoint('/api/openapi.json')}>{endpoint('/api/openapi.json')}</a>.</p><p>واجهات v1 للقراءة فقط وتعرض المواد المنشورة والقابلة للفهرسة فقط.</p></>,
      },
      {
        title: '2. المحتوى والموارد والصفحات',
        body: <><p><code>GET /api/v1/content</code> للقائمة العامة، و<code>GET /api/v1/content/&lbrace;slug&rbrace;</code> للتفاصيل. توجد مجموعات مسماة للمقالات والأدلة والأبحاث والحالات والمقارنات والأدوات والدورات ومسارات التعلم والموارد والبروتوكولات والتدخلات والتقييمات والمصطلحات، إضافة إلى <code>GET /api/v1/pages</code> للصفحات المنشورة المؤسسية.</p><p>مثال: <a href={endpoint('/api/v1/research?limit=10')}>{endpoint('/api/v1/research?limit=10')}</a></p></>,
      },
      {
        title: '3. التكامل المؤسسي ومفاتيح الشركاء',
        body: <><p>يمكن للشريك المؤسسي إرسال مفتاحه عبر <code>X-API-Key</code> أو <code>Authorization: Bearer ...</code>. المفاتيح تُعرض مرة واحدة عند الإصدار، ولا تُخزن في قاعدة البيانات كنص صريح؛ يُحفظ لها ملخص SHA-256 فقط.</p><p>المفتاح اختياري للمسارات العامة، لكنه يضيف تعريف الشريك، حصصًا مستقلة قابلة للقياس، ونطاقات صلاحيات مثل <code>content:read</code> و<code>sources:read</code> و<code>search:read</code> و<code>changes:read</code> و<code>stats:read</code>.</p></>,
      },
      {
        title: '4. الحصص والاستجابة للضغط',
        body: <><p>التكاملات المؤسسية تستخدم حصصًا دقيقة لكل مفتاح على مستوى الدقيقة واليوم. عند تجاوز الحصة تعيد الواجهة <code>429</code> مع <code>Retry-After</code>. وعند نجاح الطلب تُعاد ترويسات مثل <code>X-RateLimit-Minute-Remaining</code> و<code>X-RateLimit-Day-Remaining</code>.</p><p>الحصص تُنفذ ذريًا في قاعدة البيانات لتقليل تجاوز الحدود تحت التوازي.</p></>,
      },
      {
        title: '5. البحث والتصفية',
        body: <><p>البحث العام متاح عبر <code>GET /api/v1/search?q=...</code>. تدعم قائمة المحتوى مرشحات النوع وتاريخ النشر والتحديث، مع Cursor Pagination غير معتمد على أرقام الصفحات.</p><p>الحد الأعلى المعتاد للقوائم 100 سجل. البحث يسمح حتى 50 نتيجة دون مفتاح، وحتى 100 نتيجة في الطلب المؤسسي الموثق. ويجب التعامل مع <code>next_cursor</code> كقيمة opaque وعدم تحليلها من جهة العميل.</p></>,
      },
      {
        title: '6. سجل المصادر وProvenance',
        body: <><p>السجل الموحّد متاح عبر <code>GET /api/v1/sources</code>، مع مرشحات للناشر والنوع والبحث النصي، ويمكن طلب سجل محدد عبر <code>GET /api/v1/sources/&lbrace;id&rbrace;</code>. ولكل مادة منشورة يوجد <code>GET /api/v1/content/&lbrace;slug&rbrace;/sources</code> لإظهار علاقة المادة بالمراجع المسجلة.</p><p>وجود مصدر في السجل يعني أنه مرجع للمادة ولا يعني تلقائيًا أن روافد أو المستهلك يملك حق إعادة نشر نص المصدر.</p></>,
      },
      {
        title: '7. حقوق إعادة الاستخدام',
        body: <><p>كل سجل محتوى يعيد كائن <code>rights</code>. الوضع الافتراضي المحافظ هو <code>link_and_citation_only</code> ما لم توجد بيانات ترخيص صريحة تسمح بأكثر من ذلك. يجب على التطبيقات المستهلكة احترام الترخيص ونص الإسناد.</p><p>إذا لم توجد رخصة صريحة، فلا تعتبر الواجهة نفسها ترخيصًا لإعادة نشر النص الكامل.</p></>,
      },
      {
        title: '8. التزامن التفاضلي',
        body: <><p>للمواقع التي تحتفظ بنسخة محلية من الفهرس، استخدم <code>GET /api/v1/changes?since=ISO_DATE</code> بدل إعادة سحب كامل المكتبة. يعيد المسار أحداث <code>published</code> و<code>updated</code> و<code>archived</code> مع <code>next_since</code>. الحد الأقصى 500 حدث للطلب العام و1000 للشريك الموثق.</p></>,
      },
      {
        title: '9. الخلاصات',
        body: <><p>RSS العام: <a href={endpoint('/feed.xml')}>{endpoint('/feed.xml')}</a>. RSS المجلة: <a href={endpoint('/magazine/feed.xml')}>{endpoint('/magazine/feed.xml')}</a>. JSON Feed 1.1: <a href={endpoint('/feed.json')}>{endpoint('/feed.json')}</a>.</p></>,
      },
      {
        title: '10. HTTP وCaching',
        body: <><p>تدعم الاستجابات العامة <code>ETag</code> وطلبات <code>If-None-Match</code>، مع Cache-Control مناسب للقراءة العامة و<code>304 Not Modified</code> عند عدم تغير الاستجابة. ترسل الواجهة أيضًا <code>X-Request-Id</code> لتتبع الأعطال.</p></>,
      },
      {
        title: '11. الأخطاء والاستقرار',
        body: <><p>الأخطاء تستخدم بنية موحدة تحتوي <code>code</code> و<code>message</code> و<code>parameter</code> و<code>request_id</code>. التكامل المؤسسي قد يعيد <code>401</code> للمفتاح غير الصالح أو المنتهي، <code>403</code> عند نقص النطاق، و<code>429</code> عند تجاوز الحصة.</p><p>المسارات مقيّدة بالإصدار <code>/api/v1</code> حتى لا تكسر التغييرات المستقبلية تكاملات الشركاء.</p></>,
      },
      {
        title: '12. الإتاحة واللغة',
        body: <><p>المحتوى الحالي عربي افتراضيًا ويعيد <code>language: ar</code>. صفحة المطورين جزء من برنامج الإتاحة العام للمنصة المستهدف لـ WCAG 2.2 AA، دون الادعاء باعتماد خارجي غير مثبت.</p></>,
      },
      {
        title: '13. الإحصاءات والحالة',
        body: <><p>إحصاءات الكتالوج العام: <a href={endpoint('/api/v1/stats')}>{endpoint('/api/v1/stats')}</a>. فحص البنية التشغيلية الحالي: <a href={endpoint('/api/health')}>{endpoint('/api/health')}</a>.</p></>,
      },
      {
        title: '14. سياسة التكامل المؤسسي',
        body: <><p>لا يحصل الشريك على مفاتيح Supabase أو صلاحيات إدارية. التكامل يتم فقط عبر API المخصص مع مفاتيح قابلة للإلغاء، نطاقات محددة، تواريخ انتهاء، وحصص استخدام.</p><p><Link href="/sources">راجع منهج المصادر</Link> و<Link href="/editorial-policy">السياسة التحريرية</Link> قبل بناء تكامل يعيد عرض المحتوى.</p></>,
      },
      {
        title: '15. عميل TypeScript المرجعي',
        body: <><p>يوفر مستودع روافد عميل TypeScript مرجعيًا بلا تبعيات خارجية يغطي المحتوى والبحث والتغييرات والإحصاءات وسجل المصادر. يدعم مفاتيح الشركاء ويعيد أخطاء منظمة تتضمن حالة HTTP ورقم الطلب و<code>Retry-After</code> عند وجوده.</p><p>مفاتيح الشركاء أسرار خادمية ولا يجوز وضعها في JavaScript عام أو تطبيقات العميل أو المستودعات أو سجلات التحليلات.</p></>,
      },
      {
        title: '16. التوافق والإهمال التدريجي',
        body: <><p>ضمن <code>/api/v1</code> يمكن إضافة حقول أو مسارات جديدة بصورة متوافقة، بينما لا تزال إزالة الحقول الموثقة أو تغيير أنواعها أو حذف المسارات تغييرات كاسرة. عند الحاجة إلى إهمال قدرة حالية، تتبع روافد انتقالًا مرحليًا مع توثيق البديل واستخدام ترويسات <code>Deprecation</code> و<code>Sunset</code> حين يكون تاريخ الإيقاف معروفًا.</p><p>أي جيل غير متوافق مستقبلًا سيستخدم مساحة إصدار رئيسية جديدة مثل <code>/api/v2</code> بدل كسر تكاملات v1.</p></>,
      },
    ]}
  />;
}
