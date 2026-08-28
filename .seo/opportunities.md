# SEO opportunity queue

These are review/commissioning opportunities only. The SEO automation must not auto-publish a new editorial page from this file.

## Technical provenance

- Introduce an explicit substantive editorial modification timestamp/event distinct from database `updated_at`, migration timestamps and review timestamps. Use it only after governance is defined to power JSON-LD `dateModified`, Open Graph article modification time and sitemap `lastmod`.
- Audit remaining route-specific uses of `dateModified` and generated-sitemap timestamps. Never mass-replace dates without verifying what each field means.
- Batch 003 confirmed that `app/content/[slug]/page.tsx` still maps technical `updated_at` to structured-data `dateModified`; fix this conservatively after the parent batch releases and only restore modification dates from explicit substantive-change provenance.
- Batch 003 confirmed that the generic `/content/` schema can publish the generic site SEO card as an article/page image when a record has no featured image. Remove the schema image fallback unless an image genuinely represents that page.
- Keep canonical ownership by published URL namespace and prevent taxonomy/content sitemap duplication.

## Cannibalization

- Site-wide exact primary-query duplicate queue currently contains 87 groups / 179 rows. Review by page role, intent, entity scope and hub/spoke relationship before changing targeting. Do not solve these mechanically by noindex, redirects, title swapping or deletion.
- Batch 001 known case: `/addiction/populations/older-adults/` versus `/encyclopedia/concept-1075/` for `اضطرابات استخدام المواد لدى كبار السن`; differentiate population-treatment guidance versus encyclopedic definition after editorial review.
- Batch 002 has no exact primary-query collision.
- Batch 003 exact collision: `/content/appraise-clinical-guideline` versus `/library/evidence-literacy/appraise-clinical-guideline/`, both targeting `تقييم الإرشادات السريرية`. Compare actual page scope and assign one comprehensive-guide intent and one library/pathway intent; use truthful metadata and contextual internal anchors, not noindex/delete/redirect automation.

## Editorial validation candidates

Validate real demand and existing-site coverage with Search Console/SERP evidence before commissioning anything new:

- Comparative synthesis across existing ADHD evidence pages: physical activity, school social-skills interventions, screen exposure and technology-based executive-function interventions.
- Autism caregiver evidence synthesis: adjustment after diagnosis, ACT, resilience, sleep/family burden and social determinants such as food insecurity.
- Accessibility and mental-health evidence across deaf/hard-of-hearing, visual impairment, cerebral palsy and intellectual disability populations.
- Neurodevelopmental function synthesis across sleep, exercise, executive function, motor outcomes and digital/video-game interventions.
- Digital mental-health evidence map across stress, adolescent sensing, stigma interventions, eating disorders and young people with cancer.
- Batch 003: evidence-literacy journey across `قراءة الدليل الصحي`, `قراءة المراجعة المنهجية`, `يقين الدليل`, `تقييم الإرشادات السريرية` and `تصاميم الدراسات`, primarily as stronger contextual linking/hub navigation rather than automatically creating a new page.
- Batch 003: youth digital-mental-health navigation that clearly separates anxiety/depression, grief, self-harm/suicide prevention and chronic-pain comorbidity.
- Batch 003: autism-caregiver evidence navigation across MBSR, ACT, reflective functioning, caregiver-mediated play and low-resource parent programs, preserving each study page as a distinct evidence spoke.
- Batch 003: ADHD evidence navigation across sleep, exercise/executive function, neurofeedback and medication comparison.
- Batch 003: cognitive-foundations cross-linking across `الانتباه`, `الإدراك`, `الذاكرة`, `الذاكرة العاملة`, `الوظائف التنفيذية` and `اللغة`, only where visible definitions support the semantic relation.

Any candidate requires content-gap validation, source research and normal editorial/scientific workflow. SEO automation records the opportunity only.
