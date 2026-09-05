# Page-by-page content specificity audit — 2026-09-06

## Purpose

This audit answers one narrow quality question across the two programs:

> Is each published page genuinely rich in page-specific science, or is its apparent length inflated by generic, empty or repeated template prose?

The audit does **not** reward raw word count. It evaluates exact repeated structured blocks, page-specific references, central-methodology duplication, and whether the local content changes assessment, access, safety, monitoring or decision-making for the named condition.

## Important finding

A large legacy expansion layer was being rendered on nearly every Outside-the-Box condition page. Ninety-nine condition records contained an `الطبقة التشغيلية الموسعة` / `عشر خطط كاملة قابلة للتخصيص والقياس` layer; 96 had an explicit `البوابة الخامسة` boundary and the remaining three resumed at `ما المتوقع من الحالة؟`. The removable layer averaged about 282 structured blocks per page.

That layer contained valid methodology, but it was largely the **same methodology copied across conditions**. It therefore inflated page length without representing condition-specific evidence.

The raw source remains preserved in Supabase for provenance. Rendering was changed so the shared ten-plan layer is no longer displayed on every condition page. Commit: `46bb9cc766b8bbad8ce9be6f6c2462b9b26fd3a8`.

A second pass removed additional universal scaffold from condition rendering: repeated entry questions, triangulation instructions, the platform BTR-ICF explanation, the common 0/2/6/12/24-week monitoring table, universal reassessment questions, generic barrier-analysis text, duplicated in-body reference summaries, and several exact boilerplate paragraphs. Condition-specific exclusions, tools, baseline items, hypotheses/ideas, functional target, Plan B, red flags and structured references remain. Commit: `a2450866738a0c94fb88d63797a78d22fbaf1554`.

The methodology is still available centrally through `/outside-the-box/methodology/`, `/outside-the-box/evidence-standard/`, `/outside-the-box/monitoring-matrix/`, `/outside-the-box/instruments/` and `/outside-the-box/review-governance/`.

## Rating rules

### STRONG

The page has low repeated-body dependence and enough page-specific evidence to stand on its own.

### ENRICH

The page is valid and useful, but needs more direct condition evidence or more local functional/measurement detail.

### DEEP

The page should receive a substantive condition-specific rewrite/enrichment pass. Typical reasons are high repeated-body dependence, too few direct condition-specific references, or both. A DEEP rating does not mean the existing page is false; it means the page is not yet sufficiently specific to justify its former apparent volume.

### CENTRAL

A methodology/hub page whose purpose is legitimately shared across conditions.

### INTERNAL

Published support/research material intentionally not indexed as a public search target.

---

# Outside the Box

Post-cleanup classification: **89 DEEP, 6 ENRICH, 5 STRONG, 5 CENTRAL**.

The key remaining issue is not universal 7,000-word padding; that has been removed from rendering. The remaining repetition is mostly **family/cluster-level scaffolding** (for example shared genetic-syndrome assessment tables, shared neurological monitoring patterns, common AAC/access ideas). Those blocks can be clinically useful, but they must no longer be mistaken for condition-specific evidence. DEEP pages should progressively replace them with direct condition guidance rather than receive more generic prose.

## CENTRAL — keep as shared methodology

- `legacy-outside-box-evidence-standard`
- `legacy-outside-box-instruments`
- `legacy-outside-box-methodology`
- `legacy-outside-box-monitoring-matrix`
- `legacy-outside-box-review-governance`

## STRONG — condition-specific content currently passes

- `legacy-outside-box-childhood-apraxia-of-speech`
- `legacy-outside-box-fetal-alcohol-spectrum-disorders`
- `legacy-outside-box-social-pragmatic-communication-disorder`
- `legacy-outside-box-speech-sound-disorder`
- `legacy-outside-box-stuttering`

## ENRICH — valid but needs stronger direct evidence

