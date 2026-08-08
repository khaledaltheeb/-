# MIG-000012 — الإحساس

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **DRAFT QA PASS — WORKFLOW / POST-PUBLISH QA PENDING**
- Canonical key: `sensation`
- Canonical: `/content/sensation`
- Content type: `glossary_term`
- Supabase content id: `3cbe1ff6-b61b-49a8-9ade-1c053fff2da6`
- Current version: **v1**
- Database status: `draft`
- Sector/category: `knowledge` / `cognitive-processes`

## Legacy discovery and canonical decision

Literal searches in the old repository did **not** verify a standalone legacy page named `الإحساس / sensation`. This record therefore does not pretend that a nonexistent page was copied.

What is verified is a broad sensory/access cluster in the legacy repository, including:
- `content/v280/profiles/sensory-communication.json`
- `content/v280/evidence/sensory-communication-ar.json`

That legacy cluster contains structured material about visual, auditory and combined sensory/access conditions and repeatedly separates access barriers from cognition/intelligence. The general sensation page is therefore a **synthesized parent glossary concept** built from scattered legacy sensory knowledge plus authoritative general neuroscience/psychology sources.

The following remain separate entities and are not redirected blindly:
- `/content/perception`
- sensory-processing differences/disorders
- autism sensory pages
- vision/hearing/touch modality pages
- pain
- interoception-specific pages
- specialized sensory assessment/tools

## Authoritative sources

1. APA Dictionary of Psychology — Sensation (2018).
2. NCBI Bookshelf / Neuroscience — Sensation and Sensory Processing.
3. NCBI Bookshelf / Neuroscience — Cutaneous and Subcutaneous Somatic Sensory Receptors.
4. APA Dictionary — Absolute Threshold (2018).
5. APA Dictionary — Weber’s Law (2018).
6. Signal detection theory and vestibular thresholds: I. Basic theory and practical considerations (2011).
7. NIH Blueprint for Neuroscience Research Initiative on Interoception (reviewed 2026).
8. Proske & Gandevia — The proprioceptive senses (2012).

All stored source URLs are HTTPS.

## Content coverage

- scientific meaning of sensation versus everyday Arabic “feeling”
- sensation versus perception
- sensory transduction from stimulus energy/state to neural signal
- encoding intensity, duration and location
- external sensory systems
- somatosensation and proprioception
- vestibular information
- interoception/internal bodily signals
- why “five senses” is an educational shorthand rather than a complete scientific inventory
- psychophysics
- absolute threshold as a probabilistic estimate
- difference thresholds and Weber’s law with explicit limits
- signal detection theory: sensitivity versus response criterion
- hits, misses, false alarms and correct rejections
- sensory adaptation and distinction from broader behavioral habituation
- effects of attention/expectation on sensory reports without reducing sensation to imagination
- sensory sensitivity as a description, not a diagnosis
- sensory access versus cognitive ability
- responsible sensory measurement
- common misconceptions and 11 visible FAQ items

## Draft QA — verified directly from Supabase

- Searchable useful words: **2305**
- Structured blocks: **52**
- H2: **16**
- H3: **4**
- FAQ: **11**
- Tables: **3**
- Lists: **1**
- References: **8**, all HTTPS
- Tags: **7**
- Category relations: **1**
- Search aliases: **6**
- Duplicate canonical: **0**
- Versions before workflow: **1**

Internal/public-body scan:
- TODO: PASS
- FIXME: PASS
- Canonical: PASS
- Redirect: PASS
- migration/agent language: PASS
- banned term `معاقين`: PASS

## SEO

- Primary entity: `الإحساس`
- SEO title: `الإحساس: الحواس والتحويل العصبي وقياس العتبات`
- SEO title length: **45 chars**
- Meta Description length: **152 chars**
- Canonical: `/content/sensation`
- Search intent: `informational`
- Visible FAQ → FAQPage schema
- `glossary_term` → DefinedTerm schema

## Redirect decision

No verified standalone old sensation URL exists, so no redirect has been invented. Distinct sensory/access pages remain independent.

## Remaining before COMPLETE

1. Run the actual database workflow through Scheduled → Published.
2. Verify search `الإحساس` ranks `/content/sensation` first.
3. Verify search `الإدراك` continues to rank `/content/perception` first and the two concepts remain semantically distinct.
4. Confirm duplicate canonical = 0 and no redirect collision from sensory/perception routes.
5. Close Claim #19 and update the central ledger.
