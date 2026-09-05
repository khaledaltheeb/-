# Capabilities + Outside-the-Box recovery analysis — 2026-09-06

Scope: current production data, current `main` routes, and preserved legacy Outside-the-Box program.

## Executive decision

The two programs are related but should not remain two competing condition libraries.

- `/capabilities/*` is the canonical successor for condition-level capability, access, participation and functional-improvement guidance.
- `/capabilities/ideas/` is the correct home for the creative experimentation method: small reversible trials, evidence linkage, baseline, fidelity, burden, stop rules and generalization.
- `/outside-the-box/*` contains substantial legacy material worth harvesting, but the old condition pages should not be republished as a second canonical library.
- Legacy material should be migrated selectively into the current capability guide for the same condition, then the legacy route can be retired/redirected only after its unique material has been accounted for.
- Measurement-instrument governance from the old program belongs in Assessment Lab rather than in the Ideas page.

## Current Capabilities program

Production query on published canonical `/capabilities/%` pages found:

- 140 published canonical capability pages.
- 139 indexable pages.
- 100 core condition guides with `legacy_rank` 1–100.
- 30 additional condition-level capability pages outside the core ranked registry.
- 10 supporting/research/methodology pages using normalized `capabilities-*` slugs.

The database sector row `capabilities` has zero taxonomy categories, while the actual capability program is loaded directly from `content` records under `/capabilities/*`. This caused the general sector taxonomy to make the sector appear empty even though the program itself is substantial.

### Repair completed

`app/sectors/capabilities/page.tsx` was converted into a dynamic bridge to the real capability library. It now queries published indexed `/capabilities/%` content directly and exposes:

1. the 100 ranked core guides;
2. extended condition guides;
3. methodology/research/supporting records;
4. protocol, printables, ideas and methodology routes.

No pages were duplicated and no canonical URLs were changed.

`app/sectors/page.tsx` now also reports the actual directly-linked capability-page count for the `capabilities` card instead of presenting a zero-category sector as if it had no material.

Commits:
- `0604171a7fa3d473a0801dc4ce9bc99ab72eb1b7`
- `f79ae14051fe7558f1e9ac9d4d8682dd8a21cb6e`

## Current Ideas page

`app/capabilities/ideas/page.tsx` already existed in the current repository and is indexable at `/capabilities/ideas/`.

Its original current-generation design contained 12 useful micro-experiments, each structured as:

- problem;
- try;
- measure;
- stop/modify rule.

Examples include removing writing as an unintended access barrier, externalizing memory into the environment, changing task order before adding training, extending response latency, comparing equivalent task presentations, reducing environmental friction, using interests as an access gateway, measuring the cost of success, testing transfer across contexts, replacing human prompts with user-controlled tools, making refusal measurable, and starting from real-life participation rather than isolated drills.

The page was originally introduced by commit `4def2c1b2aee770e87d079d9c980265effdc427c` (`Add evidence-informed outside-the-box capability ideas`).

### Recovery enhancement completed

The page has now been upgraded rather than replaced. It preserves the 12 current micro-experiments and restores the strongest operational concepts from the legacy program as:

- 10 decision layers from goal/safety/baseline through hypothesis, reversible change, consent, implementation fidelity, burden, generalization and pre-agreed continue/modify/stop decisions;
- a 2×2 outcome × implementation-fidelity decision matrix;
- explicit explanation of what was deliberately not restored;
- stronger links to protocol, printables, methodology and registry;
- evidence links including WHO ICF, WHO assistive technology, WWC single-case standards, CAST UDL, UNICEF inclusive education, NICE shared decision making and COSMIN.

Commit: `c21b448a284bb578e93090fe5c889bc6eb112724`.

## Legacy Outside-the-Box program found

The original program is preserved through `/outside-the-box/*` routes and legacy records. Repository provenance explicitly connects the older condition library (`content/v254/outside-the-box-conditions-ar.json`) with the later capabilities program (`content/v280/capabilities-100-ar.json`).

The legacy program contains roughly 109 preserved routes/records across condition pages, methodology, evidence standards, monitoring, instruments and program artifacts.

### The unpublished/root material

The old root record `legacy-landing-outside-the-box` is a draft/noindex page and is thin (~1.4k characters, no external references). Its own audit metadata classifies it as a rebuild candidate rather than publication-ready. It should not be restored as-is.

Other old administrative/landing artifacts such as the all-pages and quality-audit records likewise should not be revived as public content.

### The condition pages are different

Many of the old condition pages are not thin. They are long operational documents, often approximately 43k–46k characters with roughly 13–19 references. Examples examined include Fragile X, autism and Down syndrome, with similarly deep pages across the old library.

Their common operational structure includes:

- functional question and target;
- relevant team;
- entry questions and exclusions;
- assessment options;
- triangulation;
- baseline;
- ICF-style functional register;
- multiple evidence-linked ideas/experiments;
- customizable plan components;
- prerequisites and indications;
- fidelity;
- accommodations/access;
- reassessment;
- stop/escalation rules;
- outcome monitoring;
- plan B and generalization.

These elements contain real reusable value.

## Similarity / duplication analysis

