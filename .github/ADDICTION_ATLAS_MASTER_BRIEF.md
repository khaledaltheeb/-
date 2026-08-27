# ADDICTION ATLAS — MASTER AGENT BRIEF

> **INTERNAL AGENT DOCUMENT — NOT SITE CONTENT**
> Repository: `khaledaltheeb/-`
> Sector: Addiction / الإدمان
> Status: authoritative handoff brief. Preserve this document, `docs/.addiction-atlas-continuity.md`, and `docs/.addiction-atlas-production-state.md` when extending the atlas. The production-state file is authoritative for the latest proven counts and release evidence.

## 1. Mission
Build the **الأطلس العربي التفاعلي للمواد ذات التأثير النفساني والإدمان** as a world-class Arabic public-health, clinical-education and research knowledge system. It is not a shallow list or a single danger score. It must function as a structured evidence database, interactive search/filter/sort interface, substance encyclopedia, compare-two-substances tool, curated SEO comparison library, reviewed interaction registry, epidemiology/mortality evidence surface and printable professional reference.

Never delete, hide, noindex or lose useful existing published pages while implementing this project.

## 2. Scientific integrity
Keep risk dimensions separate. At minimum preserve: acute toxicity, overdose risk, dependence, medical withdrawal risk, neurological harm, cardiovascular harm, respiratory harm and polysubstance risk. Do not sum or average them into a universal danger score.

Never invent percentages, first-use addiction probabilities, first-dose death risks or recovery difficulty numbers. If a source does not support a numerical estimate for a defined population/context, state uncertainty instead. `null` is a valid scientific result and must not be replaced by a guessed number.

Evidence certainty must be visible. The overall evidence grade for a substance is not a substitute for claim-level or axis-level evidence. Different risk axes may have different grades. A regulatory scheduling decision is evidence of regulatory/public-health concern in its stated context, not a license to manufacture potency ratios or unmeasured organ-risk scores.

## 3. Naming and search model
Every substance page must show, when applicable:
- Arabic display name.
- English display name.
- Common name when materially different.
- Scientific/chemical name when useful.

Maintain internal search aliases for Arabic-script transliteration of English names, Arabic/English variants, misspellings, spacing/hyphen variants and legacy spellings. Use them for search resolution, typo correction, autocomplete, analytics and canonical routing. Never emit invisible keyword blocks, `display:none` aliases, off-screen keyword spam or mass misspelling pages. Alternate spellings must resolve to one canonical substance URL.

Canonical substance pattern: `/addiction/substances/{canonical-slug}/`.

## 4. Substance page content
Where evidence exists, support:
- identity/classification and legitimate medical use;
- physical forms with an explicit warning that appearance does not prove identity, purity or concentration;
- mechanism of action;
- acute effects;
- serious single-exposure harm;
- dependence and tolerance;
- withdrawal and its medical danger;
- neurological, cardiovascular, respiratory and other organ harms where supported;
- treatment/recovery;
- emergency warning signs and specific response where applicable;
- special-population evidence when available;
- mortality/epidemiology only with year + geography + metric definition + source;
- sources, evidence grade, review date and Rawafid review provenance.

Do not publish use-dose instructions, mixing recipes, intoxication optimization, home antidote recipes or self-managed dangerous withdrawal schedules.

## 5. Axis-level evidence ledger
The atlas must progressively maintain evidence at the **risk-axis level**, not only at the substance level. For each reviewed axis store:
- the published ordinal score or `null`;
- independent evidence grade A/B/C/U;
- source IDs;
- exposure/context statement;
- concise scientific rationale.

`U` means the evidence is insufficient for a responsible ordinal estimate and therefore the score must stay `null`.

Current production-proven minimum after wave 7: **35 substances × 8 axes = 280 reviewed evidence cells**. Do not regress this floor. Historical wave 6 counts of 21 substances / 168 cells remain release history only.

Substance pages with reviewed axis evidence must expose the evidence behind each axis, including named source links. Pages without claim-level review must state that clearly rather than silently inheriting stronger certainty.

## 6. Compare two substances
Comparison is a primary product feature. It must support selection/search, swap, stable shareable URLs, links to both substance pages, print and excellent mobile/RTL behavior.

Never conclude automatically that one substance is globally “safer”. Synthesis must remain axis-specific and must preserve uncertainty.

Curated comparison pages are an SEO/content strategy only when genuine search/educational intent exists and the page contains unique comparative synthesis. Do not generate all pairwise combinations. Maintain one canonical pair ordering and prevent duplicate A-vs-B / B-vs-A index pages.

Core intents include fentanyl vs heroin, cocaine vs methamphetamine, tramadol vs morphine, cannabis vs synthetic cannabinoids, kratom vs concentrated 7-OH, cannabis vs HHC, and phenibut vs gabapentin.

## 7. Interaction layer
The interaction surface is a **reviewed evidence registry**, not a mixing checker. It must never generate unreviewed pair conclusions algorithmically.

