# Read Together, Grow Together — final release QA

Status: PREPARATION ONLY.

This checklist defines when Rawafid may call the bilingual companion **ready for release**. It is intentionally stricter than “draft complete.”

## 1. Editorial completeness

- [x] Canonical bilingual manuscript exists.
- [x] Arabic and English use the same chapter architecture and evidence numbering.
- [x] Core domains are covered: shared reading, emotional wellbeing, resilience, repair, gratitude, contentment, comparison/self-worth, body safety, familiar-person boundaries, touch context, disclosure, social confidence, play entry, assertiveness, family belonging, parent respect, attachment/autonomy, disagreement, inclusive reading, repetition, digital shared reading, caregiver wellbeing.
- [x] Each core chapter contains practical caregiver language or an actionable routine.
- [x] No chapter relies on slogans such as “strong personality,” “psychological fragility,” or “perfect parenting” as scientific constructs.
- [x] No section teaches blind obedience, secrecy that can silence disclosure, or child responsibility for preventing abuse.

## 2. Scientific integrity

- [x] Claim-strength matrix exists.
- [x] Full references are grouped in final pages, per editorial decision.
- [x] Shared-reading claims are anchored to AAP guidance and peer-reviewed synthesis.
- [x] Responsive-caregiving claims are anchored to WHO/Nurturing Care and implementation literature.
- [x] Attachment/sensitivity claims are framed as associations, not guarantees.
- [x] Autonomy-support claims preserve parental guidance and age appropriateness.
- [x] Gratitude claims are deliberately modest and never framed as treatment/prevention.
- [x] Digital-reading claims do not equate passive screen exposure with shared reading.
- [x] Campaign landing-page evidence links corrected to the intended AAP, PubMed, and WHO sources.
- [ ] Final bibliographic metadata for any 2026 article still marked provisional must be rechecked immediately before PDF typesetting.

## 3. Safeguarding

- [x] “Stranger danger” is not used as the sole safety framework.
- [x] Familiar adults and relatives are explicitly not exempt from boundaries.
- [x] Necessary care/hygiene/medical touch is explained with context.
- [x] Child is never blamed for not saying no, escaping, or disclosing immediately.
- [x] More than one trusted adult is encouraged.
- [x] Disclosure guidance warns against repeated interrogation and leading questions.
- [x] Story/photo participation is optional and separated from access to reading resources.
- [x] Consent workflow exists but is blocked from use until Worldreader guidance is reconciled.

## 4. Accessibility and inclusion

- [x] Spoken responses are not required for participation.
- [x] AAC, pointing, gesture, pictures and other communication modes are recognized.
- [x] Eye contact is not treated as proof of attention/respect.
- [x] Sensory/environmental adaptations are framed as optional and individual.
- [x] Repetition is normalized when useful.
- [x] Canonical authoring rules require meaningful visual alternatives/alt text.
- [ ] Final PDF must be checked for tagged reading order, heading hierarchy, language metadata, link annotations, contrast, selectable text, and RTL order.
- [ ] Final web implementation must pass keyboard/focus/contrast/mobile checks.

## 5. Identity and credits

- [x] Arabic identity: خالد الذيب | Khaled Altheeb.
- [x] English identity: Khaled Altheeb | خالد الذيب.
- [x] Website fixed as https://healthrenewal.org/.
- [x] Email fixed as contact@healthrenewal.org.
- [x] Identity placement rules exist for cover, methodology/credits, and back/final page.
- [x] No fabricated academic or medical reviewer names.

## 6. Worldreader / BookSmart boundary

- [x] Companion is currently a Rawafid preparation, not represented as Worldreader-authored, reviewed, sponsored, or endorsed.
- [x] Julia proposal is drafted but blocked until she replies to the current onboarding email.
- [x] No second unsolicited proposal email has been sent.
- [x] Latest inbox check found no new Julia reply as of the preparation round on 2026-08-26 23:20 UTC.
- [ ] Worldreader confirms exact public campaign-date wording.
- [ ] Worldreader confirms preferred campaign age wording.
- [ ] Worldreader confirms whether Rawafid receives a dedicated referral/UTM/QR.
- [ ] Worldreader confirms final designation and any preferred Arabic rendering.
- [ ] Worldreader confirms whether the companion concept is welcome and what level of review/co-branding, if any, they prefer.
- [ ] Worldreader child/family story release guidance is reconciled before any identifiable story collection.

## 7. Visual and PDF production

- [x] Visual direction is defined: calm, spacious, modern, warm, non-clinical, non-childish clutter.
- [x] References reserved for final pages.
- [x] PDF structure and approximate page budget are defined.
- [x] Worldreader-specific image restrictions are documented for any campaign-branded edition.
- [ ] Arabic PDF must be typeset and visually inspected page by page.
- [ ] English PDF must be typeset and visually inspected page by page.
- [ ] Cover/back-cover QR and contact details must be tested.
- [ ] Print margins, page breaks, orphan/widow handling, and small-text legibility must be checked.

## 8. Web release

- [x] Landing page exists on prep branch and is intentionally `index: false`.
- [x] Privacy-preserving outbound tracking component exists.
- [x] No child PII is attached to analytics events.
- [x] Evidence-source URL bugs found in the first landing-page draft were corrected.
- [ ] Do not change to `index: true` until Worldreader operational blockers are resolved and final public wording is locked.
- [ ] Do not merge the draft PR into production until release blockers are closed.

## Readiness definition

### Editorial/scientific readiness
**READY** once all checked items above remain valid and the final provisional bibliography metadata is reverified at typesetting.

### Production readiness
**NOT YET**, solely because external Worldreader confirmations and final PDF/web rendering QA remain outstanding.

This distinction prevents a polished internal manuscript from being mistaken for permission to publish a campaign-branded edition.