- `legacy-outside-box-oculocutaneous-albinism`
- `legacy-outside-box-pediatric-feeding-swallowing-disorder`
- `legacy-outside-box-retinitis-pigmentosa`
- `legacy-outside-box-sensory-processing-differences`
- `legacy-outside-box-specific-learning-disorder-reading`
- `legacy-outside-box-usher-syndrome`

## DEEP — substantive condition-specific enrichment required

- `legacy-outside-box-kleefstra-syndrome`
- `legacy-outside-box-cri-du-chat-syndrome`
- `legacy-outside-box-dup15q-syndrome`
- `legacy-outside-box-christianson-syndrome`
- `legacy-outside-box-coffin-siris-syndrome`
- `legacy-outside-box-smith-kingsmore-syndrome`
- `legacy-outside-box-fragile-x-syndrome`
- `legacy-outside-box-pitt-hopkins-syndrome`
- `legacy-outside-box-mowat-wilson-syndrome`
- `legacy-outside-box-rubinstein-taybi-syndrome`
- `legacy-outside-box-sotos-syndrome`
- `legacy-outside-box-kbg-syndrome`
- `legacy-outside-box-med13l-syndrome`
- `legacy-outside-box-dravet-syndrome`
- `legacy-outside-box-jacobsen-syndrome`
- `legacy-outside-box-wolf-hirschhorn-syndrome`
- `legacy-outside-box-noonan-syndrome`
- `legacy-outside-box-klinefelter-syndrome`
- `legacy-outside-box-1p36-deletion-syndrome`
- `legacy-outside-box-angelman-syndrome`
- `legacy-outside-box-wiedemann-steiner-syndrome`
- `legacy-outside-box-kabuki-syndrome`
- `legacy-outside-box-turner-syndrome`
- `legacy-outside-box-foxp1-syndrome`
- `legacy-outside-box-potocki-lupski-syndrome`
- `legacy-outside-box-dyrk1a-syndrome`
- `legacy-outside-box-neurofibromatosis-type-1`
- `legacy-outside-box-22q11-2-deletion-syndrome`
- `legacy-outside-box-kernicterus`
- `legacy-outside-box-phelan-mcdermid-syndrome`
- `legacy-outside-box-down-syndrome`
- `legacy-outside-box-rett-syndrome`
- `legacy-outside-box-williams-syndrome`
- `legacy-outside-box-hydrocephalus`
- `legacy-outside-box-hypoxic-ischemic-encephalopathy`
- `legacy-outside-box-charcot-marie-tooth`
- `legacy-outside-box-smith-mc-cort-dysplasia`
- `legacy-outside-box-congenital-hypothyroidism-developmental-support`
- `legacy-outside-box-juvenile-idiopathic-arthritis`
- `legacy-outside-box-epilepsy-aphasia-spectrum`
- `legacy-outside-box-spinal-cord-injury`
- `legacy-outside-box-global-developmental-delay`
- `legacy-outside-box-osteogenesis-imperfecta`
- `legacy-outside-box-spinal-muscular-atrophy`
- `legacy-outside-box-congenital-cmv`
- `legacy-outside-box-ehlers-danlos-syndromes`
- `legacy-outside-box-epilepsy-functional-support`
- `legacy-outside-box-lennox-gastaut-syndrome`
- `legacy-outside-box-achondroplasia`
- `legacy-outside-box-duchenne-muscular-dystrophy`
- `legacy-outside-box-phenylketonuria`
- `legacy-outside-box-infantile-epileptic-spasms-syndrome`
- `legacy-outside-box-sleep-difficulties-neurodevelopmental`
- `legacy-outside-box-spina-bifida`
- `legacy-outside-box-acquired-brain-injury`
- `legacy-outside-box-rare-neurodevelopmental-undiagnosed`
- `legacy-outside-box-smith-magenis-syndrome`
- `legacy-outside-box-adnp-syndrome`
- `legacy-outside-box-aicardi-syndrome`
- `legacy-outside-box-sturge-weber-syndrome`
- `legacy-outside-box-smith-lemli-opitz-syndrome`
- `legacy-outside-box-cornelia-de-lange-syndrome`
- `legacy-outside-box-satb2-associated-syndrome`
- `legacy-outside-box-tuberous-sclerosis-complex`
- `legacy-outside-box-congenital-zika-syndrome`
- `legacy-outside-box-prader-willi-syndrome`
- `legacy-outside-box-tic-disorder-tourette`
- `legacy-outside-box-central-auditory-processing-difficulties`
- `legacy-outside-box-auditory-neuropathy-spectrum`
- `legacy-outside-box-charge-syndrome`
- `legacy-outside-box-hearing-loss-deafness`
- `legacy-outside-box-developmental-coordination-disorder`
- `legacy-outside-box-developmental-language-disorder`
- `legacy-outside-box-intellectual-developmental-disorder`
- `legacy-outside-box-deafblindness`
- `legacy-outside-box-cerebral-palsy`
- `legacy-outside-box-arthrogryposis-multiplex-congenita`
- `legacy-outside-box-limb-difference-amputation`
- `legacy-outside-box-specific-learning-disorder-mathematics`
- `legacy-outside-box-selective-mutism`
- `legacy-outside-box-school-avoidance-anxiety`
- `legacy-outside-box-severe-behavior-self-injury`
- `legacy-outside-box-trauma-related-learning-support`
- `legacy-outside-box-ocd-functional-support`
- `legacy-outside-box-adhd`
- `legacy-outside-box-vision-impairment-low-vision`
- `legacy-outside-box-specific-learning-disorder-written-expression`
- `legacy-outside-box-cerebral-visual-impairment`
- `legacy-outside-box-autism`