Every interaction record must identify:
- both canonical substance slugs;
- severity category;
- evidence grade;
- evidence scope: `direct-pair`, `class-to-substance`, or `class-to-class`;
- mechanism/risk explanation;
- emergency interpretation;
- direct source URLs.

Absence of a pair from the registry never means that the combination is safe. Class-level warnings must not be described as pair-specific evidence.

Current production-proven minimum after wave 7: **11 reviewed interactions**, including the reviewed carisoprodol interactions with fentanyl, diazepam and alcohol while preserving all prior records.

## 8. Epidemiology and mortality
Every numerical record must preserve year, geography, population/scope where relevant, metric definition and resolvable source ID. Never transfer a class-level prevalence number to an individual substance without explicit mapping. Never present US-only surveillance as global.

Separate direct poisoning/overdose deaths, deaths where a substance is involved/contributory, attributable burden, poison-center exposure reports, and reported case outcomes. Do not collapse these definitions.

Wave 7 adds phenibut poison-center surveillance. The cumulative 2009–2019 count of 1320 reported exposures is **not prevalence**. The 12.6% major-effects share is a share among reported exposure cases, not a personal risk probability. The three deaths in the same surveillance source are not national phenibut mortality.

## 9. Data architecture and ownership
The atlas uses a local historical snapshot pinned to source commit:
`00014486191027349cc083e824e545da186d74d1`.

Runtime code must not fetch the old repository or a moving source `main` branch. Substance waves are manifest-driven. Evidence, interactions, epidemiology, mortality and source registries must remain source-resolvable and validated together.

The historical vendoring script is allowed to refresh only legacy pinned files with known hashes. It MUST NOT overwrite repository-owned extension manifests `substance-waves.json` or `risk-evidence-manifest.json`. Extension waves, comparison extensions, interactions, source registries and statistics files are additive local layers.

### Current production-proven baseline — wave 7
- 71 substance/family records.
- 7 registered substance waves.
- 37 editorial indexable comparison pages.
- 8 independent risk dimensions.
- 11 reviewed interactions.
- 35 substances / 280 axis-evidence cells.
- 9 epidemiology/surveillance records.
- 8 mortality records.

Wave 7 new substances are: `7-hydroxymitragynine`, `phenibut`, `hexahydrocannabinol-hhc`, `carisoprodol`, `protonitazepyne`, `metonitazepyne`, `etonitazepipne`, `n-desethyl-isotonitazene`, `3-oh-pcp`, `n-ethylheptedrone`, `isotonitazepyne`, `n-desethyl-etonitazene`, `mdmb-fubinaca`, and `cychlorphine`.

`cychlorphine` is an early-warning item based on an EUDA initial report. Until stronger evidence exists, all eight risk scores must remain `null` and all eight axis grades `U`; the fact that it is classified as an emerging opioid is not enough to manufacture numeric scores.

The current production proof, exact release run IDs and deployment notes live in `docs/.addiction-atlas-production-state.md`. Future work starts from that production floor, not from historical 54/57-substance checkpoints.

## 10. Required publication surfaces
- `/addiction/`
- `/addiction/substances/`
- `/addiction/substances/[slug]/`
- `/addiction/compare/`
- `/addiction/compare/[slug]/`
- `/addiction/interactions/`
- `/addiction/prevalence/`
- `/addiction/mortality/`
- `/addiction/methodology/`
- `/sitemaps/addiction-atlas.xml`

The addiction sector navigation should expose the atlas, comparisons, reviewed interactions, prevalence, mortality and methodology. All relevant evidence/comparison pages should remain printable in RTL A4.

## 11. SEO rules
Use canonical URLs, indexable high-value pages, correct internal linking, sitemap coverage, structured data where valid, natural Arabic terminology and internal aliases for query resolution. Never use hidden text, keyword stuffing, doorway pages, scaled thin comparisons or duplicate misspelling pages.

All published pages remain `index,follow` unless there is a specific documented reason otherwise; atlas work itself must not introduce `noindex` to useful published content.

## 12. Validation and release
`npm run addiction-atlas:validate` is mandatory. It must validate record counts, slugs, eight-axis completeness, value ranges, source resolution, interaction integrity, statistics context, axis-level evidence traceability, uncertainty/null semantics, duplicate comparison/interaction pairs and protection against legacy-manifest overwrite.

Repository TypeScript, lint, architecture/preservation checks, OpenNext build and Wrangler dry-run must pass before staging is treated as verified. Production must not be described as updated until deployment and live checks complete.

Wave 7 passed the release contract with:
`71 substances | 37 comparisons | 11 interactions | 35 axis-evidence substances / 280 cells | 8 risk dimensions | 9 epidemiology | 8 mortality`.

The wave 7 runtime release was deployed to Cloudflare from commit `0ecec5dc702d8679aa8b510e6da5660948bcf9cc`. The marker-by-marker stabilized live diagnostic and the permanent independent production verifier both subsequently passed. This makes wave 7 the current proven production baseline.

If another sector breaks a repository-wide gate, identify it precisely and do not misattribute it to the atlas. Do not silently weaken atlas contracts to make unrelated CI failures disappear.
