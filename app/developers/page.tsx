import Link from 'next/link';
import TrustPage from '@/components/trust-page';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'واجهة روافد العامة والمؤسسية للمطورين API',
  description: 'التوثيق الرسمي لـ Rawafid Public & Partner API v1.1 وخلاصات RSS وJSON Feed وآليات التزامن والمصادر والمصادقة والحصص وحقوق إعادة الاستخدام واكتشاف الأدلة البحثية.',
  path: '/developers',
  index: true,
  keywords: ['Rawafid API','واجهة برمجة روافد','Arabic health API','Partner API روافد','RSS روافد','OpenAPI روافد','Europe PMC API','Lens Scholarly API','ROR identifiers'],
});

const endpoint = (path: string) => `${SITE_URL}${path}`;

export default function DevelopersPage() {
  return <TrustPage
    eyebrow="Developer Platform"
    title="واجهة روافد العامة والمؤسسية للمطورين"
    intro="طبقة تكامل مقروءة آليًا، محددة الإصدار، ومصممة للمواد المنشورة في روافد. تدعم الاستخدام العام، والتكامل المؤسسي بمفاتيح شراكة اختيارية وحصص قابلة للقياس، واكتشاف الأدلة البحثية متعددة المزودين، دون كشف المسودات أو البيانات الخاصة."
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
        title: '6. اكتشاف الأدلة البحثية متعددة المزودين',
        body: <><p>يوفر <code>GET /api/v1/evidence-discovery?q=...</code> طبقة بحث موحدة للأدلة. المزود المفتوح الافتراضي هو <code>europe_pmc</code>، ويمكن طلب <code>lens</code> أيضًا عند توفر اعتماد Scholarly API على الخادم. مثال مفتوح: <a href={endpoint('/api/v1/evidence-discovery?q=autism%20spectrum%20disorder&providers=europe_pmc&limit=5')}>{endpoint('/api/v1/evidence-discovery?q=autism%20spectrum%20disorder&providers=europe_pmc&limit=5')}</a>.</p><p>يمكن تحديد <code>providers=europe_pmc,lens</code>. غياب اعتماد Lens أو تعطل مزود واحد لا يسقط بقية المزودين؛ تُعاد حالة كل مزود بصورة مستقلة. الحد الأقصى 50 نتيجة للطلب العام و100 للشريك الموثق بنطاق <code>search:read</code>.</p></>,
      },
      {
        title: '7. نموذج البيانات البحثية والهوية المؤسسية',
        body: <><p>تُطبّع النتائج إلى حقول مشتركة تشمل العنوان والملخص والسنة والمجلة والناشر والمؤلفين ومعرفات DOI وPMID وPMCID وLens/OpenAlex حين تتوفر، وعدد الاستشهادات وحالة الوصول المفتوح والسحب.</p><p>انتماءات المؤلفين قد تحمل <code>ROR ID</code> عند توفره. يستخدم سجل المصادر الداخلي ROR كهوية مؤسسية مستقرة مع provenance لطريقة المطابقة بدل الاعتماد على اسم الناشر النصي وحده. ORCID يُقبل فقط عندما يكون نوع المعرّف صالحًا ومطابقًا لبنية ORCID.</p></>,
      },
      {
        title: '8. Europe PMC: البحث والنصوص والمراجع',
        body: <><p>تكامل Europe PMC يستخدم REST API مع <code>resultType=core</code> وCursor Pagination، ويدعم طبقات داخلية للمراجع والاستشهادات وFull Text XML والملفات التكميلية عندما يتيحها السجل الأصلي.</p><p>وجود رابط نص كامل أو ملف تكميلي لا يغيّر حقوق إعادة الاستخدام؛ يجب فحص رخصة السجل أو المصدر الأصلي قبل إعادة نشر المحتوى.</p></>,
      },
      {
        title: '9. Lens Scholarly API وحدود الاعتماد',
        body: <><p>تكامل Lens يعمل server-side فقط ولا يكشف رمز Scholarly API للمتصفح أو في المستودع. إذا لم يكن <code>LENS_SCHOLARLY_API_TOKEN</code> مضبوطًا، تُعامل Lens كـ<code>not_configured</code> وتستمر Europe PMC بالعمل.</p><p>تُفسر تحديثات السحب بدقة: وجود Correction أو Expression of Concern أو Reinstatement لا يعني تلقائيًا أن العمل مسحوب؛ لا تُرفع علامة السحب إلا لتحديث Retraction الفعلي.</p></>,
      },
      {
        title: '10. المصادر وProvenance',
        body: <><p>لكل مادة منشورة يمكن طلب <code>GET /api/v1/content/&lbrace;slug&rbrace;/sources</code> للحصول على المراجع المسجلة، الناشر، الرابط، DOI/PMID حين تكون متاحة، والحقول المتعلقة بالترخيص.</p><p>نتائج Evidence Discovery تعيد <code>provenance</code> يتضمن المزود ووقت الاسترجاع ونقطة النهاية وإصدار المزود حين يتوفر. وجود مصدر في السجل يعني أنه مرجع للمادة ولا يعني تلقائيًا أن روافد أو المستهلك يملك حق إعادة نشر نص المصدر.</p></>,
      },
      {
        title: '11. حقوق إعادة الاستخدام',
        body: <><p>كل سجل محتوى يعيد كائن <code>rights</code>. الوضع الافتراضي المحافظ هو <code>link_and_citation_only</code> ما لم توجد بيانات ترخيص صريحة تسمح بأكثر من ذلك. ويجب أيضًا احترام شروط ورخص المزود والسجل الأصلي للبيانات البحثية.</p><p>إذا لم توجد رخصة صريحة، فلا تعتبر الواجهة نفسها ترخيصًا لإعادة نشر النص الكامل أو مجموعة بيانات مزود خارجي.</p></>,
      },
      {
        title: '12. التزامن التفاضلي',
        body: <><p>للمواقع التي تحتفظ بنسخة محلية من الفهرس، استخدم <code>GET /api/v1/changes?since=ISO_DATE</code> بدل إعادة سحب كامل المكتبة. يعيد المسار أحداث <code>published</code> و<code>updated</code> و<code>archived</code> مع <code>next_since</code>. الحد الأقصى 500 حدث للطلب العام و1000 للشريك الموثق.</p></>,
      },
      {
        title: '13. الخلاصات',
        body: <><p>RSS العام: <a href={endpoint('/feed.xml')}>{endpoint('/feed.xml')}</a>. RSS المجلة: <a href={endpoint('/magazine/feed.xml')}>{endpoint('/magazine/feed.xml')}</a>. JSON Feed 1.1: <a href={endpoint('/feed.json')}>{endpoint('/feed.json')}</a>.</p></>,
      },
      {
        title: '14. HTTP وCaching',
        body: <><p>تدعم الاستجابات العامة <code>ETag</code> وطلبات <code>If-None-Match</code>، مع Cache-Control مناسب للقراءة العامة و<code>304 Not Modified</code> عند عدم تغير الاستجابة. ترسل الواجهة أيضًا <code>X-Request-Id</code> لتتبع الأعطال.</p></>,
      },
      {
        title: '15. الأخطاء والاستقرار',
        body: <><p>الأخطاء تستخدم بنية موحدة تحتوي <code>code</code> و<code>message</code> و<code>parameter</code> و<code>request_id</code>. التكامل المؤسسي قد يعيد <code>401</code> للمفتاح غير الصالح أو المنتهي، <code>403</code> عند نقص النطاق، و<code>429</code> عند تجاوز الحصة.</p><p>المسارات مقيّدة بالإصدار <code>/api/v1</code> حتى لا تكسر التغييرات المستقبلية تكاملات الشركاء.</p></>,
      },
      {
        title: '16. الإتاحة واللغة',
        body: <><p>المحتوى الحالي عربي افتراضيًا ويعيد <code>language: ar</code>. صفحة المطورين جزء من برنامج الإتاحة العام للمنصة المستهدف لـ WCAG 2.2 AA، دون الادعاء باعتماد خارجي غير مثبت.</p></>,
      },
      {
        title: '17. الإحصاءات والحالة',
        body: <><p>إحصاءات الكتالوج العام: <a href={endpoint('/api/v1/stats')}>{endpoint('/api/v1/stats')}</a>. فحص البنية التشغيلية الحالي: <a href={endpoint('/api/health')}>{endpoint('/api/health')}</a>.</p></>,
      },
      {
        title: '18. سياسة التكامل المؤسسي',
        body: <><p>لا يحصل الشريك على مفاتيح Supabase أو صلاحيات إدارية. التكامل يتم فقط عبر API المخصص مع مفاتيح قابلة للإلغاء، نطاقات محددة، تواريخ انتهاء، وحصص استخدام.</p><p><Link href="/sources">راجع منهج المصادر</Link> و<Link href="/editorial-policy">السياسة التحريرية</Link> قبل بناء تكامل يعيد عرض المحتوى.</p></>,
      },
    ]}
  />;
}