### Required enrichment contract for every DEEP Outside-the-Box page

Do **not** add more generic baseline/fidelity/ICF prose. Add only evidence that is materially local to the condition:

1. condition-specific functional phenotype and meaningful variability;
2. condition-specific red flags and alternative explanations;
3. at least several direct condition sources, prioritising current guideline/review/authoritative disease source where available;
4. condition-relevant measures/tools with construct, version, age, language, psychometric, licensing and accommodation limits;
5. condition-specific hypotheses and low-risk reversible experiments;
6. treatment/access evidence with population limits and uncertainty;
7. harms, contraindications, burden and stop/escalation rules specific to the condition;
8. life-course/transition/progression issues where relevant;
9. Arabic/MENA applicability and tool/service gaps where evidence permits;
10. a measurable `what would change the decision?` endpoint.

---

# Capabilities / لنرتقي بقدراتهم

Classification: **24 DEEP, 26 ENRICH, 105 STRONG, 4 CENTRAL, 1 INTERNAL**.

Unlike Outside the Box, Capabilities has no universal body block repeated across 50+ pages. The problem is concentrated in a legacy/rare-condition cluster rather than being a site-wide padding system.

## CENTRAL

- `capabilities-hub`
- `capabilities-methodology`
- `capabilities-protocol`
- `capabilities-registry`

## INTERNAL

- `capabilities-selective-mutism-multilingual-review-bundle` — intentionally noindex research/review bundle.

## DEEP — rewrite/enrich before treating as gold-standard condition pages

- `legacy-capability-white-sutton-syndrome`
- `legacy-capability-xia-gibbs-syndrome`
- `legacy-capability-wiedemann-steiner-syndrome`
- `legacy-capability-kcnq2-developmental-epileptic-encephalopathy`
- `legacy-capability-cacna1a-related-disorder`
- `capabilities-satb2-associated-syndrome`
- `capabilities-kleefstra-syndrome`
- `capabilities-koolen-de-vries-syndrome`
- `capabilities-mowat-wilson-syndrome`
- `capabilities-christianson-syndrome`
- `capabilities-pitt-hopkins-syndrome`
- `capabilities-nicolaides-baraitser-syndrome`
- `legacy-capability-hnrnpu-related-neurodevelopmental-disorder`
- `capabilities-kbg-syndrome`
- `capabilities-coffin-siris-syndrome`
- `capabilities-phelan-mcdermid-syndrome`
- `capabilities-foxg1-syndrome`
- `legacy-capability-mucopolysaccharidosis-type-ii`
- `legacy-capability-landau-kleffner-syndrome`
- `legacy-capability-coffin-lowry-syndrome`
- `capabilities-gaucher-disease`
- `legacy-capability-maple-syrup-urine-disease`
- `legacy-capability-mucopolysaccharidosis-type-vi`
- `legacy-capability-pompe-disease`

