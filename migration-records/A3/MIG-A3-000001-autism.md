# MIG-A3-000001 — التوحد

- Status: **IN PROGRESS — SINGLE OPEN A3 PAGE**
- Lane: A3 — ذوو الاحتياجات الخاصة والدمج والتمكين
- Claim: GitHub Issue #5 — `[MIG-CLAIM][A3][autism] التوحد`
- Candidate canonical slug: `autism`
- Intended content type: `condition`
- Proposed canonical: `/content/autism`
- Sector: `special-needs-inclusion` — ذوو الاحتياجات الخاصة والدمج والتمكين
- Primary category: `autism-neurodevelopment` — التوحد والنمو العصبي
- Audience(s): الأشخاص على طيف التوحد، الأسرة، المعلمون، المختصون، مقدمو الخدمات

## Pre-claim dedupe checks

- GitHub Issues searched for: التوحد، اضطراب طيف التوحد، طيف التوحد، Autism، Autism Spectrum Disorder، ASD.
- No matching Claim existed before Issue #5 was created.
- `docs/MIGRATION-PROGRESS.md` contains no completed autism canonical.
- Supabase `public.content` was searched by slug/title/search aliases for `autism`, `autism-spectrum-disorder`, `ASD`, التوحد، طيف التوحد؛ no matching canonical/content row existed.

## Legacy cluster inspected

Primary current/legacy artifacts identified in `khaledaltheeb/healthrenewal.org`:

- `content/v302/autism-ar.json` — major scientific autism portal source; introduced in commit `df11de09b41a57f15db664c303013b1aa17c1e1e` on 2026-07-27.
- `family-guide/conditions/autism/index.html` — family-oriented canonical variant at legacy URL `/family-guide/conditions/autism/`.
- `content/v18/care-guides-autism-ar.json` — care-guide layer.
- `content/sectors-v10/autism-adhd-differences-guide.json` — related comparison page; treated as a related intent, not automatically merged as a redirect.
- autism clinical-pathway generation/publisher artifacts were found in `scripts/`; these are implementation/generation layers and not publishable prose.
- History of `family-guide/conditions/autism/index.html` was inspected. Later commits include brand normalization, platform-shell changes and GTM injection; those changes do not establish a superior scientific text version.

## Exclusions

The rebuilt canonical must not carry forward:

- GTM/GA snippets embedded in legacy HTML.
- theme/layout/CSS/JS shell fragments.
- generator instructions and publisher scripts.
- internal QA/TODO/agent instructions.
- repeated disclaimers and fear-based warnings.
- repeated definitions or generic filler.
- claims that cannot be supported by primary/authoritative references.

## Useful legacy material retained as facts/ideas

- Autism is heterogeneous; communication, sensory, adaptive and support needs vary substantially.
- Screening is not diagnosis.
- Comprehensive assessment should include developmental history and functional context, not a single score.
- AAC may be appropriate when speech alone does not meet communication needs.
- Support should be goal-based, individualised and measured in real-life function.
- Family, school, adult-life and professional pathways need separate practical guidance.
- Co-occurring health/mental-health conditions should be assessed rather than attributing every change to autism.
- Environmental adjustment and inclusion are part of support, not optional decoration.

## Authoritative source verification

Primary/current sources verified during this run:

1. World Health Organization — **Autism**, fact sheet updated 17 September 2025: `https://www.who.int/ar/news-room/fact-sheets/detail/autism-spectrum-disorders`
2. World Health Organization — Autism Q&A, 17 September 2025.
3. CDC — Autism Spectrum Disorder information and screening/signs resources.
4. NICE CG170 — Autism spectrum disorder in under 19s: support and management.
5. NICE CG142 — Autism spectrum disorder in adults: diagnosis and management.
6. ASHA — Augmentative and Alternative Communication (AAC) guidance is designated as an additional communication reference for the final page.

Key verified points include WHO's description of autism as a diverse group of conditions related to brain development; wide variability in abilities and needs; the value of evidence-based psychosocial supports; the importance of accessibility and inclusion; and the lack of evidence that childhood vaccines cause autism.

## Planned canonical content

### H1

`التوحد: الفهم والتقييم والدعم والدمج عبر مراحل الحياة`

### Planned H2/H3 structure

