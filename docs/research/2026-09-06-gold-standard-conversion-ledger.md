# Gold-standard condition conversion ledger — 2026-09-06

## Purpose

Persistent execution ledger for converting Rawafid / Health Renewal Outside-the-Box condition pages from legacy/template-heavy bodies into condition-specific, evidence-led decision pathways.

This ledger complements:

- `docs/research/2026-09-06-page-by-page-content-specificity-audit.md`
- `docs/research/2026-09-06-gold-standard-condition-content-contract.md`

## Gold definition

A page is counted as GOLD only when the public `content` record has been fully rewritten and carries:

- `rewrite_method = evidence-led-gold-rewrite`
- `gold_standard_upgrade = true`
- `gold_standard_version = 2026-09-06-v1`
- `source_verified_through = 2026-09-06`
- `publication_ready = true`
- `external_endorsement = false`
- direct condition evidence rather than PubMed search-result URLs

The retained legacy source remains preserved in `private.legacy_migration_items` for provenance and recovery.

## Current Outside-the-Box GOLD count

**89 condition pages.**

All **89 pages originally rated DEEP** in the page-specificity audit are now GOLD.

Current corpus-wide acceptance state:

- minimum direct references per GOLD page: **5**
- average direct references per GOLD page: **7.4**
- GOLD pages containing PubMed search URLs: **0**
- exact repeated scientific paragraph/list/table blocks of 100+ characters across GOLD pages: **0**

Shared structural headings are allowed; copied condition science is not.

## Completed GOLD pages

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
26. `legacy-outside-box-neurofibromatosis-type-1`
27. `legacy-outside-box-22q11-2-deletion-syndrome`
28. `legacy-outside-box-phelan-mcdermid-syndrome`
29. `legacy-outside-box-down-syndrome`
30. `legacy-outside-box-kernicterus`
31. `legacy-outside-box-rett-syndrome`
32. `legacy-outside-box-williams-syndrome`
33. `legacy-outside-box-hydrocephalus`
34. `legacy-outside-box-hypoxic-ischemic-encephalopathy`
35. `legacy-outside-box-charcot-marie-tooth`
36. `legacy-outside-box-juvenile-idiopathic-arthritis`
37. `legacy-outside-box-spinal-cord-injury`
38. `legacy-outside-box-congenital-hypothyroidism-developmental-support`
39. `legacy-outside-box-epilepsy-aphasia-spectrum`
40. `legacy-outside-box-smith-mc-cort-dysplasia`
41. `legacy-outside-box-fragile-x-syndrome`
42. `legacy-outside-box-global-developmental-delay`
43. `legacy-outside-box-osteogenesis-imperfecta`
44. `legacy-outside-box-spinal-muscular-atrophy`
45. `legacy-outside-box-congenital-cmv`
46. `legacy-outside-box-ehlers-danlos-syndromes`
47. `legacy-outside-box-epilepsy-functional-support`
48. `legacy-outside-box-lennox-gastaut-syndrome`
49. `legacy-outside-box-achondroplasia`
50. `legacy-outside-box-duchenne-muscular-dystrophy`
51. `legacy-outside-box-phenylketonuria`
52. `legacy-outside-box-infantile-epileptic-spasms-syndrome`
53. `legacy-outside-box-sleep-difficulties-neurodevelopmental`
54. `legacy-outside-box-spina-bifida`
55. `legacy-outside-box-acquired-brain-injury`
56. `legacy-outside-box-rare-neurodevelopmental-undiagnosed`
57. `legacy-outside-box-smith-magenis-syndrome`
58. `legacy-outside-box-adnp-syndrome`
59. `legacy-outside-box-aicardi-syndrome`
60. `legacy-outside-box-sturge-weber-syndrome`
61. `legacy-outside-box-smith-lemli-opitz-syndrome`
62. `legacy-outside-box-cornelia-de-lange-syndrome`
63. `legacy-outside-box-satb2-associated-syndrome`
64. `legacy-outside-box-tuberous-sclerosis-complex`
65. `legacy-outside-box-congenital-zika-syndrome`
66. `legacy-outside-box-prader-willi-syndrome`
67. `legacy-outside-box-tic-disorder-tourette`
68. `legacy-outside-box-central-auditory-processing-difficulties`
69. `legacy-outside-box-auditory-neuropathy-spectrum`
70. `legacy-outside-box-charge-syndrome`
71. `legacy-outside-box-hearing-loss-deafness`
72. `legacy-outside-box-developmental-coordination-disorder`
73. `legacy-outside-box-developmental-language-disorder`
74. `legacy-outside-box-intellectual-developmental-disorder`
75. `legacy-outside-box-deafblindness`
76. `legacy-outside-box-cerebral-palsy`
77. `legacy-outside-box-arthrogryposis-multiplex-congenita`
78. `legacy-outside-box-limb-difference-amputation`
79. `legacy-outside-box-specific-learning-disorder-mathematics`
80. `legacy-outside-box-selective-mutism`
81. `legacy-outside-box-school-avoidance-anxiety`
82. `legacy-outside-box-severe-behavior-self-injury`
83. `legacy-outside-box-trauma-related-learning-support`
84. `legacy-outside-box-ocd-functional-support`
85. `legacy-outside-box-adhd`
86. `legacy-outside-box-vision-impairment-low-vision`
87. `legacy-outside-box-specific-learning-disorder-written-expression`
88. `legacy-outside-box-cerebral-visual-impairment`
89. `legacy-outside-box-autism`

