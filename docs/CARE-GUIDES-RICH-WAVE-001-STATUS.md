# Care Guides rich expansion — Wave 001

## Purpose

This wave starts the post-migration expansion of Rawafid V3 with new, distinct Arabic care guides. It does not copy the legacy runtime or blindly multiply pages. Each candidate must serve a distinct user/search intent, map to an existing V3 sector/category, cite authoritative sources, remain draft/noindex until quality review is complete, and preserve a single canonical destination per intent.

## Current database baseline

The live Supabase content store already contains a large care-guide collection, so the database — not the older migration-status document — is the source of truth for overlap checks. Before this wave, published care-guide bodies were observed at roughly 18k–30k serialized JSON characters with at least five references per guide. Wave 001 therefore uses that corpus as a quality comparison baseline rather than treating mere record creation as publication readiness.

## Wave 001 candidates

All ten records are currently **draft + noindex** in Supabase and have passed exact slug/canonical/title/primary-keyword collision checks against published content.

| # | Canonical | V3 category | References | State |
|---|---|---|---:|---|
| 1 | `/care-guides/aac-communication-partner-training/` | التواصل المعزز والبديل AAC | 5 | draft / noindex |
| 2 | `/care-guides/assistive-technology-trial-follow-up/` | التقنيات المساعدة | 5 | draft / noindex |
| 3 | `/care-guides/accessible-dental-visit-disability/` | الوصول للرعاية الصحية | 5 | draft / noindex |
| 4 | `/care-guides/supported-decision-making-disability/` | المناصرة الذاتية والاختيار والموافقة | 5 | draft / noindex |
| 5 | `/care-guides/pediatric-to-adult-healthcare-transition/` | الانتقال إلى الرشد | 5 | draft / noindex |
| 6 | `/care-guides/school-accommodation-trial-review/` | التسهيلات والتكييفات المدرسية | 5 | draft / noindex |
| 7 | `/care-guides/inclusive-school-field-trip-plan/` | التعليم الدامج والمشاركة الصفية | 5 | draft / noindex |
| 8 | `/care-guides/public-transport-independence-training/` | الحياة اليومية والاستقلال | 5 | draft / noindex |
| 9 | `/care-guides/first-developmental-services-referral/` | دعم الأسرة والتنقل بين الخدمات | 5 | draft / noindex |
| 10 | `/care-guides/multidisciplinary-assessment-preparation/` | التنسيق متعدد التخصصات | 5 | draft / noindex |

## Editorial distinction

The ten pages intentionally use different operational models rather than one repeated long-form template:

- AAC partner training: partner behavior, modeling, wait time, repair and access to the communication system.
- Assistive-technology trial: functional goal, baseline, real-environment trial, maintenance, privacy and continue/modify/replace decision.
- Accessible dental visit: pre-visit access card, sensory/mobility preparation, stop signal and learning from each visit.
- Supported decision-making: accessible options, will/preferences, support-network roles, coercion boundaries and documentation.
- Pediatric-to-adult transition: readiness skills, medical summary, transfer completion, privacy and closing the referral loop.
- School accommodation trial: barrier hypothesis, baseline, outcome measures, accommodation-vs-modification distinction and review.
- Inclusive field trip: educational purpose, venue/transport audit, student voice, peer-support boundaries and contingency planning.
- Public-transport independence: task analysis, graded travel training, disruption plan, backup access and safety skills.
- First developmental referral: monitoring-vs-screening-vs-evaluation, observable concerns, referral tracking and early-service navigation.
- Multidisciplinary assessment: functional questions, ICF framing, document selection, information-sharing boundaries and synthesis of conflicting findings.

## Source model

Sources are selected per topic rather than copied as one universal bibliography. The current wave uses combinations of WHO, UNICEF, United Nations CRPD resources, CDC, American Academy of Pediatrics, ASHA, NHS England, CAST, Got Transition and World Bank material. Official/professional sources are primary; research papers and academic books may be added during depth review where they materially strengthen a topic.

## Publication gate

A record is **not publication-ready merely because it exists in the CMS**. Before promotion from draft, each page must pass:

1. semantic overlap review against all published Rawafid canonicals;
2. topic-specific depth review against the current long-form guide corpus;
3. claim-to-source verification and link/source metadata review;
4. Arabic language and terminology review;
5. removal of generic or repeated paragraphs that do not earn their place;
6. SEO title/description/primary intent and internal-link review;
7. accessibility and renderer review on mobile/desktop;
8. scientific/editorial/SEO/accessibility workflow states without fabricating reviewer identities;
9. `robots_index=true` only when the final release decision is made.

## Audit trail

Supabase `audit_logs` contains one `care_guides_rich_draft_created` record for each of the ten candidates. The audit payload records batch id, slug, canonical, draft/noindex state, reference count, current serialized body size, collision-gate result, and `publication_ready=false`.

## Next action

Enrich these ten candidates to release quality, then promote only those that pass all gates. The next expansion wave should be selected from measured taxonomy/search gaps after this first batch is validated, rather than generating another arbitrary list of pages.
