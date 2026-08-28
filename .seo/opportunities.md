# SEO opportunity queue

These are review/commissioning opportunities only. The SEO automation must not auto-publish a new editorial page from this file.

## Technical provenance

- Introduce an explicit substantive editorial modification timestamp/event distinct from database `updated_at`, migration timestamps and review timestamps. Use it only after governance is defined to power JSON-LD `dateModified`, Open Graph article modification time and sitemap `lastmod`.
- Audit remaining route-specific uses of `dateModified` and generated-sitemap timestamps. Never mass-replace dates without verifying what each field means.
- Keep canonical ownership by published URL namespace and prevent taxonomy/content sitemap duplication.

## Cannibalization

- Site-wide exact primary-query duplicate queue currently contains 87 groups / 179 rows. Review by page role, intent, entity scope and hub/spoke relationship before changing targeting. Do not solve these mechanically by noindex, redirects, title swapping or deletion.
- Batch 001 known case: `/addiction/populations/older-adults/` versus `/encyclopedia/concept-1075/` for `اضطرابات استخدام المواد لدى كبار السن`; differentiate population-treatment guidance versus encyclopedic definition after editorial review.
- Batch 002 has no exact primary-query collision.

## Editorial validation candidates

Validate real demand and existing-site coverage with Search Console/SERP evidence before commissioning anything new:

- Comparative synthesis across existing ADHD evidence pages: physical activity, school social-skills interventions, screen exposure and technology-based executive-function interventions.
- Autism caregiver evidence synthesis: adjustment after diagnosis, ACT, resilience, sleep/family burden and social determinants such as food insecurity.
- Accessibility and mental-health evidence across deaf/hard-of-hearing, visual impairment, cerebral palsy and intellectual disability populations.
- Neurodevelopmental function synthesis across sleep, exercise, executive function, motor outcomes and digital/video-game interventions.
- Digital mental-health evidence map across stress, adolescent sensing, stigma interventions, eating disorders and young people with cancer.

Any candidate requires content-gap validation, source research and normal editorial/scientific workflow. SEO automation records the opportunity only.
