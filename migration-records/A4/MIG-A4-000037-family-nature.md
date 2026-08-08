# MIG-A4-000037 — family-nature

- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #90
- Canonical key: `family-nature`
- Canonical URL: `/content/family-nature`
- Final title: **الطبيعة والأسرة: دليل عملي لوقت خارجي يدعم الاتصال والراحة**
- Final status: **Published**
- Supabase content id: `70cde4a3-9ea9-4794-9557-461c7a535c97`

## Preflight / dedupe
قبل البناء فُحص Claim/Canonical/slug والمرادفات العربية والإنجليزية في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase. لم توجد Canonical منافسة للموضوع. جرى الحفاظ على حد واضح بين هذه الصفحة وبين نطاق الحركة/الرياضة الأسرية: `family-nature` يملك نية الوقت الخارجي والطبيعة والاتصال الأسري، ولا يحول الصفحة إلى دليل تمرين.

أثناء التشغيل وُجدت Claims A4 متزامنة قديمة/زائدة؛ أُغلقت أولًا وفق قاعدة Claim واحد: `daily-family-rhythm` و`digital-home` و`family-emotional-language` كـduplicates، وClaim `chores-fairness` الزائد لأنه يكرر Canonical منشورة أصلًا. بعد ذلك بقي #90 وحده كصفحة العمل الحالية.

## Legacy lineage
- Verified source: `khaledaltheeb/healthrenewal.org/content/sectors-v10/home.json`
- Legacy key: `family-nature`
- Legacy title: `الطبيعة كمساحة تعافٍ عائلية`
- Legacy summary: استثمار الضوء والهواء والمساحات الخضراء لتقليل الضغط وزيادة الحضور.
- Source history: commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b`, 2026-07-20.
- `content/v15/tips-details-v15.json` was checked and did not contain an independent `family-nature` expansion.
- No independently verified public predecessor URL was found; therefore **no speculative redirect** was created.

## Rebuild decisions
أعيد بناء الصفحة من الصفر بدل تمديد النص القديم المختصر. حُذفت أي صياغة توحي بأن الطبيعة «تعالج» الاضطرابات النفسية. الصفحة تشرح الفرق بين الوقت الأسري الخارجي وبين الرياضة المنظمة، وتغطي اللعب الحر، الانتباه المشترك، الحوار، الأعمار المختلفة، المراهقين، الوصول الشامل، الحرارة والشمس، جودة الهواء، الماء والطرق والحشرات، رفض الطفل للخروج، محدودية الوقت والموارد، وخطة أسبوعية قابلة للتكرار.

أُدرجت مبادئ الوصول للأطفال ذوي القدرات المختلفة ضمن دليل عام، من دون تحويل الموضوع المركزي إلى حالة ذوي احتياجات خاصة؛ لذلك بقيت الصفحة ضمن A4 ولم تُحال إلى A3. كما أن الموضوع ليس تشخيصًا نفسيًا، فلا ينطبق A1.

## Sources used
1. American Academy of Pediatrics / HealthyChildren — Playing Outside: Why It’s Important for Kids.
2. American Academy of Pediatrics — Power of Play.
3. CDC — Outdoor Play and Safety for Children in ECE.
4. CDC — Child Activity: An Overview.
5. CDC — Health Benefits of Physical Activity for Children.
6. World Health Organization — Physical activity.
7. American Academy of Pediatrics — Sun Safety.
8. US EPA — What You Can Do to Protect Children from Environmental Risks.

Scientific wording deliberately distinguishes association/support from proven treatment effects. Safety content includes sun/heat and local air-quality guidance rather than encouraging outdoor activity regardless of conditions.

## SEO / E-E-A-T
- Primary keyword: `الطبيعة والأسرة`
- Search intent: `informational`
- Search aliases: 10 Arabic/English aliases including `وقت عائلي في الطبيعة`, `اللعب الخارجي`, `family nature`, `nature play`.
- SEO title length: 39 characters.
- Meta description length: 152 characters.
- Canonical count: 1.
- Schema: Article + Organization author/publisher + mainEntityOfPage.
- Author: `فريق تحرير منصة روافد`.
- Reviewer: `مراجعة تحريرية وعلمية — منصة روافد`.
- Review credentials describe review of AAP/CDC/WHO/US EPA sources without inventing a named clinician.
- Medical/educational disclaimer present.

## Internal linking
Five internal links were verified to published targets before final publication:
- `/content/family-rest`
- `/content/family-rituals`
- `/content/screens-child`
- `/content/family-routine-redesign`
- `/content/family-meetings`

## Final QA
- Status: `published`
- Approximate words: **2257**
- Content blocks: **78**
- H1: exactly one through page title
- H2: **14**
- H3: **14**
- FAQ: **10**
- References: **8**
- Internal links: **5**, all targets published
- Tags: **5**
- Primary categories: **1**
- Canonical rows: **1**
- Redirects to target: **0** (no verified predecessor URL)
- Content versions: **7**
- Audit events: **7**
- Forbidden internal markers/TODO/FIXME/QA/agent instructions: **0 detected**
- Featured image: none; image Alt therefore not applicable.

Workflow completed as:
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`.

Two database schema mismatches were caught before successful insertion (`search_aliases` is `text[]`; `search_intent` is constrained to enumerated values). Both failed writes were atomic, leaving no partial row. The successful row was then QA-checked before workflow advancement and again after publication.

## Governance
- No changes to `main`.
- No changes to `docs/MIGRATION-PROGRESS.md`.
- Record written only under `migration-records/A4` on `migration-agent-4-child-family-education`.
