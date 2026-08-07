# Rawafid V3 — Theme Acceptance Gate

## القاعدة الملزمة

لا يُعتبر الثيم جاهزًا ولا تبدأ مرحلة ترحيل المحتوى إلا بعد اجتياز جميع البوابات أدناه بنتيجة PASS موثقة بالاختبارات. مراجعة المستودع القديم في هذه المرحلة مسموحة فقط لفهم البنية، القطاعات، الأقسام، أنواع الصفحات، الروابط والقدرات الوظيفية.

**يُمنع سحب أو استيراد محتوى الصفحات القديمة قبل الأمر الصريح: «ابدأ سحب المحتوى».**

## تعريف 100/100

100/100 = جميع البنود التالية PASS، ولا توجد أخطاء حرجة أو عالية، ويمر Quality Gate النهائي على بيئة قريبة من الإنتاج.

| البوابة | معيار القبول | الحالة الحالية |
|---|---|---|
| Architecture | Core + Modules، بنية نظيفة قابلة للتوسع، لا اعتماد على الثيم القديم | PARTIAL |
| Supabase | migrations + typed clients + RLS/RBAC + Auth SSR + فصل الصلاحيات + Security Advisor نظيف | PARTIAL |
| Dynamic Taxonomy | إنشاء/تعديل/ترتيب/تعطيل القطاعات والأقسام والتصنيفات من لوحة الإدارة دون تعديل الكود | PENDING |
| CMS | أنواع المحتوى، Editor مؤسسي، Versions، Preview، Workflow كامل، Audit Trail | PARTIAL |
| Responsive | 320px إلى الشاشات الكبيرة، RTL، بدون overflow، touch targets صحيحة، tablet/mobile layouts | PARTIAL |
| Mobile UX | Bottom Navigation، قوائم ومودالات ونماذج مناسبة للمس، عدم إجبار الزائر على الحساب | PENDING |
| SEO | metadata ديناميكية، canonical، robots، sitemap index، structured data، breadcrumbs، OG، redirects، قواعد indexation | PARTIAL |
| PWA | manifest، installability، service worker، offline fallback، caching، update strategy، push، share target، deep links، icons/splash | PENDING |
| Accessibility | WCAG 2.2 AA، keyboard، focus، contrast، labels/ARIA، reduced motion، اختبارات آلية ويدوية | PENDING |
| Performance | Core Web Vitals/Lighthouse budgets، image/font optimization، code splitting، caching، no layout shift | PENDING |
| Admin Portal | صلاحيات المالك/المدير الكاملة: محتوى، مستخدمون، مختصون، مراكز، قطاعات، SEO، Redirects، Audit، إعدادات | PARTIAL |
| Specialist Portal | الملف، المؤهلات، التوثيق، المقالات، المراجعات، الرسائل، المواعيد، المركز، الإشعارات، الإحصاءات | PARTIAL |
| Center Portal | بيانات المركز، الفروع، الفريق، الخدمات، ساعات العمل، وسائل التواصل، إدارة الظهور والتوثيق | PARTIAL |
| Specialist Directory | بحث/تصفية، صفحة عامة، verification، بيانات ومؤهلات، privacy toggles، contact/appointment/map حسب الإذن | PARTIAL |
| Messaging | participants/RLS، نص/ملفات، notifications، read state، archive، block/report، abuse/rate controls | PARTIAL |
| Appointments | طلب/تأكيد/إلغاء/إكمال، صلاحيات الأطراف، availability، notifications، audit | PARTIAL |
| Search | محرك موحد للمحتوى/الأدوات/المختصين/المراكز/الأبحاث مع filters وtabs | PENDING |
| Security | لا أسرار في العميل، validation، RLS tests، session/cache safety، security headers/CSP، rate limits، audit | PARTIAL |
| QA/CI | typecheck + lint + build + unit + integration + E2E + accessibility + Lighthouse + security regression | PARTIAL |
| GitHub Governance | branch protection، required checks، PR workflow، منع الدمج عند فشل Quality Gate | PENDING |
| Legacy Mapping | inventory للقطاعات/الأقسام/URLs/redirects دون استيراد المحتوى | IN PROGRESS |
| Migration Readiness | importer قابل للتكرار، dedupe، taxonomy mapping، SEO mapping، rollback/dry-run | PENDING |

## البنية المستهدفة

- Accounts & Identity
- RBAC / Permissions
- Knowledge Engine
- Content CMS + Versions
- Specialist Directory + Verification
- Center Directory
- Messaging
- Appointments
- Search
- Maps
- Tools / Assessments
- Learning
- Research / Evidence
- Analytics
- SEO / Structured Data / Redirects
- PWA
- Notifications
- Audit Trail

كل Module مستقل وظيفيًا ويستخدم نفس Design System والهوية ونظام الصلاحيات وقاعدة البيانات.

## سياسة القطاعات والتصنيف

المستودع القديم مصدر لفهم المعلومات وليس مصدرًا للبنية البرمجية الجديدة. لا يتم نسخ المجلدات 1:1. يتم تحويلها إلى Taxonomy ديناميكية داخل Supabase تشمل على الأقل: sector، category، parent category، content type، audience، tags، status، sort order، visibility، SEO fields.

## سياسة SEO أثناء التطوير

تبقى بيئة التطوير/staging غير مفهرسة. لا يُرفع `noindex` عن الإنتاج إلا بعد اجتياز فحص canonical/robots/sitemaps/structured data/redirects وعدم وجود صفحات اختبارية أو فارغة.

## سياسة الإطلاق

لا إعلان عن 100/100 قبل الاختبار الفعلي. لا ترحيل محتوى قبل 100/100. بعد الوصول إلى 100/100 ينتظر النظام الأمر الصريح: **«ابدأ سحب المحتوى»**.