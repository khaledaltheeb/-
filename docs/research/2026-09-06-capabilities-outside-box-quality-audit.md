# Capabilities + Outside-the-Box quality audit — 2026-09-06

## Scope

This audit covers the live production content namespaces:

- `/capabilities/*` — «لنرتقي بقدراتهم»
- `/outside-the-box/*` — «خارج الصندوق»

It distinguishes publication correctness from scientific richness. Word count alone is not treated as a quality proxy.

## Publication acceptance state after repairs

Production Supabase acceptance query after the repairs returned:

| Metric | Capabilities | Outside the Box |
|---|---:|---:|
| Published | 160 | 105 |
| Indexable | 159 | 105 |
| Minimum words among indexable pages | 1500 | 903 |
| Average words | 2090.1 | 6919.7 |
| Median words | 1915 | 7259 |
| Minimum references | 2 | 5 |
| Average references | 10.2 | 14.7 |
| SEO titles > 60 chars | 0 | 0 |
| Invalid meta-description length | 0 | 0 |
| Missing primary keyword | 0 | 0 |
| Malformed structured body JSON | 0 | 0 |
| Duplicate published canonicals | 0 | 0 |
| Duplicate reference URLs within a page | 0 | 0 |

The single published noindex Capabilities record is `capabilities-selective-mutism-multilingual-review-bundle`, an internal research/review bundle rather than a public search target. Its noindex state is therefore intentional.

## Sitemap and routing

`app/sitemaps/content.xml/route.ts` emits published records only when `published_at <= now` and `robots_index=true`, and uses `canonical_url` as the public URL. Neither `/capabilities/*` nor `/outside-the-box/*` is excluded by the dedicated-sitemap filters.

The immutable `legacy-capability-*` database slugs remain valid because their public canonicals are `/capabilities/<route>/`; the current Capability route includes a database bridge before falling back to static legacy snapshots.

A cross-link defect was found during this audit: 64 routes have both a published Capability page and an Outside-the-Box page, but the previous Outside-the-Box lookup resolved only 60 because it searched only for `capabilities-*` internal slugs. Four paired Capability records have immutable `legacy-capability-*` internal slugs. `app/outside-the-box/[[...slug]]/page.tsx` was changed to resolve the sibling by the canonical `/capabilities/<route>/`, covering both internal slug families.

## SEO cleanup

Thirteen published pages had SEO titles longer than 60 characters: one Capability page and twelve Outside-the-Box pages. All were shortened while preserving the condition/topic and search intent. The post-repair acceptance query reports zero titles over 60 characters and zero invalid meta-description lengths in the two namespaces.

## Reference cleanup and provenance recovery

A legacy reference label, `فتح المرجع المباشر الخاص بالحالة أو قاعدة الحالة`, appeared in Outside-the-Box records. Some occurrences duplicated an already-present source URL, while others were the only direct condition-specific reference.

The cleanup was therefore corrected using `private.legacy_migration_items`, which preserves the validated production migration source corpus. Eighty-four missing direct URLs were recovered from that ledger and restored to their corresponding pages with reader-facing institutional labels (for example MedlinePlus, NIH GARD, ASHA, CDC, NINDS, NIDCD, NIMH, NIAMS, GeneReviews/NCBI, IES and relevant specialty sources). No URLs were guessed from condition names.

After recovery:

- Outside-the-Box minimum reference count = 5.
- Outside-the-Box average reference count = 14.7.
- No blank reference objects or non-HTTPS references remain in the audited namespaces.
- Duplicate reference URLs inside an indexable page = 0 after also consolidating the single duplicate GeneReviews URL in the MPS II Capability record.

## Scientific richness: Capabilities

The Capabilities corpus is generally genuinely condition-specific rather than merely long.

A structural-string reuse audit across the indexable Capability pages found approximately:

- 9.6% average long-text share reused on ten or more pages.
- 86.5% average page-unique long-text share.
- 100% median page-unique share.

The reference corpus is also comparatively specific:

- average references/page: 10.2;
- average page-unique references: 6.2;
- average references shared across ten or more pages: 3.1.

This means the program is broadly rich and specific, although a small migrated tail remains less differentiated than the modern corpus.

### Priority Capabilities pages for future enrichment

The lowest-specificity migrated pages include:

1. `cacna1a-related-disorder`
2. `white-sutton-syndrome`
3. `xia-gibbs-syndrome`
4. `hnrnpu-related-neurodevelopmental-disorder`
5. `kcnq2-developmental-epileptic-encephalopathy`
6. `menkes-disease`
7. `mucopolysaccharidosis-type-iv`

These are valid published pages, but future improvement should deepen condition-specific functional phenotype, assessment decisions, longitudinal change, access adaptations and direct evidence rather than adding generic capability prose.

## Scientific richness: Outside the Box

