# SEO QA opportunity queue — 2026-08-28

These are independently observed opportunities, not automatic publishing instructions. Do not change canonical ownership, URLs, indexability, or scientific body merely to resolve a keyword-map overlap.

## 1. Broad AAC intent separation — out of batch

- Current URLs:
  - `/care-guides/augmentative-alternative-communication-support/`
  - `/content/special-ed-encyclopedia-aac`
- Current primary query on both: `التواصل المعزز والبديل AAC`.
- Observed distinction: the care guide is an applied support pathway; the encyclopedia record is a definition/evaluation reference.
- Current body-level cross-link between the two: none detected.
- Proposed QA-safe direction: preserve both public URLs; assign distinct query intents in the query map (definition/what-is vs practical support/implementation) and add natural reciprocal contextual links only where the visible copy supports them.
- Do not canonicalize one to the other and do not noindex either page solely for this overlap.
- Priority: medium.

## 2. Broad assistive-technology intent separation — out of batch

- Current URLs:
  - `/content/assistive-technology`
  - `/special-needs/assistive-technology/`
- Current primary query on both: `التقنيات المساعدة`.
- Observed distinction: one is a selection/trial guide; the other is a broader safety/evaluation/use article.
- Current body-level cross-link between the two: none detected.
- Proposed QA-safe direction: preserve both public URLs; differentiate query ownership around `اختيار وتجربة التقنيات المساعدة` versus `تقييم وأمان واستخدام التقنيات المساعدة`, then add contextual cross-links if editorial review confirms the roles.
- Do not merge/canonicalize/delete solely from keyword equality.
- Priority: medium.

## 3. Short-encyclopedia query-map generator quality

- Reviewed stable batch: 50 pages.
- Pattern observed at initial snapshot: highly repetitive `TITLE تعريف`, `TITLE دعم`, `TITLE في التعليم` query scaffolding and a shared semantic-term scaffold.
- The active primary agent has already started enriching at least two frozen-batch URLs with additional Arabic and English long-tail queries after acquiring its lock, so this area is actively changing and QA must not overwrite it.
- Proposed generator rule: derive secondary queries from the page's actual visible concepts, user tasks, recognized English term/acronym, and genuine sub-intents; retain generic variants only where they represent a real search task.
- Validation: require per-page relevance and reject unrelated or redundant constructions; do not optimize by keyword count.
- Priority: high for future batches; existing pages should be revised only when their final primary-agent state is stable.

## 4. Contextual cluster links for short encyclopedia

- Stable snapshot: 0/50 reviewed body JSON payloads contained contextual link fields or `/encyclopedia/` URLs.
- Shared navigation prevents orphaning, but it does not replace topic-specific explanatory links.
- Proposed rule: link only validated parent/subtopic or adjacent concepts, for example definition → assessment/trial guide or broad AAC → low-tech/high-tech subtopics. Use crawlable `<a href>` links with natural anchors and useful surrounding context.
- Do not mass-insert identical anchors into every page.
- Priority: medium.

## 5. Boilerplate metadata differentiation

- Stable batch: 49/50 titles used `TITLE: دليل مختصر موثوق`; 49/50 descriptions used the same generated prefix.
- Google Search Central advises against boilerplate titles that vary only by one piece of information, but variation alone is not a reason to rewrite correct metadata.
- Proposed rule for future batches: derive title/description from the page's actual differentiating concept and supported intent. Preserve concise Rawafid branding and avoid keyword stuffing/clickbait.
- Existing pages: change only after intent-level QA demonstrates a real mismatch or differentiation benefit.
- Priority: medium-high.