## ENRICH

- `legacy-capability-metachromatic-leukodystrophy`
- `legacy-capability-mucopolysaccharidosis-type-iii`
- `capabilities-bpan-wdr45`
- `capabilities-grin2b-related-neurodevelopmental-disorder`
- `capabilities-syngap1-related-disorder`
- `capabilities-lennox-gastaut-syndrome`
- `capabilities-dravet-syndrome`
- `capabilities-cdkl5-deficiency-disorder`
- `legacy-capability-menkes-disease`
- `legacy-capability-setd5-related-neurodevelopmental-disorder`
- `legacy-capability-stxbp1-related-disorder`
- `legacy-capability-pura-syndrome`
- `legacy-capability-scn2a-related-disorder`
- `legacy-capability-dyrk1a-syndrome`
- `legacy-capability-bainbridge-ropers-syndrome`
- `legacy-capability-ddx3x-related-neurodevelopmental-disorder`
- `legacy-capability-adnp-syndrome`
- `legacy-capability-med13l-syndrome`
- `legacy-capability-scn8a-related-disorder`
- `capabilities-kcnt1-related-epilepsy`
- `capabilities-mucopolysaccharidosis-type-i`
- `legacy-capability-fabry-disease`
- `legacy-capability-homocystinuria-cbs-deficiency`
- `legacy-capability-mucopolysaccharidosis-type-iv`
- `legacy-capability-niemann-pick-disease-type-c`
- `legacy-capability-wilson-disease`

## STRONG — passed specificity audit

The following 105 public pages currently show no material exact template dependence under the audit threshold and have adequate direct evidence for the current scope:

