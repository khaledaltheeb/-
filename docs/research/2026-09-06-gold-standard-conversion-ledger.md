# Gold-standard condition conversion ledger — 2026-09-06

## Purpose

Persistent execution ledger for converting Rawafid / Health Renewal condition pages from legacy/template-heavy bodies into condition-specific, evidence-led decision pathways.

This ledger complements:

- `docs/research/2026-09-06-page-by-page-content-specificity-audit.md`
- `docs/research/2026-09-06-gold-standard-condition-content-contract.md`

## Gold definition

A page is counted here only when the public `content` record has been fully rewritten under the gold contract and carries:

- `rewrite_method = evidence-led-gold-rewrite`
- `gold_standard_upgrade = true`
- `gold_standard_version = 2026-09-06-v1`
- `source_verified_through = 2026-09-06`
- `publication_ready = true`
- `external_endorsement = false`

The retained legacy source remains preserved in `private.legacy_migration_items`.

## Current Outside-the-Box GOLD count

**25 condition pages** as of this ledger update.

### Completed

1. `legacy-outside-box-cri-du-chat-syndrome`
2. `legacy-outside-box-kleefstra-syndrome`
3. `legacy-outside-box-christianson-syndrome`
4. `legacy-outside-box-coffin-siris-syndrome`
5. `legacy-outside-box-dup15q-syndrome`
6. `legacy-outside-box-smith-kingsmore-syndrome`
7. `legacy-outside-box-pitt-hopkins-syndrome`
8. `legacy-outside-box-mowat-wilson-syndrome`
9. `legacy-outside-box-rubinstein-taybi-syndrome`
10. `legacy-outside-box-sotos-syndrome`
11. `legacy-outside-box-kbg-syndrome`
12. `legacy-outside-box-med13l-syndrome`
13. `legacy-outside-box-dravet-syndrome`
14. `legacy-outside-box-jacobsen-syndrome`
15. `legacy-outside-box-wolf-hirschhorn-syndrome`
16. `legacy-outside-box-noonan-syndrome`
17. `legacy-outside-box-klinefelter-syndrome`
18. `legacy-outside-box-1p36-deletion-syndrome`
19. `legacy-outside-box-angelman-syndrome`
20. `legacy-outside-box-wiedemann-steiner-syndrome`
21. `legacy-outside-box-kabuki-syndrome`
22. `legacy-outside-box-turner-syndrome`
23. `legacy-outside-box-foxp1-syndrome`
24. `legacy-outside-box-potocki-lupski-syndrome`
25. `legacy-outside-box-dyrk1a-syndrome`

## Anti-filler verification

An exact structured-block comparison was run across the gold corpus.

**Result after the first 20 rewrites: no repeated condition-science paragraph, list, or table was found across two or more gold pages.**

The only exact repeated blocks were structural headings such as:

- `قوة الدليل وحدوده`
- `ما لا نفعله`
- `قواعد القرار`
- `لوحة الخط الأساسي`
- `ما الذي قد يخفي أفضل أداء؟`
- `علامات التصعيد`
- `المراهقة والرشد`

This is acceptable editorial structure, not content padding. Shared headings create predictable navigation while the science beneath them remains condition-specific. The same invariant remains mandatory as the corpus grows.

## Design principles observed in completed pages

The conversions intentionally use different scientific strategies rather than replacing disease names in a common template. Examples:

- Cri-du-chat: expressive/motor limitations can mask cognition; swallowing and AAC are central.
- Kleefstra: longitudinal baseline before possible adolescent/adult regression; sleep and neuropsychiatric change.
- Christianson: ataxia/motor access, epilepsy, growth, pain expression and adult adaptive/motor loss.
- Coffin-Siris: gene-specific BAFopathy management, hand/motor access, ARID1B adult natural history, ARID1A-specific surveillance considerations.
- Dup15q: duplication class, epilepsy/postictal state, EEG beta as research biomarker rather than capability score, social learning channel.
- Smith-Kingsmore: MTOR/mosaicism, sleep/circadian function, seizures, hyperphagia and regression monitoring.
- Pitt-Hopkins: receptive-expression gap, autonomic breathing, constipation/dysmotility and visceral pain.
- Mowat-Wilson: receptive communication and cognitive play, epilepsy, Hirschsprung/constipation and social learning.
- Rubinstein-Taybi: 2024 international consensus, sleep/GI/mental-health interaction, fine-motor access and adult natural history.
- Sotos: anxiety/attention/sensory access, adult independence, and avoiding unsupported syndrome-specific cancer screening.
- KBG: verbal-performance discrepancy, hearing, movement disorders, adult work/independence.
- MED13L: motor-speech apraxia/dysarthria versus language/cognition, AAC, energy and social safety.
- Dravet: seizure-state-aware measurement, executive trajectory, gait, sleep and lifespan communication.
- Jacobsen: platelet/bleeding safety, immunology, cardiac safety, receptive-expression gap and mental health.
- Wolf-Hirschhorn: seizure/growth/hearing safety, slow but continuing development, communication and adult partial independence.
- Noonan: current molecular natural history, cardiac/bleeding/sensory safety, executive and psychosocial access.
- Klinefelter: language/reading, executive function and social cognition without equating XXY with intellectual disability.
- 1p36 deletion: cardiac/epilepsy/hearing/vision safety plus evidence that adolescent/adult function can exceed older expectations.
- Angelman: multimodal receptive/expressive/pragmatic communication, 2026 ORCA evidence, sleep/GI/mobility/adult priorities.
- Wiedemann-Steiner: feeding/growth/constipation/sleep/motor access with broad adaptive heterogeneity and adult education/work potential.
- Kabuki: hearing/immune/feeding safety, testing relative verbal/working-memory strengths, and translating communication into daily-living independence.
- Turner: 2024 international guideline plus individualized verbal/visuospatial/mathematics/executive/social profile; cardiac and hearing access are safety gates.
- FOXP1: motor-speech versus language separation, receptive/expressive asymmetry, visual-motor access and independent message repair.
- Potocki-Lupski: feeding/sleep safety, motor-speech and executive access, and testing the individual social profile rather than assuming a generic ASD phenotype.
- DYRK1A: early AAC, severe motor-speech/language separation, social motivation as a relative strength to test, and feeding/motor/vision safety.

## Evidence backfill rule

Gold is not permanent. Pages with a small direct-reference set are re-opened for evidence enrichment even if their current body is condition-specific. Turner was immediately backfilled beyond the 2024 guideline with executive-function, mathematics/visuospatial, neurodevelopmental and 2025 psychosocial/school evidence. The same process applies to any gold page whose direct condition evidence is thinner than the current literature permits.

## Next conversion wave

Continue remaining Outside-the-Box pages rated `DEEP`, beginning with:

- neurofibromatosis type 1
- 22q11.2 deletion syndrome
- kernicterus
- Phelan-McDermid syndrome
- Down syndrome
- Rett syndrome
- Williams syndrome
- hydrocephalus
- hypoxic-ischemic encephalopathy
- Charcot-Marie-Tooth disease
- Smith-McCort dysplasia
- congenital hypothyroidism developmental support
- juvenile idiopathic arthritis
- epilepsy-aphasia spectrum
- spinal cord injury

After all Outside-the-Box DEEP pages:

1. Outside-the-Box ENRICH pages.
2. Capabilities DEEP pages.
3. Capabilities ENRICH pages.
4. Re-audit STRONG pages for evidence freshness and lifespan gaps.

## Quality invariant

No page advances because of character count. A shorter page with direct condition evidence, fair access testing, explicit safety boundaries and defensible decision rules outranks a longer page padded by shared methodology.
