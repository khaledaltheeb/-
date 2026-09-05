# Gold-standard condition content contract — 2026-09-06

## Purpose

This is the publication contract for every condition page in the **لنرتقي بقدراتهم** and **خارج الصندوق** programs. Page length is not a quality metric. A page passes only when its condition-specific science can change a real assessment, access, safety, monitoring or participation decision.

## Non-negotiable rule

A page must not be called rich, complete or gold-standard because it contains many words, many headings, generic ICF language, a shared rehabilitation template, or a long list of general references.

The page must answer the condition-specific question:

> What can hide this person's actual ability, what safety/medical variables can distort performance, what evidence-informed hypotheses are worth testing, how do we test them fairly, and what result changes the next decision?

## Required evidence architecture

Every condition page must include, when applicable:

1. **Condition-defining evidence** — authoritative disease-specific review, GeneReviews/consensus/major clinical reference, or an equivalent source.
2. **Recent evidence search** — targeted search for systematic reviews, cohorts, natural-history studies, trials, registries and clinically meaningful studies. Recent evidence is preferred, but older seminal evidence is retained when it still defines the field.
3. **Direct condition references** — not merely WHO/ICF/ASHA/general rehabilitation sources. General sources can support methodology but cannot substitute for condition science.
4. **Evidence hierarchy** — distinguish guideline/consensus, systematic review, prospective cohort, retrospective cohort, case series, case report, mechanistic/preclinical work and expert opinion.
5. **Uncertainty statement** — rare-disease evidence must not be presented with certainty greater than the underlying study design permits.
6. **No therapeutic extrapolation** — observational drug responses, N-of-1 work, case series or preclinical findings are research evidence, not automatic treatment recommendations.

## Required condition-specific scientific layers

### A. Strategic clinical-functional insight

Each page must identify the highest-value condition-specific insight. Examples:

- expressive language may substantially underrepresent cognition;
- motor access may invalidate a conventional cognitive response format;
- seizures or postictal states may make a session score uninterpretable;
- sleep change may be an early warning for a syndrome-specific regression phenotype;
- genotype/subtype may alter surveillance or functional expectations;
- pain expression may be atypical and require a different safety strategy.

This insight must drive the page structure.

### B. What can hide ability?

Identify the condition-specific barriers that can make the person appear less capable than they are. Consider:

- expressive speech;
- fine/gross motor access;
- ataxia/hypotonia/dystonia;
- vision/hearing;
- fatigue/sleep;
- seizures/recovery;
- pain/illness;
- sensory environment;
- task design;
- learned prompt dependence;
- anxiety/behavior as communication;
- language/cultural mismatch;
- inappropriate psychometric instrument or response format.

Do not include a barrier unless it is plausible for that condition or clearly framed as an individual factor to test.

### C. Safety gate before performance interpretation

Before interpreting a low score or behavioral change, specify what needs exclusion or escalation in that condition. Red flags must be condition-specific whenever the literature supports them.

### D. Fair functional baseline

A gold page defines what should be measured before changing the plan. Baseline must include more than a test score. It should capture relevant combinations of:

- independent success / opportunities;
- assistance and prompt level;
- response latency;
- access method;
- context and partner;
- seizure/sleep/pain/medication context;
- burden, discomfort and refusal;
- participation;
- real-world generalization.

### E. Condition-specific hypothesis tests

Every gold page needs reversible, low-risk experiments that answer a real question. Examples:

- same concept, different response-access method;
- same task, reduced motor demand;
- same target, AAC versus speech-only response;
- different timing relative to fatigue/seizure recovery;
- one environmental accommodation at a time;
- one prompt-fading change at a time;
- one partner-training change at a time.

Experiments must not become unlicensed medical treatment trials.

### F. Strength/capability discovery strategy

The page must explicitly describe how to identify and develop the person's strongest usable channels without stereotyping the diagnosis. Required principles:

- strengths are demonstrated at the individual level;
- preference and consent matter;
- a strength should generalize or produce meaningful participation;
- speed is not equal to competence;
- communication access is part of cognition access;
- supports are not evidence that the underlying capacity is absent;
- independence can be partial and domain-specific.

### G. Development across the lifespan

Where evidence exists, cover childhood, adolescence, adulthood, transition, maintenance and risk of regression or emerging adult health issues. Do not end the pathway at school age.

### H. Measurement and decision rules

Every page must make it possible to decide among:

- continue;
- modify access;
- modify dose/intensity of a nonmedical support;
- simplify burden;
- generalize;
- maintain;
- stop;
- refer/escalate for medical/specialist evaluation.

A vague statement such as “monitor progress” does not pass.

## Anti-filler rules

The following do **not** count as condition-specific scientific richness when copied across pages:

- generic entry questions;
- generic ICF explanations;
- generic triangulation prose;
- identical baseline rules;
- identical 0/2/6/12/24-week tables;
- identical fidelity paragraphs;
- generic “family/team” lists;
- repeated generic emergency disclaimers;
- repeated reference summaries already represented in the structured reference section;
- generic AAC, UDL or inclusion prose with no condition-specific decision attached;
- statements whose only purpose is increasing word or character count.

Shared methodology belongs in the central methodology pages and should be linked, not copied.

## Minimum evidence gate for a GOLD label

A public condition page may carry the internal `gold_standard_upgrade=true` marker only when:

- it has a clearly condition-specific strategy;
- direct condition science materially outweighs boilerplate;
- major claims are represented in `references_json` by direct scientific sources;
- the latest meaningful literature has been searched through the recorded review date;
- study design and uncertainty are stated correctly;
- safety and stop/escalation rules exist;
- at least one strength/capability discovery strategy exists;
- at least three meaningful condition-specific hypothesis tests or equivalent decision modules exist;
- adolescent/adult implications are considered where evidence permits;
- no external endorsement or clinical accreditation is implied.

There is **no fixed word-count minimum**. A 2,500-word page in which every section changes a decision is preferable to a 7,000-word page containing 4,000 words of shared scaffolding.

## Source preservation

Legacy source content is not silently destroyed. For migrated Outside-the-Box pages, the original material remains recoverable in `private.legacy_migration_items` and the retained migration corpus. The public `content` row may therefore be rewritten cleanly instead of carrying legacy padding forward.

## First conversion batch completed

The first five former DEEP Outside-the-Box pages were rebuilt under this contract on 2026-09-06:

- `legacy-outside-box-cri-du-chat-syndrome`
- `legacy-outside-box-kleefstra-syndrome`
- `legacy-outside-box-christianson-syndrome`
- `legacy-outside-box-coffin-siris-syndrome`
- `legacy-outside-box-dup15q-syndrome`

These rewrites replaced the legacy 380+ block public bodies with compact condition-specific evidence pathways and upgraded direct scientific references. They do not claim external endorsement.

## Working order for the remaining corpus

1. Outside-the-Box pages rated DEEP in the 2026-09-06 specificity audit.
2. Outside-the-Box pages rated ENRICH.
3. Capabilities pages rated DEEP.
4. Capabilities pages rated ENRICH.
5. Re-audit STRONG pages for evidence freshness and lifespan gaps; STRONG does not mean permanently finished.

The end state is not “all pages are long.” The end state is: **every page contains a defensible, current, condition-specific strategy capable of revealing function, protecting safety and improving the quality of the next decision.**
