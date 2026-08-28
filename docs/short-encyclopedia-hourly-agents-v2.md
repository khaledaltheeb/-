# Short Encyclopedia — Hourly Agent Contract v2

This contract governs automated publishing for `/sectors/short-encyclopedia`.

## Global operating rule

The production target is **up to 50 newly published pages per agent per run**. Quality is a hard gate, not a soft preference. A candidate that fails scientific accuracy, source verification, duplicate/cannibalization review, editorial clarity, SEO validation, or post-publication verification must not be published merely to fill the quota. It remains in the backlog for correction or replacement.

There is **no minimum word-count requirement**. Pages should be only as long as necessary to answer the search intent completely and accurately. Filler, generic prose, artificial expansion, keyword stuffing, and repeated boilerplate are prohibited.

Every run must follow this pipeline:

1. Inspect the live site, existing database content, titles, aliases, canonicals, primary keywords, and internal-link graph before choosing topics.
2. Find genuine content/search gaps. Prioritize missing entities, unanswered Arabic queries, synonyms, English/Arabic naming variants, important syndromes/conditions, and high-value user questions. Do not publish alphabetically just to increase volume.
3. Reject candidates that would duplicate an existing page or create search-intent cannibalization. Prefer enriching/linking an existing page when that is the correct action.
4. Research each accepted candidate using current authoritative sources appropriate to the topic: international/public-health bodies, clinical guidance, university or government sources, systematic reviews, meta-analyses, peer-reviewed research, recognized reference works, and authoritative condition/syndrome databases. Never copy protected diagnostic manuals or proprietary tests verbatim.
5. Write clear Arabic for the intended audience. Preserve the correct English term and recognized synonyms/aliases. State uncertainty and evidence limits where relevant.
6. Run the scientific/editorial gate.
7. Run the SEO/entity gate.
8. Publish only passing pages to the correct short-encyclopedia category.
9. Verify the live/public result: successful response, correct canonical, indexability, correct section mapping, valid metadata, valid internal links, and no duplicate title/slug/canonical.
10. Record audit metadata, sources used, publication status, and failure reason for every rejected candidate.

## Scientific/editorial gate — mandatory

- Factual and terminological accuracy.
- No unsupported causal claims.
- Do not present screening information as diagnosis.
- Symptoms/features must match the entity; if the concept has no symptoms or causes, explicitly use a scientifically appropriate heading such as “لا ينطبق” or explain why instead of inventing content.
- Separate established evidence from emerging or uncertain evidence.
- Advice must be useful, specific, safe, and proportionate; no generic filler.
- Include when-to-seek-professional-help or urgent-safety guidance only when medically relevant.
- Use respectful, non-stigmatizing Arabic.
- References must support the claims actually made.
- Content must add useful information beyond a definition copied from elsewhere.

## SEO/entity gate — mandatory

Each new page must have, as applicable:

- unique Arabic page title and unique SEO title;
- English term and recognized Arabic/English aliases;
- concise unique meta description;
- one clear primary search intent;
- primary keyword plus natural secondary queries and semantic entities, without stuffing;
- canonical URL and indexable robots state;
- correct slug and no competing canonical/title/intent;
- visible internal links to the section hub and closely related pages, plus reciprocal/contextual links when useful;
- breadcrumbs;
- structured data that truthfully matches the visible content and page type (for example WebPage/DefinedTerm/MedicalWebPage plus BreadcrumbList where appropriate);
- source/review metadata and medical disclaimer where the subject is medical;
- inclusion in the normal sitemap/indexation pipeline;
- Arabic spelling variants and common transliterations only when they correspond to real searches and do not degrade the visible text.

A visible FAQ is encouraged when it answers real user questions, but it must be written for users rather than manufactured for rich-result eligibility.

## Agent A — Psychology Terms

Category: `short-encyclopedia-psychology-terms`

Public name: **مصطلحات علم النفس**

Scope includes psychology terminology, mental-health conditions, psychological disorders, syndromes, states, constructs, symptoms-as-terms, therapeutic/research concepts, and closely related clinical terminology.

Default page structure for an entity when clinically applicable:

1. المصطلح
2. المصطلح بالإنجليزية
3. تعريف دقيق
4. شرح واضح
5. الأعراض أو السمات
6. الأسباب وعوامل الخطورة/الارتباطات عندما يدعمها الدليل
7. نصائح عملية وآمنة
8. أسئلة وأجوبة حقيقية مبنية على نية البحث
9. المراجع والمصادر

Preferred source classes include WHO, NIMH, NICE/NHS, recognized professional/academic sources, systematic reviews, meta-analyses, clinical guidelines, and peer-reviewed literature. Diagnostic nomenclature may be accurately summarized but proprietary manuals must not be reproduced.

## Agent B — Special Needs & Inclusive Education

Category: `short-encyclopedia-special-needs-inclusive-education`

Public name: **احتياجات خاصة وتربية دامجة**

Scope includes developmental conditions and syndromes, learning differences/difficulties, communication, sensory and motor needs, special education, inclusive education, accommodations, accessibility, classroom participation, family support, and evidence-based educational/functional support.

The section/category/navigation label must use **احتياجات خاصة وتربية دامجة** rather than a disability label. Within scientific prose, use respectful person-centered or identity-respecting language appropriate to the topic and community; formal clinical/legal terminology may be mentioned only when necessary for accuracy and explained neutrally.

Default page structure when applicable:

1. المصطلح أو الحالة
2. المصطلح بالإنجليزية
3. تعريف دقيق
4. شرح واضح
5. السمات/الأعراض عند انطباقها
6. الأسباب أو العوامل المرتبطة عند ثبوتها
7. الدعم والتكييفات والنصائح العملية
8. أسئلة وأجوبة حقيقية مبنية على نية البحث
9. المراجع والمصادر

Preferred source classes include WHO, UNICEF, UNESCO, NICE/NHS, CDC/AAP where relevant, GeneReviews/Orphanet for appropriate genetic/rare conditions, evidence-based education/inclusion guidance, systematic reviews, and peer-reviewed literature.

## Data and routing rules

- New short-encyclopedia pages should be created under the `short-encyclopedia` sector and assigned to the correct root category as their primary category unless an existing canonical page already covers the entity.
- Existing pages cross-listed into a new section must retain their existing primary taxonomy and canonical URL; do not create a duplicate page merely to move it into the short encyclopedia.
- Before any publish, search by slug, title, Arabic and English aliases, canonical URL, primary keyword, and semantic intent.
- Never delete, hide, de-index, or replace an existing published page as part of this workflow unless an explicit repair decision is separately justified and verified.

## Throughput and parallelism

The two agents are independent and may run concurrently. Each should aim to complete 50 passing pages per run. Failed candidates do not count as published pages. If fewer than 50 defensible pages can be completed in a run, publish the passing set and retain/replace the rest rather than lowering the quality bar.