The program is operationally strong but the condition library is substantially more templated than its raw word counts imply.

A JSON-string reuse audit found approximately:

- 89.0% average long-text share reused on ten or more pages;
- 9.3% average page-unique long-text share;
- 4.5% median page-unique share.

This does **not** mean that 89% of the science is useless. Much of the repeated material is the program's legitimate shared provider protocol: baseline, triangulation, ICF framing, implementation fidelity, reversible trials, safety, outcome monitoring, stop rules and generalisation. However, it means that a 7,000-word page cannot be rated as a 7,000-word condition-specific evidence review.

The central quality gap is therefore **specificity, not length**.

### Condition-page enrichment standard

A true next-generation Outside-the-Box condition page should add, where supported:

1. a condition-specific functional phenotype and meaningful sources of variability;
2. condition-specific red flags and alternative explanations that must be excluded;
3. direct authoritative condition references, ideally 3–8 beyond the common framework pack;
4. assessment tools relevant to that condition with construct, age, version, language, licensing, psychometric and accommodation limits;
5. condition-specific hypotheses and small reversible access/participation experiments;
6. intervention/access evidence with explicit uncertainty and population limits;
7. condition-specific harms, burden, contraindications and stopping/escalation rules;
8. life-course progression, transition and loss-of-function issues when relevant;
9. Arabic/MENA applicability, including language/tool availability and health-system constraints;
10. a `what would change the decision?` section tied to measurable outcomes.

Repeated operational protocol should remain available, but condition pages should increasingly reference the central methodology and use their local space for condition-specific evidence rather than repeating the full framework verbatim.

## High-priority Outside-the-Box weaknesses found and repaired during this audit

### Evidence standard

`/outside-the-box/evidence-standard/` was expanded from about 709 words/7 references to about 1,087 words/10 references. The upgrade adds:

- COSMIN ordering of measurement-property appraisal, beginning with content validity;
- measurement error and responsiveness for change measurement;
- cross-cultural/Arabic adaptation limits;
- an explicit distinction between a practical small trial and a causal SCED;
- requirements for repeated measurement, planned phase changes, fidelity and replication/randomisation where appropriate;
- a claim–evidence–decision map.

### Monitoring matrix

`/outside-the-box/monitoring-matrix/` was expanded from about 716 words/3 references to about 1,072 words/5 references. The upgrade adds:

- the difference between descriptive monitoring and interpretable single-case experimental design;
- five required data layers (outcome, phase, fidelity, co-occurring factors, harm/burden);
- structured visual-analysis concepts;
- GAS governance and bias controls;
- stronger pre-specified stopping/modification logic.

### Instrument registry governance

`/outside-the-box/instruments/` was expanded from about 717 words/3 references to about 1,033 words/5 references. The upgrade adds:

- content validity as the first measurement question;
- measurement error and responsiveness;
- cross-cultural validity/measurement invariance;
- explicit Arabic adaptation limitations;
- accommodation/access effects on score interpretation;
- a compact evidence-decision card for every instrument.

### Stuttering

`/outside-the-box/stuttering/` was expanded from about 814 words/2 references to about 1,496 words/6 references. It now includes a real Outside-the-Box pathway rather than only a general explainer:

- person-chosen functional target;
- multi-context baseline;
- separation of observable disfluency, struggle/effort and participation impact;
- instrument/licensing/language caveats;
- testable hypotheses without blaming anxiety or the speaker;
- low-risk environmental experiments;
- age-dependent limits in the intervention evidence;
- implementation fidelity and dose;
- multidimensional outcome matrix;
- modification/stopping rules;
- generalisation before declaring success.

### Review governance policy

`/outside-the-box/review-governance/` contained an old sentence saying a competing page should be archived when another becomes the stronger reference. That conflicted with the current scientific preservation rule. It now states that competition alone is not a reason to archive a scientifically independent page; distinct scientific questions remain public and cross-linked, while true duplication can be consolidated with provenance preserved.

## Current quality judgement

### Capabilities / لنرتقي بقدراتهم

- Publication architecture: **9.5/10**
- Scientific richness: **8.5–9/10**
- Condition specificity: **strong overall**
- Main remaining work: enrich the small migrated low-specificity tail and strengthen direct evidence for a few rare-condition pages.

### Outside the Box

- Publication architecture: **9.5/10** after cross-link and SEO repairs
- Shared methodology: **9/10**
- Condition-specific richness: **about 6.5–7/10 overall**
- Main remaining work: replace template-dominated page volume with condition-specific evidence, tools, hypotheses, harms and decision rules.

## Final decision

The content is publishable and technically well-formed after the current repairs. Capabilities is already a strong evidence-rich program. Outside the Box is a strong methodological system but should **not** be considered scientifically complete merely because most pages exceed 7,000 words. The next quality phase should prioritize specificity and direct condition evidence over additional generic volume.
