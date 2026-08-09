# MIG-A4-000054 — talking-to-child-about-mental-health

- **Lane:** A4 — الطفل والأسرة والمدرسة
- **Claim:** #166
- **Canonical key:** `talking-to-child-about-mental-health`
- **Final canonical:** `/content/talking-to-child-about-mental-health`
- **CMS content ID:** `9d71a801-44e8-46ad-b1f7-18b35dfdc60f`
- **Final status:** `published`
- **Legacy predecessor:** `/quick-info/explain-mental-health-to-child/`
- **Redirect:** `/quick-info/explain-mental-health-to-child/` → `/content/talking-to-child-about-mental-health` — 301 active

## Discovery and scope

Pre-claim searches covered GitHub Issues, `docs/MIGRATION-PROGRESS.md`, and Supabase using the slug, canonical concept, Arabic synonyms and English synonyms. No competing child-focused canonical was found. Broad mental-health foundations and clinical/appointment pages remain separate.

This page belongs to A4 because its central intent is parent/child communication and age-appropriate mental-health literacy, not psychiatric diagnosis. Diagnosis-specific interpretation remains outside A4 and should be handled through clinical/A1 content.

## Legacy/history audit

The verified legacy source is `khaledaltheeb/healthrenewal.org/quick-info/explain-mental-health-to-child/index.html`. Its useful core intent was retained: mental health as part of general health, age-appropriate language, avoiding frightening diagnostic language, not burdening children with adult details, avoiding false promises, and coordinating family/school support.

The old page also contained generic emergency boilerplate, shell/GTM/platform code and structured-data citations to CDC ADHD and WHO autism that did not support the actual topic. These were discarded. Git history showed broad Quick Information batch updates for long-form content, shell, metadata, Discover/sitemap and GTM rather than separate topic canonicals.

## Rebuild and evidence

The canonical was rebuilt from scratch around: a correct definition of mental health; age-specific language for preschool, school age and adolescence; normal difficult feelings versus mental disorders; listening and conversational timing; stigma; privacy; explaining professional help; talking when a parent has a mental-health condition; school coordination; refusal to talk; escalation to professional support; and immediate safety concerns.

Primary evidence was drawn from WHO, CDC, NIMH, SAMHSA, AAP/HealthyChildren and UNICEF. The page avoids diagnosing ordinary emotions, does not frame therapy as punishment, and makes clear that persistent/severe impairment or safety risks require professional or emergency pathways rather than a household conversation alone.

## SEO / E-E-A-T

- SEO title: `شرح الصحة النفسية للطفل: دليل للأسرة` — 36 chars
- Meta description: 159 chars after SEO gate correction
- Primary keyword: `شرح الصحة النفسية للطفل`
- Search intent: informational
- Author: `فريق تحرير منصة روافد`
- Reviewer: `فريق المراجعة العلمية والتحريرية في روافد`
- Reviewer credentials transparently identify source-based review without fabricating an individual clinician.
- Canonical matches: 1
- Featured image: none in CMS; Alt is therefore not applicable. The old decorative Quick Information card was not migrated merely to populate an image field.

## Internal links

Six contextual links were added and all targets were verified as published:

- `/content/family-emotional-language`
- `/content/active-listening`
- `/content/when-child-needs-help`
- `/content/child-health-visit`
- `/content/school-family-partnership`
- `/content/emotional-safety`

## Final QA

- status: `published`
- useful/searchable Arabic word units: **2186**
- structured blocks: **73**
- H1: exactly one via title/template
- H2: **21**
- H3: **10**
- FAQ: **10**
- references: **8**
- internal links: **6/6 published**
- tags: **5**
- primary category relations: **1**
- canonical matches: **1**
- verified redirect: **1**
- SEO title length: **36**
- meta description length: **159**
- content versions: **7** (`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`)
- audit events: **7**
- forbidden TODO/FIXME/QA/agent/internal-note markers: **0**

The first SEO QA pass found a 148-character meta description. It was corrected to 159 characters before scientific/editorial/SEO/accessibility workflow progression, and the draft snapshot was refreshed before review.

No changes were made to `main` or `docs/MIGRATION-PROGRESS.md`.