- `capabilities-22q11-deletion-syndrome`
- `capabilities-achondroplasia`
- `capabilities-acquired-apraxia-of-speech`
- `capabilities-adhd`
- `capabilities-amyotrophic-lateral-sclerosis`
- `capabilities-angelman-syndrome`
- `capabilities-aphasia`
- `capabilities-arthrogryposis`
- `capabilities-autism`
- `capabilities-becker-muscular-dystrophy`
- `capabilities-bipolar-disorder-functional-support`
- `capabilities-blindness`
- `capabilities-central-auditory-processing-difficulties`
- `capabilities-cerebral-palsy`
- `capabilities-cerebral-visual-impairment`
- `capabilities-charcot-marie-tooth-disease`
- `capabilities-charge-syndrome`
- `capabilities-childhood-apraxia-of-speech`
- `capabilities-childhood-cancer-late-effects`
- `capabilities-chronic-kidney-disease`
- `capabilities-chronic-pain`
- `capabilities-cleft-lip-palate-communication`
- `capabilities-congenital-heart-disease`
- `capabilities-congenital-hypothyroidism`
- `capabilities-cornelia-de-lange-syndrome`
- `capabilities-cri-du-chat-syndrome`
- `capabilities-cystic-fibrosis`
- `capabilities-deafblindness`
- `capabilities-deafness`
- `capabilities-developmental-coordination-disorder`
- `capabilities-developmental-language-disorder`
- `capabilities-down-syndrome`
- `capabilities-duchenne-muscular-dystrophy`
- `capabilities-dysarthria`
- `capabilities-dyscalculia`
- `capabilities-dyslexia`
- `capabilities-dystonia`
- `capabilities-ehlers-danlos-syndromes`
- `capabilities-epilepsy`
- `capabilities-fetal-alcohol-spectrum-disorders`
- `capabilities-fragile-x-syndrome`
- `capabilities-friedreich-ataxia`
- `capabilities-global-developmental-delay`
- `capabilities-hearing-loss`
- `capabilities-hemophilia`
- `capabilities-hereditary-spastic-paraplegia`
- `capabilities-huntington-disease`
- `capabilities-hydrocephalus`
- `capabilities-inflammatory-bowel-disease`
- `capabilities-intellectual-developmental-disorder`
- `capabilities-joubert-syndrome`
- `capabilities-juvenile-idiopathic-arthritis`
- `capabilities-kabuki-syndrome`
- `capabilities-klinefelter-syndrome`
- `capabilities-limb-difference-amputation`
- `capabilities-long-covid`
- `capabilities-low-vision`
- `capabilities-marfan-syndrome`
- `capabilities-me-cfs`
- `capabilities-mitochondrial-diseases`
- `capabilities-moebius-syndrome`
- `capabilities-multiple-sclerosis`
- `capabilities-myasthenia-gravis`
- `capabilities-neurofibromatosis-type-1`
- `capabilities-noonan-syndrome`
- `capabilities-oculocutaneous-albinism`
- `capabilities-optic-nerve-hypoplasia`
- `capabilities-osteogenesis-imperfecta`
- `capabilities-parkinson-disease`
- `capabilities-phenylketonuria`
- `capabilities-prader-willi-syndrome`
- `capabilities-retinitis-pigmentosa`
- `capabilities-rett-syndrome`
- `capabilities-rubinstein-taybi-syndrome`
- `capabilities-schizophrenia-functional-support`
- `capabilities-selective-mutism-arabic-transcultural-counselling`
- `capabilities-selective-mutism-multilingual-differential`
- `capabilities-selective-mutism-speech-access-map`
- `capabilities-selective-mutism-speech-pressure-protocol`
- `capabilities-selective-mutism-within-person-research-protocol`
- `capabilities-sensory-processing-differences`
- `capabilities-severe-asthma`
- `capabilities-severe-burns-contractures`
- `capabilities-severe-food-allergy`
- `capabilities-severe-scoliosis`
- `capabilities-sickle-cell-disease`
- `capabilities-smith-lemli-opitz-syndrome`
- `capabilities-smith-magenis-syndrome`
- `capabilities-social-pragmatic-communication-disorder`
- `capabilities-sotos-syndrome`
- `capabilities-speech-sound-disorder`
- `capabilities-spina-bifida`
- `capabilities-spinal-cord-injury`
- `capabilities-spinal-muscular-atrophy`
- `capabilities-stroke`
- `capabilities-stuttering`
- `capabilities-systemic-lupus-erythematosus`
- `capabilities-tourette-tic-disorders`
- `capabilities-traumatic-brain-injury`
- `capabilities-tuberous-sclerosis-complex`
- `capabilities-turner-syndrome`
- `capabilities-type-1-diabetes`
- `capabilities-usher-syndrome`
- `capabilities-williams-syndrome`
- `capabilities-written-expression-difficulty`

## Capabilities enrichment rule

For DEEP/ENRICH pages, do not lengthen the existing common capability template. Replace repeated material with:

- phenotype/variability specific to the condition;
- strengths/access opportunities supported at individual level rather than diagnosis stereotypes;
- condition-specific medical/sensory/motor confounders that can hide capability;
- direct measures and observable functional probes;
- age/life-stage transitions;
- direct recent condition references;
- explicit evidence uncertainty;
- Arabic/MENA access or adaptation gaps where supportable.

---

# Publication rule going forward

A page must **not** be called rich because it is long. Future quality review should distinguish:

- **shared method** → publish once in the method/governance pages;
- **family-level common practice** → keep only when it materially helps the named condition and label it as family-level, otherwise link outward;
- **condition-specific science** → the core of the condition page;
- **safety disclaimer** → concise and visible, not repeated as pseudo-content;
- **references** → direct, current and tied to claims rather than a large common reference pack.

No page should be expanded merely to increase characters, words or apparent completeness. If direct evidence is limited, a shorter transparent page is preferable to a long templated page.
