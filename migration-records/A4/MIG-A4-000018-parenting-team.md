# MIG-A4-000018 — التعاون بين الوالدين ومقدمي الرعاية

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #63
- Status: COMPLETED
- Canonical: `/content/parenting-team`
- Legacy slug: `parenting-team`
- Final title: `التعاون بين الوالدين ومقدمي الرعاية: كيف نبني فريقًا تربويًا متسقًا`
- CMS status: `published`
- Supabase id: `a68ebef5-e720-4efd-8791-f677a741ca87`

## Collision / canonical decision
قبل إنشاء Claim جرى البحث في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase عن `parenting-team` والعنوان والمرادفات العربية والإنجليزية. لم يوجد Canonical منافس. ظهر `/content/co-parenting-after-separation` لكنه منفصل دلاليًا: يعالج الأبوة المشتركة بعد الانفصال/الطلاق، بينما هذه الصفحة تعالج التنسيق العام بين الوالدين ومقدمي الرعاية في ترتيبات الأسرة المختلفة. أنشئ Claim واحد فقط (#63) بعد تثبيت هذا الحد.

## Legacy audit
المصدر المباشر هو `content/sectors-v10/family.json` وفيه بذرة `parenting-team` حول تقليل الرسائل المتناقضة، الاتفاق على أولويات مشتركة، مناقشة القواعد بعيدًا عن الطفل، والسماح باختلاف الأسلوب غير المؤذي. فحص البحث البرمجي كشف طبقة مشتقة/مولدة في `scripts/family_sector_content_v249.py` تستخدم `parenting-team` داخل profile عام؛ عوملت كطبقة توليد ومادة مساعدة للفهم لا كنص صالح للنشر. لم يثبت وجود route عام قديم مستقل لهذا الموضوع، لذلك لم يُنشأ Redirect تخميني.

## Rebuild
أعيد بناء الصفحة من الصفر. تغطي: معنى فريق التربية، الاتساق وقابلية التوقع، تحديد ثلاث أولويات، الفرق بين القاعدة وأسلوب تطبيقها، إدارة خلاف الكبار بعيدًا عن الطفل، منع استخدام الطفل رسولًا، اللغة المشتركة للقواعد، حدود السلامة، الروتين، العواقب المنطقية، السلوك الذي يمكن تجاهله، المديح المحدد، اختلاف القواعد بين مقدمي الرعاية، دور الأجداد والمربية، منع التنافس على حب الطفل، اجتماع تنسيق قصير للبالغين، اختلاف القيم، التعاون مع المدرسة، فروق العمر والمزاج، إصلاح خطأ البالغ، أثر الإرهاق، حدود السلامة، متى نطلب دعمًا، وخطة تطبيق من سبع خطوات.

## Evidence
المراجع الأساسية 8، من مصادر رسمية/مؤسسية:
1. CDC — Tips for Creating Rules.
2. CDC — Tips for Building Structure.
3. CDC — Essentials for Parenting Toddlers and Preschoolers.
4. CDC — Tips for Using Ignoring.
5. WHO — Guidelines on parenting interventions.
6. WHO — Parenting guideline publication (2023).
7. UNICEF — Care for Child Development.
8. UNICEF — Support for parenting.

## SEO / E-E-A-T
- SEO title فريد.
- Meta description: 151 حرفًا.
- Primary keyword: `التعاون بين الوالدين ومقدمي الرعاية`.
- Search aliases عربية وإنجليزية.
- Article schema مع `mainEntityOfPage` الصحيح.
- author: فريق تحرير منصة روافد.
- reviewer label: مراجعة تحريرية وعلمية — منصة روافد؛ بيانات الاعتماد تصف مراجعة المصادر ولا تدعي هوية سريرية فردية.
- Canonical واحد فقط.
- 4 روابط داخلية إلى صفحات روافد ذات صلة.
- لا صورة بارزة في هذه النسخة؛ Alt غير منطبق حتى إضافة أصل بصري فعلي.
- Release Gate صنّف الصفحة YMYL وطلب تنبيهًا؛ أضيف تنبيه تثقيفي واحد قصير بدل تحذيرات متكررة.

## Final QA
- CMS status: **published**
- useful body tokens: **1552**
- blocks: **80**
- body H1: **0**؛ الـrenderer يوفر H1 واحدًا من العنوان
- H2: **28**
- H3: **7**
- FAQ: **10**
- references: **8**
- internal links: **4**
- tags: **5**
- primary category relation: **1**
- canonical matches: **1**
- redirects: **0** — لا يوجد route legacy عام موثق
- versions: **7**
- audit events: **7**
- internal TODO/FIXME/QA/agent markers: **0**
- featured image: none; Alt N/A

## Workflow
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

## Repository scope
التوثيق على `migration-agent-4-child-family-education` فقط. لم يتم تعديل `main` أو `docs/MIGRATION-PROGRESS.md`.