- ما المقصود بالتوحد؟
- الخصائص الأساسية وكيف قد تظهر
- العلامات المبكرة التي تستحق التقييم
- كيف يتم التقييم والتشخيص؟
  - التحري ليس تشخيصًا
- التوحد لدى البالغين
- الحالات المصاحبة والصحة العامة
- ما الذي يساعد؟ مبادئ الدعم المبني على الدليل
- التواصل المعزز والبديل AAC
- الدعم الحسي والتنظيم
- ما الذي يمكن للشخص نفسه فعله؟
- ما الذي تحتاجه الأسرة؟
- ما الذي يحتاجه المعلم والمدرسة؟
- ما الذي يحتاجه المختص؟
- الانتقال عبر مراحل الحياة
- الدمج والحقوق والوصول إلى الخدمات
- مفاهيم شائعة تحتاج تصحيحًا
- متى نطلب مساعدة عاجلة؟
- أسئلة شائعة
- الخلاصة

## Draft quality state

- A fresh Arabic draft was built from scratch in this run rather than copied from a legacy page.
- Draft useful-word count measured locally: **2424 Arabic-space-delimited words** before final CMS normalization.
- The draft separates guidance for the autistic person, family, teacher/school and specialist.
- The prohibited word specified for published content is not used as a label for people.
- H1 is singular; H2/H3 hierarchy is planned and present in the working draft.
- FAQ intent set includes: definition, vaccines, intellectual disability, speech delay, online tests, best support, AAC and speech, school inclusion, adult diagnosis, and first family steps.

## SEO plan

- Primary keyword/entity: `التوحد`
- Secondary: اضطراب طيف التوحد، علامات التوحد، تشخيص التوحد، دعم التوحد، التوحد عند البالغين
- Semantic: النمو العصبي، التواصل الاجتماعي، السلوكيات المتكررة، الاختلافات الحسية، AAC، التعليم الدامج، التيسيرات، الدعم الأسري
- Search intent: informational
- SEO title prepared: `التوحد: الفهم والتقييم والدعم والدمج` (within current release-gate title limit)
- Meta description prepared at the current release-gate 150–160 character contract.
- Proposed canonical: `/content/autism`
- Structured-data target: MedicalWebPage / MedicalCondition plus visible FAQ when supported by page rendering.

## Redirect decisions

Confirmed legacy canonical-like URL requiring mapping after approval:

- `/family-guide/conditions/autism/` → `/content/autism`

Other autism-related legacy paths are **not** being guessed as redirects until each relationship is verified. Comparison pages such as autism-vs-ADHD may retain separate search intent and must not be collapsed automatically.

## Supabase actions completed

Created the missing A3 taxonomy needed for the lane:

- Sector: `special-needs-inclusion` (`1882ab50-6d51-414a-aabe-1ab124009e11`)
- Category: `autism-neurodevelopment` (`9ad3d945-c3af-4b3f-a309-5fa4fc604064`)

No autism canonical existed before these actions.

## Release-gate blocker discovered

The live CMS `private.content_release_gate()` correctly requires YMYL `condition` content to have, before `approved/published`:

- valid SEO title and 150–160 character meta description,
- primary keyword and canonical,
- visible author,
- **scientific reviewer display name**,
- review date,
- at least one scientific reference,
- medical disclaimer,
- Alt text if a featured image is used.

The database currently contains **no named profile** that can honestly be assigned as the scientific reviewer. A reviewer identity will not be invented and the gate will not be bypassed by misclassifying autism as a non-YMYL content type.

## Current close status

- Discovery: PASS
- Variant/history inspection: PASS for the primary autism cluster; additional related-intent pages remain excluded from automatic redirecting
- Dedupe: PASS
- Source verification: PASS for core definition/support claims
- Rewrite: WORKING DRAFT COMPLETE, 2424 useful words before CMS normalization
- SEO/E-E-A-T fields: PREPARED
- CMS taxonomy: CREATED
- CMS content row: NOT YET PUBLISHED
- Scientific reviewer gate: **BLOCKED — no named reviewer profile available**
- Redirect map: one confirmed mapping prepared; not inserted before canonical approval
- Final QA: PENDING after CMS load/reviewer gate

A3 must continue this same page on its next run. It must not claim a second page until this canonical is fully closed.