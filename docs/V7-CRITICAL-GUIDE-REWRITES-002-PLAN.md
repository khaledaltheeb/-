# V7 critical guide rewrites — batch 002 plan

## Scope

This batch is prepared for two held, high-sensitivity V7 Care Guides:

1. `care-guide-delirium-warning-signs-urgent-response`
2. `care-guide-domestic-abuse-mental-health-safety`

Preparation is intentionally separate from live-content mutation. The branch was created from `main` commit `5c999276d56568dc8255019655f135b9d349a4c2`. Do not apply the content rewrite while the post-merge quality/deployment checks for that main commit are still open.

Both current records are already `published + noindex,follow` under `full_v7_corpus_template_duplication`, so this batch is a quality repair, not an emergency deindex action.

## Safety/review invariant

Both source versions currently carry a non-null `last_reviewed_at`, which under Rawafid policy represents a completed review by فريق روافد.

Because this batch will materially alter the public text, the rewritten versions must:

- preserve the previous review date in `schema_json.revision_provenance`;
- set current `last_reviewed_at = null`;
- clear individual reviewer fields on the rewritten version unless a new review has actually occurred;
- remain `robots_index=false` and `robots_follow=true`;
- move the quality-hold state from `noindex_pending_unique_rewrite` to a post-rewrite state that still requires a fresh Rawafid review;
- never emit a new `lastReviewed` until the rewritten version has actually been reviewed by فريق روافد.

## Do not hardcode block ordinals

The live body blocks have moved during concurrent edits. Rewrite SQL must derive boundaries from heading text in the **current record at execution time**, not from saved ordinal numbers.

### Delirium boundary

Generic template starts at the heading:

`إطار التنفيذ والمتابعة الموسّع`

For the current delirium page the generic template continues to the end, so preserve every block before that heading and replace the remainder with topic-specific delirium material.

### Domestic-abuse boundary

Generic template starts at:

`إطار التنفيذ والمتابعة الموسّع`

but the page later contains useful topic-specific content beginning at:

`أسئلة شائعة`

and continuing through the existing sources and the later sections on optional documentation and supporter boundaries.

Therefore preserve:

- every block before `إطار التنفيذ والمتابعة الموسّع`;
- every block from `أسئلة شائعة` onward;

and replace **only the interval between those two markers**. Do not drop the existing FAQ, source surface, `التوثيق خيار، وليس واجبًا إذا كان سيزيد الخطر`, or `الشخص الذي يساند يحتاج حدودًا أيضًا` sections.

## Delirium evidence contract

Primary guidance:

- NICE CG103 recommendations: https://www.nice.org.uk/guidance/cg103/chapter/Recommendations
- NICE CG103 rationale/impact: https://www.nice.org.uk/guidance/cg103/chapter/Rationale-and-impact
- NICE public information: https://www.nice.org.uk/guidance/cg103/informationforpublic
- NICE QS63: https://www.nice.org.uk/guidance/qs63

Key statements that may be used when supported precisely:

- recent changes or fluctuations developing within **hours or days** in cognition, perception, physical function or social behaviour should trigger assessment in at-risk people;
- hypoactive delirium is commonly missed and may present with withdrawal, slow responses, reduced movement, worsened concentration or reduced appetite;
- when delirium indicators are identified, NICE recommends assessment with **4AT by a competent health or social care practitioner** in most settings; critical care/post-operative recovery use different tools;
- the final diagnosis should be made by a healthcare professional with relevant expertise;
- if delirium and dementia are difficult to distinguish, manage delirium first;
- management includes identifying/treating underlying cause(s), effective communication/reorientation, reassurance, appropriate environment and family/carer involvement;
- relevant modifiable clinical factors include hydration/constipation, hypoxia, infection, mobility, pain, medication burden, nutrition, sensory impairment and sleep.

Public-copy guardrails:

- do not turn 4AT into a home self-test or tell family members to diagnose delirium;
- do not imply that every confused older adult has delirium;
- do not provide medication or haloperidol instructions for lay use;
- emphasize urgent medical assessment for sudden/fluctuating change, especially where severe illness, injury, reduced consciousness or immediate danger is present;
- distinguish the *pattern* of acute fluctuating change from a diagnosis of dementia without claiming that family observations can settle the diagnosis.

## Domestic-abuse evidence contract

Primary guidance:

- WHO clinical handbook: https://www.who.int/publications/i/item/WHO-RHR-14.26
- WHO revised provider curriculum: https://www.who.int/publications/i/item/9789240039803
- WHO 2025 emergency clinical-management curriculum: https://www.who.int/publications/i/item/9789240100213
- WHO clinical/policy guideline: https://www.who.int/publications/i/item/9789241548595
- WHO violence-against-women fact sheet: https://www.who.int/news-room/fact-sheets/detail/violence-against-women
- Convention on the Rights of the Child when children/safeguarding context is directly relevant: https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-rights-child

Core response model:

WHO first-line support uses the survivor-centred **LIVES** approach:

- Listen with empathy and without judgment;
- Inquire about needs and concerns;
- Validate the survivor's experience;
- Enhance safety through individualized safety discussion/planning;
- Support connection to appropriate services/resources.

Public-copy guardrails:

- do not instruct a supporter to confront the abusive person;
- do not force disclosure, departure, reporting or a single decision where there is no immediate legal/safeguarding obligation specific to the user's jurisdiction;
- do not publish covert-evasion tactics or detailed concealment procedures that could increase danger if discovered;
- frame safety planning as individualized, survivor-centred and locally adapted;
- distinguish immediate emergency/safeguarding needs from longer-term support;
- protect privacy and avoid unnecessary documentation when documentation itself could increase danger;
- for children, describe the need for protection and appropriate services without using children as messengers or evidence gatherers;
- legal/referral statements must be locally qualified rather than presented as universal law.

## Source cleanup

Current delirium references include useful NICE sources plus dementia-context references. During rewrite, retain only sources that genuinely support surviving or new claims. A dementia reference may remain when it supports the differential/context discussion; unrelated template-derived references should not be retained merely to keep counts high.

Current domestic-abuse references include strong WHO sources but also divorce-specific references inherited from adjacent content. Remove divorce-only references unless a surviving claim actually depends on them. Reference count is not a quality target by itself.

## Required post-rewrite audit

After live rewrite, rerun the exact full-V7 duplicate algorithm from `20260816141217_hold_v7_template_duplicated_guides.sql` against the complete published V7 `care-guide`/`guide` corpus.

For each page record:

- pre-rewrite exact/normalized paragraph and word-duplication metrics;
- post-rewrite exact/normalized paragraph and word-duplication metrics;
- `body_json/body_text` synchronization;
- duplicate reference keys;
- unresolved claim-source keys;
- reference and claim-map counts;
- current review state;
- current robots state;
- original review timestamp in revision history.

A rewrite is not considered complete merely because its duplication percentage falls. The surviving/new text must remain topic-specific and clinically/safety appropriate.

## Runtime regression gate

Before merge, add Batch 002 rendered smoke for both routes requiring:

- direct HTTP 200;
- `noindex,follow` without `nofollow`;
- exact canonical;
- central disclaimer link and references surface;
- topic-specific new markers;
- removed generic marker `إطار التنفيذ والمتابعة الموسّع` absent;
- useful preserved suffix markers on the domestic-abuse page still present;
- visible `آخر مراجعة` and JSON-LD `lastReviewed` absent after substantive rewrite until a fresh Rawafid review.

## Release decision

**No re-index in Batch 002.**

Success for the batch means: generic template removed without losing useful topic-specific material, evidence and safety semantics strengthened, duplicate defect re-audited, runtime/rendering green, and both pages held for fresh فريق روافد review.
