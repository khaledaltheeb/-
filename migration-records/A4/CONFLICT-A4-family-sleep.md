# A4 Canonical conflict — family-sleep

- Candidate legacy key: `family-sleep`
- Legacy title: `النوم كقضية أسرية`
- Lane reviewed: **A4 — الطفل والأسرة والمدرسة**
- Claim: **#76**
- Decision: **DO NOT CREATE SECOND CANONICAL / DUPLICATE INTENT**
- Proposed canonical was: `/content/family-sleep`
- Existing canonical: `/content/child-sleep`
- Existing migration record: `migration-records/A4/MIG-A4-000007-child-sleep.md`

## Pre-claim review

قبل Claim تم البحث عن `family-sleep` و«النوم كقضية أسرية» و«نوم الأسرة» و«روتين النوم للأسرة» في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase. لم يوجد Claim أو slug/canonical مطابق لـ`family-sleep`، لكن ظهر Canonical منشور `/content/child-sleep`؛ لذلك أُنشئ Claim #76 واحد فقط ثم أُجري فحص حدود الـCanonical قبل أي إنشاء في CMS.

## Legacy evidence

المصدر القديم `content/sectors-v10/family.json` يصف `family-sleep` كتنظيم البيت لدعم النوم بدل جعل كل فرد «يحارب وحده»، ويركز على:

- مواعيد نوم/استيقاظ متقلبة.
- الضوضاء والإضاءة الليلية.
- النزاعات الصباحية.
- تثبيت وقت استيقاظ قريب.
- خفض الإضاءة مساءً.
- روتين مسائي قصير.
- طلب تقييم عند الشخير أو الأرق المستمر.
- عدم استخدام النوم كعقاب أو حرمان.

فحص تاريخ `content/sectors-v10/family.json` يبين أن طبقة v10 ذات الصلة تعود إلى commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20، ولا توجد نسخة تاريخية مستقلة مثبتة لهذا المدخل تحتاج Canonical منفصلًا.

## Collision evidence

Canonical المنشورة `/content/child-sleep` ليست صفحة ضيقة تخص الطفل بمعزل عن الأسرة؛ سجل ترحيلها يثبت أنها دليل عملي للأسرة ويغطي بالفعل:

- بناء الجدول من وقت الاستيقاظ.
- روتين المساء.
- الضوء والشاشات.
- مقاومة النوم والاستيقاظ الليلي.
- بيئة غرفة النوم.
- أثر النوم في السلوك والتركيز المدرسي.
- نوم المراهق والقيلولة.
- الشخير والتنفس أثناء النوم ومؤشرات التقييم.
- خطة عملية لتعديل النوم على مدى أسبوعين.

كما أن `/content/child-sleep` استوعبت أصلًا المسار العام الموثق `/quick-info/child-sleep-evaluation/` عبر Redirect 301، ما يجعلها Canonical النوم الأسري/الطفولي العملية القائمة في A4.

إنشاء `/content/family-sleep` بالمحاور القديمة سيكرر الجدول والروتين والبيئة والشخير والصباح، ويقسم إشارات البحث والروابط بين صفحتين دون نية مستقلة كافية.

## Decision

- لم يُنشأ CMS row لـ`family-sleep`.
- لم يُنشأ Redirect تخميني من slug الموجود داخل JSON.
- يُعامل المدخل القديم كموضوع مغطى داخل `/content/child-sleep`، مع إمكانية إضافته لاحقًا كـalias/semantic term إذا قرر C0 ذلك.
- إذا أراد C0 مستقبلًا Canonical مستقلة للنوم الأسري، يجب أولًا تحديد نية بحث لا تغطيها صفحة الطفل الحالية وإعادة توزيع المحتوى صراحةً، بدل النسخ المتوازي.

**Result: CONFLICT / DUPLICATE — stopped at page level, no CMS duplication introduced.**