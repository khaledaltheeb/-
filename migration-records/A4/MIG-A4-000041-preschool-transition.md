# MIG-A4-000041 — الانتقال إلى الروضة وما قبل المدرسة

- Lane: `A4`
- Canonical key: `preschool-transition`
- Final canonical: `/content/preschool-transition`
- Claim: #121
- CMS content ID: `0c39dfaa-c01f-4028-b9aa-1278cde3caf8`
- Final status: `published`
- Branch: `migration-agent-4-child-family-education`

## Canonical / ownership decision

هذه الصفحة دليل عام للانتقال إلى الحضانة أو الروضة وما قبل المدرسة، وتركز على التهيئة، الوداع، الروتين، التواصل مع المعلم، التكيف في الأسابيع الأولى، ودور المؤسسة والأسرة.

لا تُستخدم الصفحة لتشخيص اضطراب قلق الانفصال أو أي اضطراب نفسي؛ إذا كان التشخيص النفسي هو الموضوع المركزي فالملكية A1. كذلك لا تحل الصفحة محل خطط الانتقال المتخصصة عندما تكون حالة من ذوي الاحتياجات الخاصة هي الموضوع المركزي؛ عندها تكون الملكية A3.

## Pre-claim dedupe

تم قبل إنشاء Claim البحث عن العنوان والـslug والمرادفات العربية والإنجليزية في:

- GitHub Issues: لا Claim منافس.
- `docs/MIGRATION-PROGRESS.md`: لا Canonical مطابقة للموضوع.
- Supabase `content`: لا slug/title/canonical مطابق ولا alias منافس مثبت.
- بعد النشر أُعيد الفحص: slug rows = 1، canonical rows = 1، possible alias collisions = 0.

أنشئ Claim واحد فقط: `#121`، ولم تكن هناك صفحة A4 أخرى مفتوحة أثناء التنفيذ.

## Legacy discovery and history

المصدر القديم الموضوعي المثبت:

- `khaledaltheeb/healthrenewal.org/sectors/child/guides/preschool-transition/index.html`
- Legacy URL: `/sectors/child/guides/preschool-transition/`
- العنوان القديم: «الانتقال الميسر إلى الحضانة أو الروضة».

فُحصت أيضًا إحالات المسار في فهارس وسجلات الموقع مثل `sectors/all-pages/index.html` و`sitemap.xml` و`sitemap-family-main.xml` وتقارير التغطية، ولم تثبت Canonical موضوعية أخرى مستقلة تمثل نية بحث مختلفة يجب الحفاظ عليها كصفحة منفصلة.

سجل Git للمسار يثبت تعديلات تاريخية متعددة على الملف، منها:

- `93669ccc9a33d2a6e60f5239ae44b262992447e3` بتاريخ 2026-08-06 — إضافة GTM إلى صفحات HTML.
- `1a7546c0420cbe45b9b0523f042f71b1c268a53c` بتاريخ 2026-08-04 — تطبيع shell للمنصة.
- `70d6a45e53e681589d5e7a39a3d93a315caf34ee` بتاريخ 2026-08-04 — تطبيع الهوية/العلامة.
- `c1dfe00c73ad37cf9982e11bebd420dd4613f976` بتاريخ 2026-08-03 — اعتماد هوية منصة روافد على الموقع.

هذه التعديلات كانت في معظمها طبقات واجهة/هوية وتشغيل وليست Canonicals معرفية مختلفة، ولذلك لم تُعامل كصفحات منفصلة.

### Legacy exclusions

الصفحة القديمة احتوت قالبًا واسعًا وغير مخصص بالكامل للموضوع، مع shell وGTM وCSS/JS، تنبيهات عامة متكررة، عبارات مراجعة داخلية، إطار وظيفي عام يمكن إسقاطه على موضوعات كثيرة، وتحذيرات أوسع من الحاجة الفعلية. لم يُنسخ HTML أو القالب أو تلك الملاحظات إلى CMS الجديد.

### Redirect decision

تم إنشاء Redirect موثق وفعّال:

`/sectors/child/guides/preschool-transition/` → `/content/preschool-transition` — **301 active**.

## Rebuild / editorial decisions

أعيد بناء الصفحة من الصفر حول نية المستخدم الفعلية. تشمل النسخة الجديدة:

- معنى الانتقال الميسر بوصفه عملية مشتركة لا اختبارًا للطفل.
- الاستعداد للروضة بوصفه أوسع من الحروف والأرقام.
- زيارة المكان أو التعرف إليه بالصور قبل البداية.
- تجنب الوعود غير الواقعية.
- روتين النوم والصباح قبل اليوم الأول.
- الاستقلال المناسب للعمر دون تحويله إلى اختبار.
- تبادل المعلومات المفيدة بين الأسرة والروضة.
- دعم اللغة المنزلية والأسر متعددة اللغات.
- طقس وداع قصير وواضح وعدم الاختفاء سرًا.
- التعامل مع البكاء في الأيام الأولى دون افتراض مرض أو فشل.
- قصة انتقال بصرية وتسلسل يومي متوقع.
- بناء علاقة مع بالغ موثوق في الروضة.
- فرص صغيرة للصداقة والاندماج واللعب.
- التعامل مع الطفل بعد العودة إلى المنزل والتكيف غير الخطي.
- تحليل رفض الذهاب بدل العقاب التلقائي.
- مسؤولية الروضة في جعل الانتقال أسهل.
- نقل المعرفة عند الانتقال من برنامج سابق.
- فصل الدعم العام عن الخطط المتخصصة A3 وعن التشخيص النفسي A1.
- خطة عملية للأسبوع الأول ومؤشرات متابعة غير تشخيصية.
- الأخطاء الشائعة، متى تعاد مراجعة الخطة، وقائمة تحقق قبل أول يوم.
- 10 FAQ تخدم نوايا البحث الفعلية.

## Evidence / sources

اعتمد الإثراء على ثمانية مصادر مؤسسية/مهنية موثوقة:

1. UNICEF — How to prepare your child for preschool.
2. Head Start — Transition to Kindergarten.
3. Head Start — Transition to Kindergarten: Engaging Families.
4. Head Start — Educator Practices to Support Successful Transitions to Kindergarten.
5. Head Start — School Readiness.
6. American Academy of Pediatrics / HealthyChildren — Is Your Preschooler Ready for Kindergarten?
7. NAEYC — The Preschool-to-Kindergarten Transition.
8. Head Start — Healthy Transitions to Kindergarten.

رُوعيت حدود الدليل: لا ادعاء بأن خطوات الانتقال تمنع القلق أو تضمن التكيف، ولا تحويل البكاء أو رفض الذهاب وحده إلى تشخيص.

## SEO / E-E-A-T

- SEO title: `الانتقال إلى الروضة: دليل عملي للأسرة | روافد` — 45 حرفًا.
- Meta description: 159 حرفًا.
- Primary keyword: `الانتقال إلى الروضة`.
- Search aliases تشمل: الاستعداد للروضة، دخول الحضانة، دخول رياض الأطفال، تهيئة الطفل للروضة، preschool transition، transition to preschool، kindergarten transition، school readiness transition.
- Search intent: informational.
- Visible author: `فريق تحرير منصة روافد`.
- Reviewer label: `فريق المراجعة العلمية والتحريرية في روافد` دون ادعاء اسم مختص فردي غير مثبت.
- References JSON: 8.
- Robots: index/follow.
- Featured image: none؛ Alt غير منطبق حتى توجد صورة فعلية.
- Canonical rows after publish: 1.

## Taxonomy

- Sector: A4 / child-family-school sector.
- Primary category: `parenting-family` — التربية والوالدية والأسرة.
- Tags: 5 — school, parenting, family, learning, child-development.

## Internal links

خمسة روابط داخلية، وكل أهدافها تحققت بحالة `published`:

- `/content/school-family-partnership`
- `/content/emotion-coaching`
- `/content/child-sleep`
- `/content/friendships`
- `/content/when-child-needs-help`

## Workflow

أغلقت الصفحة بالتسلسل:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

تم تسجيل Snapshot وAudit Event لكل مرحلة، واجتازت قيود Release Gate الخاصة بعنوان SEO والوصف وPrimary Keyword والمؤلف والمراجع.

## Final QA

- Status: `published`
- Approx searchable words: `2558`
- Structured blocks: `72`
- H1: `1` عبر عنوان الصفحة
- H2: `27`
- H3: `3`
- FAQ: `10`
- References: `8`
- Internal links: `5/5` إلى أهداف منشورة
- Tags: `5`
- Primary category relations: `1`
- Slug rows: `1`
- Canonical rows: `1`
- Possible alias collisions: `0`
- Content versions: `7`
- Audit events: `7`
- Redirects: `1` — predecessor موثق، 301 active
- Forbidden TODO/FIXME/QA/agent/internal markers: `0`
- Featured image: none; Alt N/A
- SEO title length: `45`
- Meta description length: `159`

## Files not modified

- `main`: لم يُعدّل.
- `docs/MIGRATION-PROGRESS.md`: لم يُعدّل؛ تحديث السجل المركزي مسؤولية C0.
