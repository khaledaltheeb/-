# ABI + Inclusive Education Systems foundation wave — release record

Date: 2026-09-11
Production: https://healthrenewal.org

## Scope

This wave fixes the public section-bundle privilege boundary, establishes two specialist knowledge-center sections without adding new top-level sectors, adds terminology governance, enriches existing editorial hubs with referred sources, creates a deduplicated expansion backlog, and releases one new gold-standard guide in each specialist center.

## Corrective work completed

### Public section aggregation

`public.get_public_section_bundle(uuid, integer, integer, text)` was changed from `SECURITY DEFINER` to `SECURITY INVOKER`. Generic `PUBLIC` execute was revoked and execute was granted only to `anon`, `authenticated`, and `service_role`. The public tables already have RLS/select policies, so the function now respects the caller's row-security boundary.

Post-change anonymous-role verification succeeded. `neurological-rehabilitation` currently resolves 28 published/indexable linked items; the earlier 7-item observation was a stale snapshot rather than a production-data loss.

### Indexability integrity

Post-release production check:
- published content: 8,736 records;
- published `robots_index=false`: 0;
- published content with missing/blank canonical URL: 0.

### Terminology cleanup and governance

A private `private.terminology_governance` registry was created for controlled Arabic/English terminology. Seed terms include Psychologist, Clinical Psychologist, Neuropsychologist, Psychiatrist, Rehabilitation, Physiatrist, Acquired Brain Injury, Traumatic Brain Injury, and Stroke.

The registry explicitly prevents the clinically important confusion of `Psychologist` with `طبيب نفسي` and separates it from `Psychiatrist` (`طبيب اختصاصي في الطب النفسي`). Specialist-review-recommended status is used where external specialist confirmation is still desirable; no false specialist verification is recorded.

One legacy rare-disease sentence containing raw English `psychologist / social worker / peer group / psychiatric care` was normalized to precise Arabic. A remaining raw-English `psychiatrist` occurrence in a pediatric-oncology evidence page was not force-edited because the pediatric-oncology release guard correctly rejected a stale originality/evidence release token. The guard was not bypassed or disabled; that terminology-only correction remains subject to the protected reviewed-revision workflow.

## New specialist sections

### 1. Acquired brain injury recovery

Slug: `acquired-brain-injury-recovery`

Arabic name: **إصابات الدماغ المكتسبة: الإدراك والسلوك والتعافي**

Parent: `neurological-rehabilitation`
Sector: `rehabilitation-functioning`

The section was initialized with 10 existing high-value published/indexable items using secondary category mappings only, preserving their original canonical and primary taxonomy assignments. Its editorial hub is the existing `legacy-outside-box-acquired-brain-injury` page.

Source anchors added to the hub include WHO Rehabilitation (Arabic), Headway Brain Injury Information Library, Stroke Foundation Arabic resources, and the INCOG 2.0 overview/attention/executive-function/memory guidelines. Rights metadata states that protected source materials are not to be republished verbatim.

### 2. Inclusive education practice and systems

Slug: `inclusive-education-practice-systems`

Arabic name: **الممارسة والقيادة والأنظمة في التعليم الدامج**

Parent: `inclusion-accommodations`
Sector: `special-needs-inclusion`

The section was initialized with 16 existing high-value published/indexable items using secondary category mappings. Its editorial hub is the existing `legacy-learning-path-evidence-guided-inclusive-education-foundations` page.

Source anchors added include CEC/DISES professional-learning resources, CAST UDL Guidelines 3.0 and its Arabic translation resources, UN CRPD Article 24, and UNESCO Jordan inclusion/diversity material.

## New pages released

### ABI terminology and pathway guide

Slug: `abi-vs-tbi-stroke-hypoxic-injury-guide`
Canonical: `/content/abi-vs-tbi-stroke-hypoxic-injury-guide`
Status: published/indexable

Pre-release quality metrics:
- 2,701 Arabic words;
- 16 H2 headings;
- 6 H3 headings;
- 9 FAQs;
- 9 references;
- 7 authoritative/primary references by the release-contract classification;
- 10 explicit search-intent questions;
- 8 claim-to-source mappings;
- 6 secondary keywords;
- 10 semantic terms;
- SEO title length 47;
- SEO description length 151;
- exact long-paragraph matches against the published corpus: 0;
- maximum title similarity: 0.341;
- maximum body similarity in the preflight sample: 0.420.

The page distinguishes ABI, TBI, stroke, hypoxic brain injury, PTA, cognitive domains, cognitive-communication, professional roles, family needs, and return-to-study/work/driving pathways without duplicating the existing TBI or stroke guides.

After release, anonymous section-bundle verification returns 11 visible items for `acquired-brain-injury-recovery`.

### Inclusive school leadership implementation guide

Slug: `inclusive-school-leadership-implementation`
Canonical: `/content/inclusive-school-leadership-implementation`
Status: published/indexable

Pre-release quality metrics:
- 3,262 Arabic words;
- 20 H2 headings;
- 6 H3 headings;
- 9 FAQs;
- 11 references;
- 10 explicit search-intent questions;
- 8 claim-to-source mappings;
- 7 secondary keywords;
- 11 semantic terms;
- SEO title length 46;
- SEO description length 155;
- exact long-paragraph matches against the published corpus: 0;
- maximum title similarity: 0.351;
- maximum body similarity in the preflight sample: 0.461.

The page operates at school/system level: leadership, barrier mapping, governance, UDL, assessment governance, family engagement, language/culture, accessibility and assistive technology, professional learning, implementation fidelity, quality indicators, belonging, transitions, Jordan/Arab-context boundaries, and a 90-day implementation cycle.

After release, anonymous section-bundle verification returns 17 visible items for `inclusive-education-practice-systems`.

## Expansion backlog

A controlled backlog now contains:
- 18 ABI candidate topics;
- 14 inclusive-education systems candidate topics.

All candidates must pass a live-corpus deduplication/search-intent check before authoring. The two pages released in this wave were moved through `researching -> ready -> published` only after the pre-publication similarity and exact-paragraph checks passed.

## Repository / migration synchronization

The production migrations applied in this wave are mirrored in the repository:
- `20260911120904_harden_public_section_bundle_invoker.sql`
- `20260911121613_abi_and_inclusive_systems_section_foundations.sql`
- `20260911121658_seed_specialist_section_editorial_hubs.sql`
- `20260911121857_clinical_education_terminology_governance_v1.sql`
- `20260911122106_enrich_specialist_hub_source_anchors_20260911.sql`

Production `public.content` remains the source of truth for the full editorial bodies. This release record documents the page-level publication rather than duplicating long article text into migrations.

## Remaining boundary

The pediatric-oncology terminology-only correction must go through its reviewed revision/release-token workflow. This release intentionally leaves the evidence guard intact and does not fabricate independent human-review or evidence-audit attestations.
