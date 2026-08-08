# A4 Canonical conflict — digital-boundaries-family

- Candidate legacy key: `digital-boundaries-family`
- Legacy title: `الحدود الرقمية للأسرة`
- Lane reviewed: A4 — الطفل والأسرة والمدرسة
- Claim: #74
- Decision: **STOP / POTENTIAL DUPLICATE — C0 DECISION REQUIRED**
- Proposed canonical was: `/content/digital-boundaries-family`
- Existing overlapping canonicals:
  - `/content/healthy-boundaries`
  - `/content/screens-child`

## Evidence

فحص A4 للسجل المنشور والـCMS أظهر أن Canonical `/content/healthy-boundaries` منشورة بالفعل، وسجل ترحيلها يحدد نطاقها صراحة بأنه يشمل: الخصوصية، المساحة الشخصية، القواعد المنزلية، الاستقلال المتدرج، **الحدود الرقمية**، وحدود الوقت والمساعدة. كما أن الصفحة نفسها أُثريت من UNICEF حول الخصوصية على الإنترنت وتغطي الخصوصية الجسدية والرقمية.

Canonical `/content/screens-child` منشورة أيضًا، وسجلها يثبت أنها تغطي: خطة الاستخدام الإعلامي الأسري، تنظيم الأجهزة، النوم والطعام والواجبات، اختيار المحتوى، الخصوصية والسلامة الرقمية، دور المدرسة، أدوات الرقابة الأبوية، والتدرج في القواعد الأسرية.

المرشح `digital-boundaries-family` يقع بين هذين الـCanonicalين: إذا بُني كصفحة عن وقت الشاشة والقواعد والأجهزة فسيكرر `screens-child`، وإذا بُني كصفحة عن الخصوصية والحدود والاستقلال الرقمي فسيكرر جزءًا جوهريًا من `healthy-boundaries`. لذلك لا توجد حاليًا نية بحث مستقلة مثبتة تكفي لتبرير Canonical ثالثة من دون قرار معماري من C0 حول إعادة توزيع النطاق.

تم أيضًا التحقق من Supabase قبل القرار: لا يوجد صف حالي باسم/slug/canonical `digital-boundaries-family`، وبالتالي إيقاف الصفحة الآن يمنع إنشاء Duplicate جديد ولا يتطلب حذف بيانات.

## Legacy notes

المصدر القديم المشار إليه في Claim هو `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json`. البحث التاريخي في المستودع كشف أيضًا مواد رقمية عامة ومسارًا منفصلًا باسم `quick-info/digital-boundaries-relationship/`، لكنه يبدو موجّهًا لعلاقة/حدود رقمية مختلفة ولا يجوز افتراض أنه Redirect لهذا المرشح الأسري من دون تحقق مستقل.

لم يُنشأ أي Redirect تخميني، ولم يُنشأ CMS row لهذه الصفحة.

## Coordinator action requested

على C0 اتخاذ أحد القرارات التالية قبل أي محاولة جديدة:

1. اعتبار `digital-boundaries-family` alias/semantic term أو قسمًا داخليًا ضمن `/content/healthy-boundaries`؛ أو
2. اعتباره مدخلًا ضمن `/content/screens-child` إذا كانت نية البحث الأساسية تنظيم استخدام الأجهزة والشاشات؛ أو
3. إعادة تحديد نطاق مستقل ضيق لا يتكرر مع الصفحتين، ثم إعادة فتح Claim جديد بعد توثيق Canonical boundary.

لا ينبغي نشر `/content/digital-boundaries-family` بصيغته الحالية قبل هذا القرار.
