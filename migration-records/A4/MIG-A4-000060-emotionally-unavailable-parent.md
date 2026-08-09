# MIG-A4-000060 — الوالد غير المتاح عاطفيًا

- **Agent:** A4 — الطفل والأسرة والمدرسة
- **Claim:** #173
- **Canonical key / slug:** `emotionally-unavailable-parent`
- **Canonical:** `/content/emotionally-unavailable-parent`
- **Legacy source:** `/quick-info/emotionally-unavailable-parent/` (`quick-info/emotionally-unavailable-parent/index.html` in `khaledaltheeb/healthrenewal.org`)
- **Final status:** Published / QA PASS

## Scope decision

هذه الصفحة مورد أسري/والدي عملي عن محدودية أو عدم ثبات الاستجابة العاطفية للطفل أو المراهق، وليست تشخيصًا نفسيًا للوالد. تم فصلها عن Canonical `/content/emotional-safety`: الأخيرة تتناول المناخ الأسري العام، بينما هذه الصفحة تتناول سلوك الوالد واستجابته وإصلاح العلاقة. لم يثبت تعارض مع Claim أو Canonical أو alias في Issues أو MIGRATION-PROGRESS أو Supabase قبل فتح Claim.

## Legacy audit

تم فحص الصفحة التاريخية الحالية وسجل المسار في `khaledaltheeb/healthrenewal.org`. استُبعد قالب Quick Info وطبقات المنصة/التحليلات والملاحظات التشغيلية وأي صياغات عامة غير مسندة. لم تُعامل عبارة «الوالد غير المتاح عاطفيًا» كتشخيص رسمي، وأعيد بناء المحتوى من الصفر حول الرعاية المستجيبة، الاستماع، الحدود، الإصلاح، رفاه مقدم الرعاية، خصوصية المراهق، ودور المدرسة عند تأثر الوظائف اليومية.

## Evidence base

1. WHO — Promoting healthy growth and development
2. WHO — Nurturing care for early childhood development
3. WHO — Improving early childhood development: WHO guideline
4. UNICEF — Care for Child Development
5. UNICEF — Caring for the Caregiver
6. UNICEF — Support for parenting
7. CDC — Tips for Active Listening
8. CDC — Conversation Tips for Connecting Conversations

## Internal links

تم التحقق من أن الأهداف التالية منشورة قبل النشر: `/content/active-listening`, `/content/healthy-boundaries`, `/content/emotional-safety`, `/content/family-emotional-language`, `/content/teen-privacy-vs-withdrawal`, `/content/school-family-partnership`, `/content/family-help-seeking`.

## SEO / E-E-A-T / accessibility

- SEO title: 44 chars
- Meta description: 158 chars
- Search intent: informational
- Primary keyword: `الوالد غير المتاح عاطفيًا`
- Canonical واحد فقط
- Featured image: `https://healthrenewal.org/assets/quick-info/cards/emotionally-unavailable-parent.png`
- Alt: `رسم توضيحي لوالد وطفل في حوار هادئ يعبر عن الاستماع والتوفر العاطفي داخل الأسرة`
- 8 official references in `references_json`
- Reviewer/author metadata and educational disclaimer populated

## Final QA

- Arabic searchable tokens/words: **2357**
- Content blocks: **73**
- H1: **1** via page title
- H2: **21**
- H3 / FAQ: **10**
- Official references: **8**
- Internal links: **7**, all targets published
- Tags: **5**
- Content versions: **7**
- Audit events: **7**
- TODO/FIXME/QA/MIGRATION/agent/internal instructions in public body: **0**
- Status path documented: `draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

## Redirect

`/quick-info/emotionally-unavailable-parent/` → `/content/emotionally-unavailable-parent` — **301 active**.

## Constraints respected

No changes were made to `main` or `docs/MIGRATION-PROGRESS.md`. All repository documentation for this page was written only to `migration-agent-4-child-family-education`.