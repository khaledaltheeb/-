# MIG-A4-000005 — تدريب الطفل على فهم مشاعره

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #36
- Status: COMPLETED
- Canonical: `/content/emotion-coaching`
- Legacy slug: `emotion-coaching`
- Final title: `تدريب الطفل على فهم مشاعره: دليل عملي للأسرة والمدرسة`
- Final CMS status: `published`
- Supabase content id: `46e18382-7438-4023-ae0f-c658884508e2`

## Pre-claim collision checks

قبل إنشاء الـClaim تم البحث عن `emotion-coaching` و`emotional coaching` و«تدريب الطفل على فهم مشاعره» و«تنظيم مشاعر الطفل» و«التدريب على المشاعر» في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase. لم يوجد Claim منافس ولا Canonical/slug/search alias مطابق. أُنشئ Claim واحد فقط: #36.

الموضوع ضمن A4 لأنه مهارة والدية/تربوية عامة لدعم النمو الانفعالي في الأسرة والمدرسة، وليس تشخيصًا نفسيًا بحتًا يحال إلى A1 ولا حالة ذوي احتياجات خاصة مركزية تحال إلى A3.

## Legacy audit and history

تم فحص الـCluster الحالي والتاريخي في `khaledaltheeb/healthrenewal.org`:

1. `content/sectors-v10/child.json` — السجل الأساسي بعنوان «تدريب الطفل على فهم مشاعره»، وكان مجرد بذرة قصيرة: ملخص، ثلاث إشارات، أربع خطوات، عبارتان، وتنبيه واحد. تاريخ هذا المسار أظهر إدخاله في commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20، ولم تظهر طبقة تاريخية أقدم لهذا الملف قبل إدخاله.
2. `content/v24/daily-tools-v100/06-family.json` — أداة تطبيقية منفصلة `emotion-coaching-script` بعنوان «نص مرافقة شعور الطفل»، وفيها أربع خطوات قصيرة للملاحظة والتسمية والحد السلوكي والاختيار. تاريخ الملف يرجع إلى نشر حزمة الأدوات في commit `45ac516ab54eceffd5b1c2db6b7716f3603daeb8` بتاريخ 2026-07-28. اعتُبرت الأداة مادة تطبيقية داخل الـCluster وليست Canonical موضوعيًا منافسًا.

تم البحث عن مسارات عامة مؤكدة مثل `sectors/child/emotion-coaching` وأشكال `emotion-coaching/` ولم يظهر URL قديم مستقل موثق في المستودع. لذلك **لم يُنشأ Redirect تخميني**؛ سياسة الترحيل تمنع اختراع مسارات قديمة من slug أو generator arithmetic.

## Rebuild

أعيد بناء الصفحة من الصفر. لم يُنقل النص القديم حرفيًا. الصفحة النهائية تشرح: معنى التدريب على المشاعر وحدوده، لماذا يصعب على الطفل تسمية شعوره، تنظيم استجابة البالغ، الملاحظة قبل التفسير، توسيع قاموس المشاعر، ربط الشعور بإشارات الجسد دون اختزال الأعراض الجسدية، قبول الشعور مع بقاء حدود السلوك، الانتقال إلى الحل بعد الهدوء، التعامل مع ذروة الانفعال، عبارات عملية، التدريب في الأوقات الهادئة، الفروق العمرية، دور المدرسة والمعلم، الأخطاء الشائعة، مؤشرات التقدم، متى لا يكفي الدعم المنزلي، وخطة أسبوعية بسيطة للأسرة.

حُذفت الصياغات السطحية والقالب المختصر، وأي حشو أو ملاحظات تشغيلية أو TODO/QA/تعليمات وكلاء. لا توجد صورة تحريرية في الصفحة؛ لذلك لا يوجد أصل بصري بلا Alt.

## Evidence base

المراجع المثبتة في `references_json` وعددها 8:

1. American Academy of Pediatrics / HealthyChildren.org — Helping Little People Manage Big Feelings — https://www.healthychildren.org/English/family-life/family-dynamics/Pages/helping-little-people-manage-big-feelings.aspx
2. American Academy of Pediatrics / HealthyChildren.org — Healthy Mental & Emotional Development — https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/healthy-mental-and-emotional-development-in-children-key-building-blocks.aspx
3. CDC — Child Development — https://www.cdc.gov/child-development/about/index.html
4. CDC — About Children's Mental Health — https://www.cdc.gov/children-mental-health/about/index.html
5. UNICEF Parenting — Mental health explained — https://www.unicef.org/parenting/mental-health/explained
6. UNICEF Parenting — How to talk to your kids about mental health — https://www.unicef.org/parenting/mental-health/how-to-talk-to-kids-mental-health
7. WHO — Parenting interventions guideline — https://www.who.int/teams/social-determinants-of-health/violence-prevention/parenting-guidelines
8. WHO — Psychosocial interventions for child mental-health promotion — https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme/evidence-centre/child-and-adolescent-mental-disorders/psychosocial-interventions-for--promotion-of-mention-health-and--prevention-of-mental-health-conditions-in--children

## SEO / E-E-A-T

- Primary keyword: `تدريب الطفل على فهم مشاعره`
- Search intent: `informational`
- SEO title: `تدريب الطفل على فهم مشاعره: دليل عملي` — 37 chars
- Meta description: 154 chars
- Canonical count: 1
- Robots: index/follow
- Visible author: فريق تحرير منصة روافد
- Scientific/editorial reviewer metadata: present
- Last reviewed: 2026-08-08
- References: 8
- Search aliases: Arabic + English synonyms stored
- Schema: Article JSON-LD stored

## Structure and final QA

Final database QA after publication and body-text normalization:

- Content status: `published`
- Useful Arabic body tokens: **1905**
- Structured blocks: **47**
- Body H1 blocks: **0**; renderer title is the sole page H1
- H2: **14**
- H3: **5**
- FAQ items: **10**
- Resource blocks: **11** — 8 external evidence resources + 3 internal links
- References: **8**
- Tags: **5**
- Primary category relations: **1**
- Internal links: `/content/discipline-vs-punishment`, `/content/bullying`, `/content/school-attendance-distress`
- Canonical matches: **1** exactly
- Internal TODO/FIXME/QA/agent markers: **0**
- Content versions: **9**
- Audit events: **9**
- Active redirects to canonical: **0**, intentionally, because no verified public legacy route was found

## Workflow

The CMS page passed the release workflow in sequence:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

Two earlier SQL attempts failed inside transactions while constructing `body_text`; both transactions rolled back completely, and a duplicate check confirmed zero `emotion-coaching` rows before the successful transaction. After publication, `body_text` was normalized to remove internal Markdown heading markers and the hierarchy was refined so the five procedural steps are H3 children under a dedicated H2. Those corrections were versioned and audited; no untracked partial row remains.

## Redirect decision

No redirect was created. A redirect from an inferred route would violate the runbook because no verified legacy public route for this topic was found. The short `emotion-coaching-script` daily tool is related material, not a duplicate public canonical route to be redirected blindly.

## Repository scope

This record is committed only to branch `migration-agent-4-child-family-education`. No change was made to `main` or to `docs/MIGRATION-PROGRESS.md`.