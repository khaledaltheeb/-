# Capabilities + Outside-the-Box scientific recovery — 2026-09-06

## Final architectural decision

Both programs remain public and independent. Search-intent overlap is not a reason to discard useful science.

- `/capabilities/*` = **لنرتقي بقدراتهم**: capability, strengths, access, participation, functional goals and person-centred adaptation.
- `/outside-the-box/*` = **خارج الصندوق**: provider pathway for assessment, triangulation, baseline, hypothesis, reversible trials, implementation fidelity, burden, outcome measurement, stop/escalation rules, reassessment and generalisation.
- When the same condition exists in both programs, the two pages are cross-linked rather than merged or suppressed.

## Source repositories and provenance

The earlier scientific sources were found in the previous repository `khaledaltheeb/healthrenewal.org`, including:

- `content/v254/outside-the-box-conditions-ar.json`
- `content/v280/capabilities-100-ar.json`

The current repository `khaledaltheeb/-` already contains the preserved production migration corpus under `data/legacy-production-batches/*`, and the migrated records are also stored in Supabase with body JSON/text, references, canonicals and migration provenance.

The implementation therefore does **not** copy rendered HTML snapshots back into the application. It promotes the structured scientific records already migrated into the current data model and renders them through the current content system.

## Inventory verified in current Supabase

### Capabilities

- 155 migrated legacy records.
- 155 contain body content.
- 151 contain references.
- approximately 307,626 source words in the preserved migrated family.
- 134 are currently published/indexable.
- 21 remain draft/archive/source-only and are not treated as publication-ready science merely because they existed historically.

### Outside the Box

- 109 migrated legacy records.
- 109 contain body content.
- 102 contain references.
- approximately 738,172 source words in the preserved migrated family.
- 102 scientific records are currently published/indexable.
- source-only administrative artifacts such as the old root, all-pages, quality-audit and ten-plan draft are not restored as reader-facing science.

Three condition records (cerebral palsy, hearing loss/deafness and vision impairment/low vision) are preserved but not currently publication-ready. They remain held for scientific/editorial repair rather than being force-published.

## Scientific material retained

The Outside-the-Box condition pathways retain substantive operational science, including where available:

- functional question and meaningful target;
- relevant team and entry questions;
- exclusions and safety checks;
- initial/comprehensive assessment;
- measurement-instrument governance and licensing boundaries;
- triangulation across sources and contexts;
- baseline measurement;
- ICF-style functioning and participation framing;
- evidence-linked intervention or access hypotheses;
- reversible small trials;
- prerequisites and indications;
- dose/frequency or implementation schedule where justified;
- implementation fidelity;
- accommodations and access;
- outcome indicators and adverse effects;
- reassessment schedule;
- stop/escalation rules;
- maintenance, generalisation and plan B;
- references and source links.

## Non-scientific migration artifacts removed from reader rendering

The current Outside-the-Box renderer removes historical migration/editorial residue such as:

- `الحالة X من 100` production labels;
- numbered `البوابة الأولى/الثانية...` navigation artifacts;
- old internal edition strings such as `الطبقة التشغيلية الموسعة · الإصدار ...`;
- protocol IDs used only for legacy production bookkeeping;
- legacy review-status/navigation prompts that do not add scientific content;
- migration metadata objects.

Scientific headings, tables, protocols, measurements, references, warnings, decision rules and evidence are preserved.

## Current implementation

### Outside-the-Box current-content layer

Added `lib/outside-the-box.ts` to:

- load only published/indexable current scientific records (`legacy-outside-box-*`) from `public.content`;
- sanitize non-reader migration residue while keeping scientific content;
- build the scientific index from actual published records;
- classify methodology vs condition pathways;
- preserve and render references;
- resolve the matching Capabilities page for cross-linking.

Added `components/outside-the-box-page.tsx` to provide:

- a new scientific `/outside-the-box/` hub;
- methodology/evidence/monitoring/instrument-governance entry points;
- a condition library generated from the scientific records;
- current article rendering with sources and methodological disclaimer;
- direct links to matching `لنرتقي بقدراتهم` pages.

Updated `app/outside-the-box/[[...slug]]/page.tsx` so that the public route no longer renders the raw preserved legacy snapshot. It now renders structured current scientific records. Non-scientific/source-only legacy paths are not promoted through this route.

### Capabilities cross-linking

Updated `app/capabilities/[slug]/page.tsx` and `components/capability-article-page.tsx` so each published Capabilities condition can resolve and display its matching Outside-the-Box scientific pathway.

The Capabilities navigation now distinguishes:

- `/capabilities/ideas/` = small idea/experiment laboratory;
- `/outside-the-box/` = full scientific provider pathways.

Updated `/sectors/capabilities` to expose both programs explicitly and explain their different scientific roles.

## Publication rule for preserved drafts

Historical existence is not sufficient for publication.

A preserved legacy page can contribute scientific material when its claim/source pairing is useful, but a draft/archive record remains held if it is thin, under-referenced, contains unresolved migration cleanup, or is marked `publication_ready=false`. The material can be harvested during enrichment without force-publishing the old record.

This applies especially to the 21 non-published Capabilities legacy records and the three non-published Outside-the-Box condition records identified in this review.

## Result

The old science is not discarded and is not reduced to redirects. Both intellectual programs survive:

1. **لنرتقي بقدراتهم** asks what capability, access or participation can be revealed or strengthened for this person.
2. **خارج الصندوق** asks how a provider can formulate, test, measure and safely accept/reject an intervention or access hypothesis.

They can discuss the same diagnosis from different scientific questions, and the application now links those questions directly rather than treating one program as a duplicate of the other.
