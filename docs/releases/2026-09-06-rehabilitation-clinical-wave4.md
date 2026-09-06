# Rehabilitation clinical expansion — wave 4 release record

Release date: 2026-09-06
Sector: `rehabilitation-functioning`
Production: https://healthrenewal.org

## Summary

Wave 4 closes four durable clinical rehabilitation gaps that were not covered by existing reference pathways:

1. rehabilitation after amputation and limb loss;
2. Parkinson disease rehabilitation;
3. rehabilitation after critical illness / intensive care;
4. cancer rehabilitation across the oncology continuum.

The pages were created as original Arabic evidence syntheses and released through `private.content_release_gate_v6`. None of the pages reproduces protected assessment instruments or proprietary clinical forms.

## Released pages

| Slug | Category | Arabic words | Central source links |
| --- | --- | ---: | ---: |
| `amputation-limb-loss-rehabilitation-guide` | musculoskeletal rehabilitation | 3,022 | 7 |
| `parkinson-disease-rehabilitation-guide` | neurological rehabilitation | 2,656 | 7 |
| `post-icu-critical-illness-rehabilitation-guide` | cardiopulmonary rehabilitation | 2,636 | 6 |
| `cancer-rehabilitation-guide` | cancer rehabilitation | 2,689 | 7 |

All four pages are published, indexable, assigned to the intended rehabilitation category, and linked to the central source registry.

## Evidence anchors

### Amputation and limb loss
- AAPM&R / PM&R KnowledgeNow amputation and prosthetics resources;
- VA/DoD rehabilitation guidance for lower-limb amputation;
- WHO assistive technology, wheelchair, prosthetics and orthotics service guidance;
- WHO ICF / rehabilitation framework.

### Parkinson disease
- AAPM&R Parkinson Disease Part Two: Rehabilitation Management and Treatments;
- condition-specific movement, speech/swallowing, cognition and function guidance;
- WHO rehabilitation / ICF framework.

### Critical illness / post-ICU rehabilitation
- NICE `Rehabilitation after critical illness in adults (CG83)`;
- critical-care rehabilitation principles covering physical, cognitive and psychological consequences;
- WHO rehabilitation / ICF framework.

### Cancer rehabilitation
- AAPM&R cancer rehabilitation and functional-measure resources;
- ASCO exercise guidance during active cancer treatment;
- oncology survivorship/supportive-care evidence as appropriate;
- WHO rehabilitation / ICF framework.

## Editorial boundaries

### Cancer exercise
The cancer page does not publish a universal exercise prescription or fixed laboratory thresholds. Exercise dose and precautions must be individualized according to cancer type, treatment, symptoms, bone involvement, blood counts, cardiopulmonary status, neuropathy, infection risk and the oncology plan. ASCO supports aerobic and resistance exercise during active treatment for appropriate adults, but the guideline does not establish one universal frequency/intensity/duration prescription for all patients.

### Parkinson disease
The page separates mobility/freezing/falls, communication and swallowing, cognition and daily function, and symptom/medication timing. Rehabilitation recommendations are tied to function and participation rather than presented as a substitute for neurological management.

### Post-ICU rehabilitation
The page treats post-intensive-care problems as multidomain: physical weakness and endurance, respiratory and swallowing issues, cognition, sleep and mental health, family burden and return to work/community. It does not reduce recovery to strength training alone.

### Amputation
The page distinguishes the rehabilitation journey after limb loss from device-service content. Prosthetic fitting, residual-limb health, pain, mobility, skin, work, maintenance and long-term follow-up are handled as an integrated pathway rather than a product catalogue.

## V6 correction log

Three pages initially remained in draft because of release-contract boundaries rather than evidence defects:

- Parkinson disease was below the 2,500-Arabic-word minimum and its branded SEO title/description exceeded or missed the exact contract range.
- Post-ICU rehabilitation was below the 2,500-word minimum and needed compliant SEO metadata.
- Cancer rehabilitation met the editorial-depth contract but its meta description was one character below the 150-character minimum.

The missing functional content and SEO metadata were corrected. The release gate was not disabled, bypassed or weakened.

## Production impact

After wave 4 the rehabilitation sector contains **91 unique published/indexable pages**.

## Repository representation

This release record documents production content. Editorial bodies remain in the production `public.content` store rather than being duplicated in repository migrations.

A companion idempotent assertion migration should verify:

- all four pages are published/indexable;
- each is linked to its intended category;
- every page has at least five central source links;
- no editorial body is seeded or overwritten.