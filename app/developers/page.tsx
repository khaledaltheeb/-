import Link from 'next/link';
import TrustPage from '@/components/trust-page';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'واجهة روافد العامة للمطورين API',
  description: 'توثيق رسمي لواجهة Rawafid Public API v1 وخلاصات RSS وJSON Feed وآليات التزامن والمصادر وحقوق إعادة الاستخدام.',
  path: '/developers',
  index: true,
  keywords: ['Rawafid API','واجهة برمجة روافد','Arabic health API','RSS روافد','OpenAPI روافد'],
});

const endpoint = (path: string) => `${SITE_URL}${path}`;

export default function DevelopersPage() {
  return <TrustPage
    eyebrow="Developer Platform"
    title="واجهة روافد العامة للمطورين"
    intro="طبقة تكامل عامة، مقروءة آليًا، ومحددة الإصدار للمواد المنشورة في روافد. صُممت للاكتشاف والبحث والتزامن والاستشهاد بالمصادر دون كشف المسودات أو البيانات الخاصة."
    sections={[
      {
        title: '1. نقطة البداية والعقد الرسمي',
        body: <><p>الإصدار المستقر الحالي هو <code>v1</code>. ابدأ من <a href={endpoint('/api/v1')}>{endpoint('/api/v1')}</a>، والعقد القابل للقراءة آليًا منشور بصيغة OpenAPI 3.1 على <a href={endpoint('/api/openapi.json')}>{endpoint('/api/openapi.json')}</a>.</p><p>كل واجهات v1 للقراءة فقط وتعرض المواد المنشورة والقابلة للفهرسة فقط.</p></>,
      },
      {
        title: '2. المحتوى والموارد',
        body: <><p><code>GET /api/v1/content</code> للقائمة العامة، و<code>GET /api/v1/content/&lbrace;slug&rbrace;</code> للتفاصيل. توجد مجموعات مسماة للمقالات والأدلة والأبحاث والحالات والمقارنات والأدوات والدورات ومسارات التعلم والموارد والبروتوكولات والتدخلات والتقييمات والمصطلحات.</p><p>مثال: <a href={endpoint('/api/v1/research?limit=10')}>{endpoint('/api/v1/research?limit=10')}</a></p></>,
      },
      {
        title: '3. البحث والتصفية',
        body: <><p>البحث العام متاح عبر <code>GET /api/v1/search?q=...</code>. تدعم قائمة المحتوى مرشحات النوع وتاريخ النشر والتحديث، مع Cursor Pagination غير معتمد على أرقام الصفحات.</p><p>الحد الأعلى المعتاد للصفحة 100 سجل، ويجب التعامل مع <code>next_cursor</code> كقيمة opaque وعدم تحليلها من جهة العميل.</p></>,
      },
      {
        title: '4. المصادر وProvenance',
        body: <><p>لكل مادة منشورة يمكن طلب <code>GET /api/v1/content/&lbrace;slug&rbrace;/sources</code> للحصول على المراجع المسجلة، الناشر، الرابط، DOI/PMID حين تكون متاحة، والحقول المتعلقة بالترخيص.</p><p>وجود مصدر في السجل يعني أنه مرجع للمادة ولا يعني تلقائيًا أن روافد أو المستهلك يملك حق إعادة نشر نص المصدر.</p></>,
      },
      {
        title: '5. حقوق إعادة الاستخدام',
        body: <><p>كل سجل محتوى يعيد كائن <code>rights</code>. الوضع الافتراضي المحافظ هو <code>link_and_citation_only</code> ما لم توجد بيانات ترخيص صريحة تسمح بأكثر من ذلك. يجب على التطبيقات المستهلكة احترام الترخيص ونص الإسناد.</p><p>إذا لم توجد رخصة صريحة، فلا تعتبر الواجهة نفسها ترخيصًا لإعادة نشر النص الكامل.</p></>,
      },
      {
        title: '6. التزامن التفاضلي',
        body: <><p>للمواقع التي تحتفظ بنسخة محلية من الفهرس، استخدم <code>GET /api/v1/changes?since=ISO_DATE</code> بدل إعادة سحب كامل المكتبة. يعيد المسار أحداث <code>published</code> و<code>updated</code> و<code>archived</code> مع <code>next_since</code>.</p></>,
      },
      {
        title: '7. الخلاصات',
        body: <><p>RSS العام: <a href={endpoint('/feed.xml')}>{endpoint('/feed.xml')}</a>. RSS المجلة: <a href={endpoint('/magazine/feed.xml')}>{endpoint('/magazine/feed.xml')}</a>. JSON Feed 1.1: <a href={endpoint('/feed.json')}>{endpoint('/feed.json')}</a>.</p></>,
      },
      {
        title: '8. HTTP وCaching',
        body: <><p>تدعم الاستجابات العامة <code>ETag</code> وطلبات <code>If-None-Match</code>، مع Cache-Control مناسب للقراءة العامة و<code>304 Not Modified</code> عند عدم تغير الاستجابة. ترسل الواجهة أيضًا <code>X-Request-Id</code> لتتبع الأعطال.</p></>,
      },
      {
        title: '9. الأخطاء والاستقرار',
        body: <><p>الأخطاء تستخدم بنية موحدة تحتوي <code>code</code> و<code>message</code> و<code>parameter</code> و<code>request_id</code>. المسارات مقيّدة بالإصدار <code>/api/v1</code> حتى لا تكسر التغييرات المستقبلية تكاملات الشركاء.</p></>,
      },
      {
        title: '10. الإتاحة واللغة',
        body: <><p>المحتوى الحالي عربي افتراضيًا ويعيد <code>language: ar</code>. صفحة المطورين جزء من برنامج الإتاحة العام للمنصة المستهدف لـ WCAG 2.2 AA، دون الادعاء باعتماد خارجي غير مثبت.</p></>,
      },
      {
        title: '11. الإحصاءات والحالة',
        body: <><p>إحصاءات الكتالوج العام: <a href={endpoint('/api/v1/stats')}>{endpoint('/api/v1/stats')}</a>. فحص البنية التشغيلية الحالي: <a href={endpoint('/api/health')}>{endpoint('/api/health')}</a>.</p></>,
      },
      {
        title: '12. التكامل المؤسسي',
        body: <><p>الواجهة العامة مناسبة للفهرسة والتطبيقات التعليمية والبوابات المؤسسية وتجميع الموارد. التكاملات التي تحتاج حصة استخدام أكبر أو عقد بيانات مخصص يجب أن تُبنى كطبقة شراكة منفصلة، دون إعطاء مفاتيح قاعدة البيانات أو صلاحيات إدارية.</p><p><Link href="/sources">راجع منهج المصادر</Link> و<Link href="/editorial-policy">السياسة التحريرية</Link> قبل بناء تكامل يعيد عرض المحتوى.</p></>,
      },
    ]}
  />;
}
