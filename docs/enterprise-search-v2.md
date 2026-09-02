# Rawafid Enterprise Search V2

## Status

Search V2 is additive and dark-launched. The existing `/search` route remains the production fallback until the Arabic relevance contract and semantic corpus gate pass.

## Architecture

1. `internal_search_v2.pages` is the page-level lexical index.
   - Full page `body_text` is indexed, not only metadata.
   - Arabic-normalized titles and editorial search terms retain high ranking weight.
   - PGroonga provides multilingual token retrieval.
   - pg_trgm provides typo/fuzzy recovery.
2. `internal_search_v2.chunks` is the retrieval corpus.
   - Paragraph-aware windows target ~2,200 characters.
   - Oversized paragraphs use an overlapping 2,200/1,800 window.
   - Legacy structural artifacts such as literal `paragraph` / `heading` are excluded.
   - HNSW cosine vector index uses 512-dimensional embeddings.
3. `search_platform_v2_lexical` performs candidate-first Arabic lexical retrieval.
4. `search_platform_v2_hybrid` fuses lexical and semantic ranks using Reciprocal Rank Fusion (RRF).
5. `rawafid-hybrid-search` is the only application-facing V2 search endpoint.
   - V2 database RPCs are backend-only (`service_role`).
   - Query embedding failure degrades to lexical V2 instead of failing the search request.
6. `rawafid-search-indexer` handles incremental indexing and embeddings.
   - Content changes queue a re-index job.
   - Workers use `FOR UPDATE SKIP LOCKED` and stale-lock recovery.
   - Embeddings are stored only when the claimed `content_hash` still matches, preventing stale writes.

## Embedding policy

The built-in `gte-small` model is intentionally not used because Supabase documents it as English-only. Arabic retrieval requires a multilingual embedding provider. The current worker is prepared for `text-embedding-3-large` with 512 dimensions.

External embedding work is deliberately gated by `OPENAI_API_KEY`. The system does not silently generate the initial corpus or spend external API credits. Until the key and rollout are explicitly configured, V2 continues in lexical-fallback mode.

## Security boundary

- `internal_search_v2` is not exposed to `anon` or `authenticated`.
- Search V2 SECURITY DEFINER RPCs are executable only by `service_role`.
- Public/application traffic reaches V2 through an authenticated Edge Function.
- Edge Functions use the modern Supabase secret key environment where available, with legacy service-role fallback only during the documented transition period.
- Search input is capped to 160 characters and result limits are bounded.

## Rollout gates

Do not route normal `/search` traffic to V2 until all of the following hold:

1. `scripts/search-v2-quality-contract.mjs` passes the Arabic golden-query suite.
2. Semantic embeddings cover the intended public corpus and have zero stale-lock backlog.
3. Security Advisor has no Search V2 privilege warning.
4. Result deduplication, Quick Info publication gates, and canonical destinations are verified.
5. Latency/error-rate observation is acceptable under shadow or canary traffic.
6. The existing search remains available as an immediate rollback path during canary rollout.

## RAG usage

RAG must consume the same hybrid retrieval layer rather than maintain a second search index. The assistant should answer only from retrieved Rawafid evidence, expose the supporting Rawafid destinations, and abstain when retrieval quality is insufficient. Medical and psychological content must not be presented as a diagnosis or individualized treatment decision.