## Scientific design invariant

Every condition page must answer a condition-specific decision problem rather than simply describe a diagnosis. The required logic is:

1. identify the best plausible ability that may be hidden by access, motor, speech, sensory, fatigue, pain, sleep, anxiety or medical-state effects;
2. establish safety/red-flag gates before functional experimentation;
3. define a condition-specific baseline using meaningful function rather than a single global score;
4. use recent direct literature to generate low-risk reversible hypotheses/experiments;
5. distinguish treatment effect from environmental access, implementation fidelity and measurement artifact;
6. define what result changes the decision;
7. include lifespan/transition issues when the natural history makes them relevant;
8. state what the page must not recommend or overclaim.

## Evidence backfill rule

GOLD is not permanent. A page is reopened whenever newer direct evidence materially changes natural history, safety, assessment, treatment-response interpretation, lifespan planning or functional outcomes. A small reference list is also re-opened when the current literature clearly supports stronger direct sourcing.

## Anti-filler rule

At 89 GOLD pages, exact structured-block comparison finds **zero scientific paragraphs, lists or tables of 100+ characters duplicated exactly across two or more pages**. Repeated editorial headings such as `قواعد القرار` or `قوة الدليل وحدوده` are permitted because they provide predictable navigation; the science beneath them must remain condition-specific.

## Next conversion wave

The original DEEP backlog is closed. Continue with the six pages originally rated ENRICH:

- `legacy-outside-box-oculocutaneous-albinism`
- `legacy-outside-box-pediatric-feeding-swallowing-disorder`
- `legacy-outside-box-retinitis-pigmentosa`
- `legacy-outside-box-sensory-processing-differences`
- `legacy-outside-box-specific-learning-disorder-reading`
- `legacy-outside-box-usher-syndrome`

Then re-audit and upgrade the five pages originally rated STRONG so that all 100 public Outside-the-Box condition pages are held to the same current Gold contract.

After all 100 Outside-the-Box condition pages:

1. Capabilities DEEP pages.
2. Capabilities ENRICH pages.
3. Re-audit Capabilities STRONG pages for evidence freshness, lifespan gaps and new 2025–2026 literature.

## Quality invariant

No page advances because of word count. A shorter page with direct condition evidence, fair access testing, explicit safety boundaries, measurable outcomes and defensible decision rules outranks a long page padded by shared methodology.