Exact-slug legacy/current condition pairs were compared using PostgreSQL trigram text similarity.

For 47 matched condition pairs:

- average similarity: ~0.428;
- minimum: ~0.360;
- maximum: ~0.510;
- 39 pairs: 0.40–0.55;
- 8 pairs: below 0.40;
- none: >=0.55.

Interpretation: the two generations are not simple copied prose. The old pages contain substantial unique operational detail, while the current capability pages generally use clearer person-centred/access-oriented framing. However, they still answer overlapping search intent for the same named condition. Keeping both as equal indexed canonical libraries would create information-architecture and search-intent competition.

Therefore the correct operation is **selective harvest + canonical consolidation**, not wholesale duplication.

## Legacy modules: value assessment

### `legacy-outside-box-evidence-standard` — KEEP / MERGE, high value

Strong concepts:
- no generalization beyond evidence;
- capacities are not diagnostic stereotypes;
- source type must match claim type;
- explicit uncertainty;
- participation and rights;
- validity/psychometrics/version/language/culture/licensing/accessibility for assessments;
- rejection of stereotypes such as treating a diagnosis as proof of a specific talent.

Relevant sources include WHO ICF, UN CRPD, Standards for Educational and Psychological Testing, COSMIN, ITC and NICE shared decision making.

Destination: current capability methodology + Assessment Lab governance.

### `legacy-outside-box-methodology` — HARVEST, very high value

A large methodology document covering decision-first assessment, multi-source/ICF assessment, person-centred outcomes, safety and consent, hypothesis formation, formal and functional assessment, triangulation, small experiments, repeated measures, shared decisions, goal scaling and tool governance.

It overlaps current `/capabilities/methodology/` and `/capabilities/protocol/`, so republishing the whole legacy document would be redundant. It should remain a source reservoir for systematic enrichment.

### `legacy-outside-box-monitoring-matrix` — MIGRATE, very high value

One of the most distinctive legacy assets. It separates outcome from implementation fidelity and includes baseline, adverse effects, person satisfaction, generalization, decision rules and missing-data/graphing considerations.

Destination: current Ideas page + printables/protocol. The core 2×2 matrix has already been restored to `/capabilities/ideas/`.

### `legacy-outside-box-instruments` — MOVE TO ASSESSMENT LAB, high value

Contains instrument-registry governance: construct, version, population, language, validity/reliability/error, licensing, accessibility/adaptation, review cycle and permitted-use classification. The legacy schema also retained a sizeable tool list.

This should not become a list of copied instruments inside Outside-the-Box. Its governance logic belongs to Assessment Lab where Core Outcome Sets, measurement instruments, psychometrics and Arabic adaptation can be separated correctly.

### `legacy-outside-box-ten-plan-methodology` — KEEP THE LOGIC, NOT THE PUBLIC FORMAT

The legacy idea was effectively `100 conditions × 10 plans = 1000 plan-like instances`. The ten recurring functions covered safety/diagnostic context, shared functional goals, access redesign, communication/choice, several evidence-linked intervention hypotheses, team/fidelity, participation/capability opportunity discovery, maintenance/generalization and reassessment.

The editorial metadata itself does not mark this draft as public-ready. Publishing a thousand apparent plans would also risk pseudo-personalized advice and heavy template duplication.

Destination: convert the ten-plan logic into decision layers/questions rather than ready-made plans. This conversion is now implemented in `/capabilities/ideas/`.

### `legacy-outside-box-review-governance` — MERGE, medium/high value

Useful governance and review logic. Merge into methodology/editorial governance, not a standalone competing public page unless a distinct reader need is demonstrated.

### Legacy root/all-pages/quality-audit artifacts — DO NOT RESTORE

They are program artifacts rather than strong user-facing resources and are weaker than the current program architecture.

## Target architecture

### Canonical public program

`/sectors/capabilities`
→ program/sector landing dynamically connected to real library

`/capabilities/`
→ capability/access reference hub

`/capabilities/registry/`
→ 100 core condition registry

`/capabilities/<condition>/`
→ one canonical condition-level guide

`/capabilities/ideas/`
→ innovation/micro-experiment laboratory

`/capabilities/protocol/`
→ operational protocol

`/capabilities/printables/`
→ worksheets/measurement supports

`/capabilities/methodology/`
→ evidence and governance

### Legacy migration rule

For every `/outside-the-box/<condition>/` page:

1. identify its matching current capability page;
2. diff the operational components, not just prose;
3. harvest genuinely unique useful content into the current canonical page;
4. update sources and remove obsolete/generalized claims;
5. preserve consent, burden, safety and stop rules;
6. verify no protected instrument content is reproduced;
7. only after the harvest is complete, retire/redirect or noindex the legacy route according to the migration policy.

Do **not** redirect the entire old library before this harvest, because many old pages contain unique operational content that is not reproduced in the current page.

## Final value judgement

The original idea absolutely deserves preservation. Its strongest contribution is not “unusual tips”; it is a disciplined way to connect evidence, function, access, small experiments, measurement and person preference to discover better ways of participating in real life.

The part that should be discarded is the old duplicated publication architecture and template-heavy presentation, not the intellectual method.
