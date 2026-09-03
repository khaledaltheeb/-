# Rawafid Enterprise Search — Zero-API Architecture

## Status

The current search architecture is additive and dark-launched. The existing `/search` route remains the production fallback while the new Arabic retrieval and extractive assistant complete their canary and quality gates.

Production assistant activation remains disabled. Staging/canary may enable the assistant for validation only.

## Architecture

1. `internal_search_v2.pages` is the page-level lexical index.
   - Full page text is indexed, not only metadata.
   - Arabic-normalized titles and editorial search terms retain high ranking weight.
   - PGroonga provides multilingual full-text retrieval.
   - `pg_trgm` provides typo/fuzzy recovery.
2. `internal_search_v2.chunks` is the local evidence corpus.
   - Paragraph-aware windows preserve useful context.
   - Legacy structural artifacts such as literal `paragraph` / `heading` are excluded.
   - Chunks are used locally for evidence extraction; they are not sent to an external AI provider.
3. `public.search_platform_v3_lexical` is the service-only public wrapper around the optimized V4 candidate engine.
4. V4 performs indexed candidate generation, Arabic normalization, token quotas, fuzzy/title recovery, and intent-aware reranking.
5. `public.search_platform_v4_evidence_for_pages` selects the best local evidence chunk only from the pages already chosen by the V4 page ranker.
6. `rawafid-public-search` is the public Edge boundary.
   - It enforces origin allowlisting, bounded query/result sizes, and rate limiting.
   - It keeps `service_role` inside Supabase.
   - It returns ranked pages plus local evidence.
7. `/api/search/v3` adds local intelligence without an external model:
   - conservative query rewriting,
   - Arabic dialect normalization,
   - curated synonym/entity expansion,
   - intent detection,
   - static Social Work corpus merging,
   - extractive answers linked back to Rawafid sources.

## Zero-API policy

The active search and assistant path requires no OpenAI API key, no external embedding provider, and no paid inference service.

There is no per-query AI API spend. The intelligence layer is built from:

- Arabic normalization and token handling,
- PGroonga full-text retrieval,
- trigram fuzzy matching,
- curated Arabic synonyms and dialect mappings,
- intent-aware ranking,
- top-page-constrained chunk evidence extraction,
- deterministic extractive summarization from Rawafid content.

Historical vector/embedding database structures may remain dormant for compatibility or migration history, but they are not part of the active runtime path and must not be treated as a rollout dependency.

The retired `rawafid-search-indexer` and `rawafid-hybrid-search` deployments return `410` and must not contact any external AI provider.

## Security boundary

- Internal search tables are not exposed directly to browsers.
- `search_platform_v3_lexical` is not executable by `anon` or `authenticated`; only `service_role` may execute it.
- `search_platform_v4_evidence_for_pages` is not executable by `anon` or `authenticated`; only `service_role` may execute it.
- Public/application traffic reaches search through the bounded Edge/server layer.
- `service_role` must never appear in `NEXT_PUBLIC_*` variables or browser code.
- Search input is capped to 160 characters and result limits are bounded.
- Public Edge rate-limit buckets are hash-derived; raw IP addresses are not stored by the search limiter.

## Quality gates

Do not enable the assistant on `healthrenewal.org` until all of the following hold:

1. TypeScript, lint, Next.js build, Cloudflare Worker build, and Wrangler validation pass on the final head.
2. Rawafid Quality Gate passes on the final head.
3. Canonical Ownership and Social Work institutional evidence gates pass.
4. The isolated canary Worker passes noindex and live HTTP checks.
5. Canary search checks cover at least:
   - `كيف اساعد طفلي على القراءة`
   - `طفلي ما بحكي`
   - `كيف اعرف ان ابني مصاب بالتوحد`
   - `AAC للتوحد`
   - `ERP للوسواس`
   - `اعراض انسحاب الكحول`
   - `اخلاقيات العمل الاجتماعي`
6. Evidence must come from relevant top-ranked Rawafid pages and every extractive answer point must expose its source destination.
7. Medical/psychological answers must remain educational, avoid diagnosis or individualized prescribing, and route immediate-danger language to safety guidance.
8. The existing search remains available as the rollback path.

## Extractive assistant behavior

The assistant does not generate free-form medical answers from an external language model. It retrieves the most relevant Rawafid pages, selects evidence from those pages, extracts concise source-backed points, and shows the supporting destinations.

When retrieval confidence is weak, the correct behavior is to return search results or a limited answer rather than fabricate a response.

## Rollout

- **Canary:** isolated `workers.dev` Worker, noindex, analytics disabled, assistant enabled.
- **Staging:** noindex, analytics disabled, assistant may be enabled for validation.
- **Production:** indexing/analytics retain normal production settings, but `ENABLE_RAWAFID_ASSISTANT` stays `false` until all final gates and canary checks pass.
