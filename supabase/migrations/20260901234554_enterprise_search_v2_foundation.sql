create extension if not exists vector with schema extensions;
create extension if not exists pgroonga with schema extensions;

create schema if not exists internal_search_v2;
revoke all on schema internal_search_v2 from public, anon, authenticated;

create table if not exists internal_search_v2.pages (
  entity_type text not null,
  entity_id uuid not null,
  slug text not null,
  title text not null,
  normalized_title text not null,
  high_priority_terms text not null default '',
  search_text text not null default '',
  subtitle text,
  excerpt text,
  destination text not null,
  published_at timestamptz,
  source_updated_at timestamptz,
  is_public boolean not null default true,
  content_hash text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (entity_type, entity_id)
);

create table if not exists internal_search_v2.chunks (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id uuid not null,
  chunk_index integer not null check (chunk_index >= 0),
  slug text not null,
  title text not null,
  heading text,
  content_text text not null,
  destination text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(512),
  embedding_model text,
  embedding_version integer not null default 1,
  content_hash text not null,
  published_at timestamptz,
  source_updated_at timestamptz,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id, chunk_index)
);

create index if not exists search_v2_pages_public_type_idx
  on internal_search_v2.pages (is_public, entity_type);
create index if not exists search_v2_pages_destination_idx
  on internal_search_v2.pages (destination);
create index if not exists search_v2_pages_title_trgm_idx
  on internal_search_v2.pages using gin (normalized_title extensions.gin_trgm_ops);
create index if not exists search_v2_pages_terms_trgm_idx
  on internal_search_v2.pages using gin (high_priority_terms extensions.gin_trgm_ops);
create index if not exists search_v2_pages_text_pgroonga_idx
  on internal_search_v2.pages using pgroonga (search_text);

create index if not exists search_v2_chunks_entity_idx
  on internal_search_v2.chunks (entity_type, entity_id, chunk_index);
create index if not exists search_v2_chunks_public_idx
  on internal_search_v2.chunks (is_public, entity_type);
create index if not exists search_v2_chunks_text_pgroonga_idx
  on internal_search_v2.chunks using pgroonga (content_text);
create index if not exists search_v2_chunks_embedding_hnsw_idx
  on internal_search_v2.chunks using hnsw (embedding vector_cosine_ops)
  with (m = 24, ef_construction = 80);

revoke all on all tables in schema internal_search_v2 from public, anon, authenticated;
