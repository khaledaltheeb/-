# Capabilities + Outside-the-Box scientific recovery — final state 2026-09-06

## Governing decision

Both programs remain public, scientific and independent. Search-intent overlap or page competition is **not** a reason to discard useful science.

- `/capabilities/*` — **لنرتقي بقدراتهم**: capability, strengths, access, participation, independence, functional goals, accommodations and person-centred adaptation.
- `/outside-the-box/*` — **خارج الصندوق**: provider decision pathway for assessment, triangulation, baseline, hypothesis, reversible trials, implementation fidelity, burden, outcome measurement, stop/escalation rules, reassessment and generalisation.
- When a condition exists in both programs, the pages are cross-linked. They are not automatically merged, suppressed or redirected into one another.

## Migration principle

The historical repositories are treated as scientific source material, not as presentation templates.

The implementation preserves:

- condition-specific clinical and functional science;
- measurement and assessment logic;
- safety and stop rules;
- access and accommodation reasoning;
- references and source links;
- useful tables, structured blocks and operational decision rules.

It removes or hides reader-irrelevant migration residue such as old production labels, internal review-status text, old edition labels, protocol bookkeeping IDs and navigation artifacts.

The application does **not** copy old rendered HTML back into the current site. Structured records already migrated into the current Supabase content model are the source of truth.

## Final production inventory

Verified directly in production Supabase after the recovery work:

### Outside the Box

- **105** published + indexable pages under `/outside-the-box/*`.
- The previously held scientific condition records for **cerebral palsy**, **hearing loss/deafness** and **vision impairment/low vision** were cleaned and restored.
- Their reader-facing migration artifacts and duplicate legacy reference labels were removed while preserving the scientific body and references.
- Source-only administrative artifacts such as old audit/index bookkeeping pages remain non-reader material.

### Capabilities / لنرتقي بقدراتهم

- **159** published + indexable pages under `/capabilities/*`.
- **129** use the current internal `capabilities-*` slug family.
- **30** retain an immutable historical `legacy-capability-*` database slug because they were already live published records. Their public canonicals are already correct under `/capabilities/*` and are not changed.
- **0** `legacy-capability-*` rows remain draft or archived.
- The 30 immutable live records now have a minimum of **1500 useful words** after scientific capability/access enrichment.
- **0** obsolete internal review-status artifacts remain in those 30 reader bodies.

### Cross-program integrity

- **64** condition routes currently have both a published Capabilities page and a published Outside-the-Box pathway and can cross-link in both directions.
- **0** duplicate published canonicals exist across the two namespaces.

## Recovery of the previously source-only Capabilities set

Twenty preserved Capabilities records that had been held as `SOURCE_ONLY` were scientifically repaired and promoted without creating third copies of the same record.

### Ten with a matching Outside-the-Box scientific pathway

The existing record was converted to the current `capabilities-*` identity, enriched specifically for capability/access use, and its evidence list was expanded from the matching Outside-the-Box record where appropriate:

- Christianson syndrome
- Coffin–Siris syndrome
- Dravet syndrome
- KBG syndrome
- Kleefstra syndrome
- Lennox–Gastaut syndrome
- Mowat–Wilson syndrome
- Phelan–McDermid syndrome
- Pitt–Hopkins syndrome
- SATB2-associated syndrome

Old `merged_into` metadata on Kleefstra and Phelan–McDermid was removed from operational metadata after its previous target was preserved in an audit record. The pages are independent scientific Capabilities pages again.

### Ten without a matching Outside-the-Box pathway

The preserved record itself was repaired and promoted, retaining its authoritative legacy evidence sources and adding a condition-specific functional capability/access layer:

- BPAN / WDR45
- CDKL5 deficiency disorder
- FOXG1 syndrome
- Gaucher disease
- GRIN2B-related neurodevelopmental disorder
- KCNT1-related epilepsy
- Koolen-de Vries syndrome
- Mucopolysaccharidosis type I
- Nicolaides–Baraitser syndrome
- SYNGAP1-related disorder

The old `merged_into` marker on CDKL5 was removed from operational metadata after its previous family-guide target was recorded for provenance.

All twenty were released through the existing migration contract and ledger controls. The quality/release guards were not disabled or bypassed.

## Handling the 30 already-published historical Capability records

Thirty older scientific records were already published and indexable with correct `/capabilities/*` canonicals, but their immutable internal slugs still begin with `legacy-capability-*`.

Changing those slugs would violate the published-content preservation guard and could break live identity. The correct solution is a reader bridge, not a rename.

Added:

- `lib/legacy-capability-live.ts`

Updated:

- `app/capabilities/[slug]/page.tsx`

The current resolution order is now:

1. current `capabilities-*` database record;
2. published immutable `legacy-capability-*` database record with the same `/capabilities/<route>/` canonical;
3. historical static preserved snapshot only when neither live database record exists.

This means the 30 pages are now rendered from their structured live scientific records by the modern `CapabilityArticlePage` instead of falling back to an old static snapshot.

The 30 records were also cleaned of obsolete review-status text. Twenty-six that were below the current 1500-word Capabilities depth floor received an explicit, scientifically framed **capability/access layer** covering baseline measurement, one-factor access trials, AAC, safety, outcome measurement, generalisation and continue/modify/stop decisions. Seven of the thinnest records received additional condition-specific functional material to ensure the final depth floor was genuinely met rather than padded.

## Outside-the-Box current-content layer

`lib/outside-the-box.ts` loads only published/indexable scientific records and provides:

- scientific record lookup;
- reader-safe cleanup of migration residue;
- methodology vs condition classification;
- reference preservation;
- matching Capabilities sibling resolution.

`components/outside-the-box-page.tsx` provides the current scientific hub and article view.

`app/outside-the-box/[[...slug]]/page.tsx` now reads the structured current scientific records instead of rendering raw legacy snapshots.

## Cross-linking model

The two programs answer different questions for the same diagnosis.

**لنرتقي بقدراتهم** asks:

> What can this person do, what may be hiding that ability, what access change is worth testing, and does the result improve real participation or independence?

**خارج الصندوق** asks:

> How should a provider formulate, test, measure and safely accept, modify or reject an intervention/access hypothesis?

A matching route is therefore a related scientific pathway, not a duplicate to suppress.

## Quality and governance retained

The migration did not disable content safeguards. The following remained active:

- published-content identity preservation;
- legacy migration release contract;
- migration ledger binding;
- authoritative-reference requirements;
- taxonomy validity;
- SEO title/description constraints;
- Capabilities depth guard for newly promoted current slugs;
- body-text/body-JSON render parity;
- canonical uniqueness.

For the twenty newly promoted records, the migration ledger was updated only after scientific cleanup and validation, then the normal publish guards were allowed to approve or reject the release.

## Sitemap behavior

No special sitemap alias is required. The current content sitemap is canonical-driven and includes published, indexable database records. Both the current-slug and immutable-legacy-slug Capability records therefore emit their existing `/capabilities/*` canonical rather than an internal database slug route.

## Final acceptance criteria

At completion:

- Outside-the-Box indexable pages: **105**
- Capabilities indexable pages: **159**
- Capabilities immutable legacy-slug records still live: **30**
- Unpublished `legacy-capability-*` records: **0**
- Minimum useful words across the 30 bridged live records: **1500**
- Obsolete internal review artifact count: **0**
- Cross-linked condition-route pairs: **64**
- Duplicate published canonicals across the two programs: **0**

The scientific recovery is therefore considered structurally complete. Future work on either program should enrich or update science in place and must not reintroduce the former rule that page competition alone is sufficient reason to merge, suppress or discard scientifically distinct material.
