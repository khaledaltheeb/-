import TrustPage from '@/components/trust-page';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'Lens.org وLens Labs — تكامل واجهة روافد البحثية',
  description: 'التوثيق الكامل لتكامل Rawafid / Health Renewal مع Lens Scholarly API: الاستخدام، Lens ID، الإسناد، الحصص، الخصوصية، الحقوق، الأخطاء، والأمان.',
  path: '/developers/lens',
  index: true,
  keywords: ['Lens Scholarly API','Lens Labs','The Lens API','Rawafid API','Health Renewal API','Lens ID','scholarly metadata'],
});

const local = (path: string) => `${SITE_URL}${path}`;

export default function LensDeveloperPage() {
  return <TrustPage
    eyebrow="Developer Platform / Lens"
    title="Lens.org وLens Labs — قسم التكامل البحثي"
    intro="قسم تقني مستقل لتكامل روافد مع Lens Scholarly API، مصمم ليكون صريحًا في مصدر البيانات، محافظًا في الحقوق والخصوصية، ومقاومًا لتجاوز الحصص أو كشف الاعتماديات السرية."
    sections={[
      { title: '1. الحالة ونطاق التكامل', body: <><p>Lens مزود اختياري ضمن واجهة اكتشاف الأدلة في روافد. لا يُستدعى تلقائيًا في البحث الافتراضي؛ يجب طلبه صراحة عبر <code>providers=lens</code> أو إضافته إلى قائمة المزودات.</p><p>الحالة الآلية للتكامل متاحة من <a href={local('/api/v1/lens')}>{local('/api/v1/lens')}</a>. نقطة البحث الفعلية: <a href={local('/api/v1/evidence-discovery')}>{local('/api/v1/evidence-discovery')}</a>.</p></> },
      { title: '2. أمثلة الاستخدام', body: <><p>Lens فقط: <code>/api/v1/evidence-discovery?q=autism&amp;providers=lens&amp;limit=5</code></p><p>بحث مختلط: <code>/api/v1/evidence-discovery?q=autism&amp;providers=europe_pmc,crossref,datacite,lens&amp;limit=10</code></p><p>إذا لم يكن الاعتماد مفعّلًا، لا تفشل الواجهة كاملة؛ تظهر Lens بحالة <code>not_configured</code> بينما تستمر المزودات الأخرى.</p></> },
      { title: '3. Lens ID والهوية المصدرية', body: <><p>كل سجل Lens صالح يحتفظ بـ<code>Lens ID</code> في <code>provider_id</code> و<code>identifiers.lens</code>، مع رابط مباشر إلى السجل الأصلي في Lens. لا يُستبدل Lens ID بمعرف داخلي مبهم عند العرض أو التصدير.</p></> },
      { title: '4. الإسناد Attribution', body: <><p>الإسناد المعتمد في التكامل هو <strong>Data Sourced from The Lens</strong>. يعاد ككائن <code>attribution</code> داخل سجل Lens، ويجب إظهاره عند نقطة عرض بيانات Lens للمستخدم، مع رابط إلى <a href="https://www.lens.org/" rel="noreferrer">Lens.org</a> وسياسة <a href="https://about.lens.org/policies/#attribution" rel="noreferrer">The Lens attribution policy</a>.</p></> },
      { title: '5. الحصص والاعتمادية', body: <><p>يُفرض حد التكامل الحالي تشغيليًا بحد <strong>10 طلبات في الدقيقة</strong> و<strong>20,000 طلب في الشهر</strong>. الحجز ذري ومشترك بين نسخ الخادم عبر PostgreSQL.</p><p>يتم حجز الحصة قبل الاتصال الخارجي. إذا تعطلت طبقة الحصة يفشل Lens وحده بصورة <em>fail closed</em>. لا توجد retries تلقائية لطلب Lens الخارجي، لمنع تضخيم الاستهلاك.</p></> },
      { title: '6. الأمان وإدارة الاعتماد', body: <><p>رمز Lens يحفظ فقط كمتغير خادمي باسم <code>LENS_SCHOLARLY_API_TOKEN</code>. لا يظهر في HTML أو JSON العام أو JavaScript العميل أو المستودع.</p><p>عداد الحصة يستخدم تنفيذًا مميزًا داخل schema خاصة، بينما بوابة RPC العامة <code>SECURITY INVOKER</code> فقط. التنفيذ محصور في <code>service_role</code>؛ لا يسمح به لـ<code>anon</code> أو <code>authenticated</code>.</p></> },
      { title: '7. الخصوصية وعدم التتبع', body: <><p>لا ينشئ تكامل Lens ملفًا شخصيًا للمستخدم ولا معرف مستخدم خاصًا بـLens ولا fingerprint ولا جدول تتبع لاستعلامات الأفراد. عداد الحصة عالمي للخدمة ويخزن نافذة الاستخدام وعدد الطلبات فقط.</p></> },
      { title: '8. حقوق البيانات والمحتوى', body: <><p>الوصول إلى Lens API لا يُعامل كترخيص لإعادة نشر النص الكامل أو أي مادة مقيدة. التكامل يعيد metadata للاكتشاف، المعرفات، provenance، وروابط المصدر وفق الحدود المسموح بها.</p><p>أي إعادة استخدام لاحقة يجب أن تراعي حقوق السجل الأصلي وشروط Lens والمصدر. غياب رخصة صريحة لا يعني السماح.</p></> },
      { title: '9. نموذج البيانات', body: <><p>يتم تطبيع العنوان، الملخص عند توفره، نوع النشر، السنة والتاريخ، المصدر والناشر، المؤلفين الأفراد والجماعيين، DOI وPMID وPMCID وOpenAlex وLens ID، عدد الاستشهادات، الوصول المفتوح، السحب، الإسناد وprovenance.</p><p>يحافظ الموصل على <code>collective_name</code> للمؤلفين الجماعيين حتى لا تضيع مجموعات البحث والكونسورتيوم.</p></> },
      { title: '10. حالات الخطأ', body: <><ul><li><code>not_configured</code>: لم يصل اعتماد Lens بعد.</li><li><code>rate_limited</code>: استُنفدت حصة Lens الحالية.</li><li><code>provider_unavailable</code>: Lens أو حارس الحصة غير متاح.</li></ul><p>جميع هذه الحالات معزولة على مستوى المزود، ولا تسقط Europe PMC أو Crossref أو DataCite.</p></> },
      { title: '11. Caching وHTTP', body: <><p>الاستجابات العامة تستخدم cache قصير لتقليل الاستعلامات المتكررة. الاستجابات المرتبطة بمفتاح شريك تتحول إلى <code>private, no-store</code> وتستخدم <code>Vary</code> مناسبًا للاعتماد.</p><p>لا يتم وضع رمز Lens داخل cache key أو response metadata.</p></> },
      { title: '12. التفعيل الإنتاجي', body: <><ol><li>استلام Scholarly API credential المعتمد.</li><li>تطبيق migration الخاصة بحصة Lens والتحقق منها.</li><li>حفظ <code>LENS_SCHOLARLY_API_TOKEN</code> كسر خادمي فقط.</li><li>التحقق من صلاحيات RPC وSupabase security advisors.</li><li>تشغيل جميع CI gates.</li><li>اختبار Lens-only والبحث المختلط.</li><li>التحقق من Lens ID والإسناد والمؤلفين الجماعيين.</li><li>اختبار 429/503 والعزل بين المزودات.</li><li>التأكد من عدم ظهور السر في السجلات أو الاستجابات.</li><li>إرسال روابط التنفيذ الحي إلى فريق Lens، ثم ترتيب الـdemo.</li></ol></> },
      { title: '13. المراجع التقنية', body: <><p>OpenAPI: <a href={local('/api/openapi.json')}>{local('/api/openapi.json')}</a></p><p>API discovery: <a href={local('/api/v1')}>{local('/api/v1')}</a></p><p>Lens integration manifest: <a href={local('/api/v1/lens')}>{local('/api/v1/lens')}</a></p><p>توثيق المطورين العام: <a href={local('/developers')}>{local('/developers')}</a></p></> },
    ]}
  />;
}
