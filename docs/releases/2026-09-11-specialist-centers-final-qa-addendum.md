# Specialist Centers — Final QA Addendum

Date: 2026-09-11

This addendum records the final closure checks after the main specialist knowledge-center release record.

## Updated enrichment count

The existing-page enrichment total is now **13**, not 12, because the ABI editorial hub itself was subsequently upgraded.

Additional enriched asset:

- `legacy-outside-box-acquired-brain-injury`
  - added an ordered reading map from early-stage recovery through cognition/communication, fatigue/sleep, emotional/mental-health pathways, family/identity/relationships, return to education/work and driving/community mobility;
  - added explicit source-role governance explaining how WHO, INCOG, CAN-TBI, Action Collaborative, KITE/SCIRE, MSKTC, Headway and Stroke Foundation are used;
  - preserved the previous published version through the existing zero-downtime `content_versions` workflow.

## Final production assertions

The following checks completed successfully in production:

- specialist backlog has no unfinished item outside `published` / `merged`;
- all **29** specialist pages remain published and visible to the anonymous role;
- all new pages have at least two related-content edges;
- every ABI specialist page links to at least one ABI hub/parent-guide owner;
- every inclusive-systems page links to the inclusive foundations hub or leadership owner;
- reference records on the 29 pages contain nonblank `id`, `title`, `url`, `publisher`, `source_type`, and `authority_tier`;
- no specialist reference uses an insecure `http://` URL;
- no specialist page contains duplicate reference IDs;
- every `claim_source_map` source identifier resolves to a reference on the same page;
- all specialist pages retain V6 search and structure requirements;
- SEO titles remain within the branded title-length boundary;
- meta descriptions remain within the 150–160 character release boundary;
- no published canonical URL is duplicated;
- `body_text` remains in parity with the rendered structured body blocks;
- both specialist categories point to their intended published/indexable editorial hubs;
- the related-content graph contains no missing endpoint or self-loop;
- recent specialist publications have category mappings;
- sitewide published content remains free of `robots_index=false` and blank canonical URLs.

## Anonymous related-content access

A production RLS check under the `anon` role confirmed that related-content edges for specialist pages are readable, so the new knowledge graph is not blocked by the public row-security boundary.

## Reproducible graph migrations

The graph is represented in the repository through:

- `supabase/migrations/20260911143100_specialist_knowledge_graph_relations_20260911.sql`
- `supabase/migrations/20260911143200_specialist_knowledge_graph_hubs_20260911.sql`

## Governing architecture

The long-term ownership and anti-cannibalization rules are documented in:

- `docs/architecture/specialist-knowledge-centers-abi-inclusive-systems.md`

## Next safe phase

Further bulk publication is intentionally not part of this release. The next work should be UX and source-provenance presentation: related-content rendering, hub navigation, breadcrumbs, visible source hierarchy, mobile readability, and structured-data verification. Any new page must first demonstrate a distinct search intent not already owned by the two completed centers.
