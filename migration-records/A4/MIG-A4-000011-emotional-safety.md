# MIG-A4-000011 — الأمان النفسي داخل الأسرة

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #51
- Status: COMPLETED
- Canonical: `/content/emotional-safety`
- Legacy slug: `emotional-safety`
- Final title: `الأمان النفسي داخل الأسرة: دليل عملي لبناء الثقة والاحترام`
- Final CMS status: `published`
- Supabase content id: `7426c516-52c5-46ca-a9a5-bc62d1763c03`

## Pre-claim collision checks
تم البحث قبل Claim في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase عن slug والمرادفات العربية والإنجليزية. لم يظهر Claim أو Canonical أو alias أو redirect منافس. أُنشئ Claim واحد فقط #51.

## Legacy audit
المصدر المؤكد: `content/sectors-v10/family.json`، وفيه بذرة قصيرة بعنوان «الأمان النفسي داخل الأسرة» حول منع الإهانة والتهديد، الاستماع، الاعتراف بالمشاعر وطلب التوقف المؤقت. تم فحص ملف القطاع الحالي؛ لا يوجد route عام موثق مستقل للslug، لذلك لم يُنشأ Redirect تخميني.

## Rebuild
أعيد بناء الصفحة من الصفر لتغطي تعريف الأمان النفسي، الفرق بين الأمان والموافقة، الخلاف دون إهانة، التوقف المؤقت، الاستماع قبل الحل، السرية والسلامة، الخصوصية حسب العمر، الاعتذار والإصلاح، الخطأ والكذب، أثر خلاف الوالدين، الاجتماعات الأسرية، احتياجات الصغار والمراهقين، الأخبار والقرارات العائلية، مؤشرات الخطر، ومتى لا تكفي مهارات التواصل.

## Evidence base
8 مراجع: WHO Parenting Guidelines (الصفحة + المنشور الرسمي)، UNICEF Mental Health and Well-being، UNICEF How to Talk to Kids about Mental Health، UNICEF Protect Family Mental Health، AAP Improving Family Communications، AAP Everyday Ways to Talk About Mental Health، AAP Helping Little People Manage Big Feelings.

## SEO / E-E-A-T
- Primary keyword: `الأمان النفسي داخل الأسرة`
- SEO title: 36 chars
- Meta: 154 chars
- Canonical matches: 1
- Author/reviewer/last reviewed/references/schema: present
- Robots: index/follow

## Final QA
- Published
- **1584** useful Arabic body tokens
- **56** structured blocks
- H1 body: 0; renderer title = sole H1
- H2: **20**
- H3: **4**
- FAQ: **10**
- References: **8**
- Tags: **5**
- Canonical matches: **1**
- Internal markers: **0**
- Malformed headings: **0**
- Versions: **8**
- Audit events: **8**
- Redirects: 0 — no verified legacy public route

Initial post-publication QA blocked closure at 1447 tokens and one malformed H3. The page was deepened with a useful section on difficult family news/decisions, hierarchy was corrected, and the correction was versioned/audited before closure.

## Repository scope
Committed only to `migration-agent-4-child-family-education`. No changes to `main` or `docs/MIGRATION-PROGRESS.md`.