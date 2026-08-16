# Rawafid V3 — Full Legacy Migration Quality Policy

## Objective

Migrate the useful knowledge, editorial value, evidence, SEO signals, media context, taxonomy intent, and historical route evidence from `khaledaltheeb/healthrenewal.org` into Rawafid V3 without blindly publishing every legacy file.

The legacy repository is a source archive. Presence in the repository does **not** imply publication eligibility.

## Non-negotiable distinction: preservation vs publication

Every discoverable legacy artifact must be accounted for in the migration ledger. Publication is a separate decision.

A legacy artifact may be preserved without being exposed publicly. This is required for development notes, design-system documentation, baseline-only pages, scaffolding, test fixtures, temporary explanations, placeholder pages, obsolete generated shells, and other non-editorial material.

No useful information may silently disappear. No non-editorial development material may be published merely because it exists in the source repository.

## Migration states

Every legacy artifact must end in exactly one reviewed state:

- `PUBLISHABLE`: editorial page/content entity suitable for migration after quality checks.
- `PUBLISHABLE_AFTER_REPAIR`: valuable content exists, but accuracy, completeness, structure, references, SEO, accessibility, or rendering must be repaired before publication.
- `MERGE_SOURCE`: contains useful unique information that must be merged into another canonical content entity before the source itself is retired from publication consideration.
- `SOURCE_ONLY`: useful historical/editorial source material retained for provenance but not itself a public page.
- `DEVELOPMENT_ONLY`: development, design, implementation, deployment, prompt, workflow, test, or engineering material; never public content.
- `BASELINE_ONLY`: baseline/scaffold/template/demo/skeleton material with insufficient standalone user value; never public until substantially rewritten and re-reviewed.
- `DUPLICATE_NO_UNIQUE_VALUE`: duplicate with no unique useful information after comparison.
- `REJECTED`: unsuitable for publication with a recorded reason.

A migration is incomplete while any artifact remains `UNRESOLVED`.

## Hard publication exclusions

The migration pipeline must block public release when content is primarily any of the following:

- design-system notes, visual tokens, color/spacing/typography explanations, component usage notes;
- developer notes, implementation instructions, deployment notes, repository instructions, GitHub workflow prose, CI/CD text, environment-variable explanations;
- prompts, agent instructions, generation instructions, editorial work orders, TODO/FIXME notes, migration notes;
- baseline, scaffold, skeleton, starter, demo, mock, preview, sample, fixture, test, placeholder or temporary pages;
- pages whose visible content is predominantly navigation chrome, cards, placeholders, counters, or empty sections without substantive editorial value;
- pages that explicitly describe themselves as an internal draft, baseline, template, design preview, development page, staging page or test page;
- generated shells whose unique body does not answer a real user/search intent;
- obsolete authentication/account implementation documentation that is not user-facing help content;
- internal operational content that exposes implementation details, secrets, private endpoints, admin procedures or unsafe operational information.

Keyword detection is only a triage signal. A page must not be rejected solely because an ordinary editorial sentence contains a word such as “تصميم” or “تطوير”. Classification must use path, title, metadata, DOM/body structure, content ratios, and surrounding context.

## Publication quality gates

### 1. Editorial purpose

A public page must have a defined audience, user need, and search/information intent. It must provide substantive standalone value rather than merely linking elsewhere.

### 2. Completeness

Preserve all unique useful facts, explanations, caveats, examples, tables, lists, references, and media context from genuine historical variants before consolidation.

Do not impose a word-count target as filler. Thin pages are flagged for repair when they do not adequately satisfy their intent.

### 3. Accuracy and evidence

Health, psychology, medical, therapeutic, diagnostic, assessment, medication, crisis, prognosis, prevalence and other YMYL claims require evidence review appropriate to the claim.

Before approval/publishing, verify:

- claims are not materially outdated or misleading;
- diagnostic and treatment language does not imply an individual diagnosis;
- uncertainty and evidence limitations are represented when relevant;
- references actually support the claims they accompany;
- primary/authoritative sources are preferred where feasible;
- no unsafe medication dosing or treatment instruction is introduced without appropriate qualified context;
- stigmatizing or unsupported language is removed or corrected without deleting valid historical meaning.

### 4. Source preservation

For every migrated or merged entity, record source repository, source commit/ref, source path, historical URL(s), source canonical (if any), extraction hash, and migration decision.

The old repository remains read-only historical evidence until the reviewed migration ledger reaches full coverage.

### 5. SEO preservation and repair

Evaluate and carry forward useful SEO signals rather than blindly copying them:

- title/H1 relationship;
- meta description;
- canonical intent;
- index/noindex intent;
- structured data that still matches the new content;
- historical URL and internal link evidence;
- image alt text and media context;
- topical entities, questions and semantic terms;
- internal-link relationships.

Do not import spammy, duplicated, obsolete or development-oriented metadata merely because it existed historically.

### 6. Taxonomy

Every publishable entity must map to the correct V3 sector/category/content type. Do not create duplicate categories to mirror legacy directory noise. Preserve meaningful information architecture while consolidating obsolete technical folder structure.

### 7. Accessibility and presentation

Public rendering must use the V3 design system only. Legacy CSS, JS, layouts, headers, footers and component styling are source-excluded.

Verify heading hierarchy, RTL, tables, lists, link labels, image alt text, contrast, keyboard/focus behavior where applicable, and mobile rendering.

### 8. Release status

Imported content enters as non-public/draft. It may not become approved/published until migration classification, editorial quality, scientific/YMYL checks where applicable, SEO, taxonomy, source provenance, media and rendering gates pass.

## Baseline-only rule

A baseline page is not automatically content.

A legacy artifact must be classified `BASELINE_ONLY` when its dominant purpose is to establish a layout, minimum structure, sample content shape, placeholder copy, starter shell, design comparison, generated template, or implementation checkpoint and it lacks sufficient unique user-facing knowledge.

If a baseline contains useful facts, extract those facts into a `MERGE_SOURCE` or repaired canonical page; do not publish the baseline wrapper.

## Development/design text contamination rule

The extractor must distinguish editorial body from page chrome and implementation prose. The public payload must exclude text originating from script/style/template/debug/development regions and known internal-only blocks.

Suspicious content is quarantined for review when phrases or structural evidence indicate internal instructions, implementation notes, placeholder copy, environment/setup text, agent prompts, test descriptions or design commentary.

## Quality scoring is advisory, hard gates are authoritative

Automated scoring may prioritize review but must not replace hard publication rules. A high-scoring page can still be blocked for scientific inaccuracy, development contamination, duplicate intent, unsafe claims or incorrect taxonomy.

## Completion criteria

The full-site merger is complete only when:

- 100% of discoverable legacy artifacts are present in the migration ledger;
- `UNRESOLVED = 0`;
- every public legacy knowledge page has its useful information preserved in an approved V3 entity or an explicitly reviewed consolidation;
- every excluded artifact has a reason and remains recoverable from source provenance;
- no development/design/baseline material is unintentionally indexable;
- no published page fails scientific/YMYL, SEO, taxonomy, accessibility or source-provenance gates;
- duplicate canonical entities and broken internal destinations are resolved;
- final coverage reports are reproducible from the pinned legacy source revision.

## Safety rule

Never trade completeness for speed by bulk-publishing the legacy repository. Speed comes from deterministic extraction, automated classification, batch review, reusable validators and idempotent imports—not from bypassing review.
