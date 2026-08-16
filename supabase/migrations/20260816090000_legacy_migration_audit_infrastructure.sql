create extension if not exists http with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create table if not exists private.legacy_migration_items (
  source_key text primary key,
  source_kind text not null default 'production-baseline',
  source_family text not null,
  source_path text not null,
  source_url text,
  source_sha256 text not null,
  source_meta jsonb not null default '{}'::jsonb,
  title text,
  h1 text,
  meta_description text,
  canonical_url text,
  robots text,
  word_count integer not null default 0,
  body_json jsonb not null default '{}'::jsonb,
  body_text text,
  references_json jsonb not null default '[]'::jsonb,
  internal_links_json jsonb not null default '[]'::jsonb,
  images_json jsonb not null default '[]'::jsonb,
  legacy_schema_json jsonb not null default '[]'::jsonb,
  migration_state text not null,
  quality_flags jsonb not null default '[]'::jsonb,
  destination_content_id uuid references public.content(id) on delete set null,
  destination_slug text,
  destination_canonical text,
  promoted_at timestamptz,
  migration_decision text not null default 'UNRESOLVED',
  decision_reason jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint legacy_migration_items_state_check check (migration_state in (
    'PUBLISHABLE','PUBLISHABLE_AFTER_REPAIR','MERGE_SOURCE','SOURCE_ONLY',
    'DEVELOPMENT_ONLY','BASELINE_ONLY','DUPLICATE_NO_UNIQUE_VALUE','REJECTED'
  )),
  constraint legacy_migration_items_word_count_check check (word_count >= 0),
  constraint legacy_migration_items_decision_check check (migration_decision in (
    'UNRESOLVED','MATCH_EXISTING','MATCH_VERIFIED','MERGE_REVIEW','PROMOTED_DRAFT',
    'EXCLUDE_BASELINE','EXCLUDE_DEVELOPMENT','EXCLUDE_OBSOLETE',
    'LANDING_REVIEW','INTERACTIVE_REVIEW','ASSET_REVIEW'
  ))
);

alter table private.legacy_migration_items
  add column if not exists source_meta jsonb not null default '{}'::jsonb,
  add column if not exists migration_decision text not null default 'UNRESOLVED',
  add column if not exists decision_reason jsonb not null default '{}'::jsonb;

alter table private.legacy_migration_items drop constraint if exists legacy_migration_items_decision_check;
alter table private.legacy_migration_items add constraint legacy_migration_items_decision_check check (migration_decision in (
  'UNRESOLVED','MATCH_EXISTING','MATCH_VERIFIED','MERGE_REVIEW','PROMOTED_DRAFT',
  'EXCLUDE_BASELINE','EXCLUDE_DEVELOPMENT','EXCLUDE_OBSOLETE',
  'LANDING_REVIEW','INTERACTIVE_REVIEW','ASSET_REVIEW'
));

create unique index if not exists legacy_migration_items_source_path_kind_idx
  on private.legacy_migration_items(source_kind, source_path);
create index if not exists legacy_migration_items_family_state_idx
  on private.legacy_migration_items(source_family, migration_state);
create index if not exists legacy_migration_items_destination_idx
  on private.legacy_migration_items(destination_content_id)
  where destination_content_id is not null;
create index if not exists legacy_migration_items_decision_idx
  on private.legacy_migration_items(migration_decision, source_family);

alter table private.legacy_migration_items enable row level security;
revoke all on table private.legacy_migration_items from public, anon, authenticated;
comment on table private.legacy_migration_items is
  'Internal full legacy migration ledger. Preserves production-baseline and historical knowledge before controlled promotion into public.content.';

create table if not exists private.legacy_migration_runs (
  id uuid primary key default gen_random_uuid(),
  source_kind text not null,
  source_ref text,
  source_digest text,
  source_html_count integer not null default 0,
  encyclopedia_count integer not null default 0,
  quick_info_count integer not null default 0,
  status text not null default 'inventory',
  summary jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint legacy_migration_runs_status_check check (status in ('inventory','staging','validated','promoting','completed','failed'))
);
alter table private.legacy_migration_runs enable row level security;
revoke all on table private.legacy_migration_runs from public, anon, authenticated;
comment on table private.legacy_migration_runs is
  'Internal audit trail for full legacy migration runs; inaccessible to anon/authenticated clients.';

create table if not exists private.legacy_merge_candidates (
  id bigserial primary key,
  source_key text not null references private.legacy_migration_items(source_key) on delete cascade,
  destination_content_id uuid not null references public.content(id) on delete cascade,
  block_index integer not null,
  block_type text not null,
  legacy_text text not null,
  normalized_hash text not null,
  legacy_char_count integer not null,
  exact_text_present boolean not null default false,
  review_status text not null default 'candidate',
  created_at timestamptz not null default now(),
  unique(source_key,block_index,normalized_hash),
  constraint legacy_merge_candidates_status_check check (review_status in ('candidate','accounted_for','merged','rejected_non_unique'))
);
alter table private.legacy_merge_candidates enable row level security;
revoke all on private.legacy_merge_candidates from public, anon, authenticated;
create index if not exists legacy_merge_candidates_source_idx on private.legacy_merge_candidates(source_key,review_status);
create index if not exists legacy_merge_candidates_destination_idx on private.legacy_merge_candidates(destination_content_id,review_status);

create table if not exists private.legacy_current_blocks (
  id bigserial primary key,
  destination_content_id uuid not null references public.content(id) on delete cascade,
  block_index integer not null,
  block_type text not null,
  block_text text not null,
  normalized_text text not null,
  unique(destination_content_id,block_index)
);
alter table private.legacy_current_blocks enable row level security;
revoke all on private.legacy_current_blocks from public, anon, authenticated;
create index if not exists legacy_current_blocks_content_idx on private.legacy_current_blocks(destination_content_id);
create index if not exists legacy_current_blocks_trgm_idx on private.legacy_current_blocks using gist(normalized_text extensions.gist_trgm_ops);
comment on table private.legacy_current_blocks is
  'Materialized current V3 content blocks used for conservative legacy merge similarity checks.';

create table if not exists private.legacy_quality_issues (
  id bigserial primary key,
  source_key text not null references private.legacy_migration_items(source_key) on delete cascade,
  destination_content_id uuid references public.content(id) on delete cascade,
  issue_code text not null,
  severity text not null,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique(source_key,issue_code),
  constraint legacy_quality_issues_severity_check check (severity in ('info','warning','high','blocking')),
  constraint legacy_quality_issues_status_check check (status in ('open','resolved','accepted','superseded'))
);
alter table private.legacy_quality_issues enable row level security;
revoke all on private.legacy_quality_issues from public, anon, authenticated;
create index if not exists legacy_quality_issues_open_idx on private.legacy_quality_issues(status,severity,issue_code);
create index if not exists legacy_quality_issues_destination_idx on private.legacy_quality_issues(destination_content_id) where destination_content_id is not null;
comment on table private.legacy_quality_issues is
  'Private publication-readiness queue for migrated legacy content. No issue is a deletion instruction; blocking issues prevent release until resolved.';

create table if not exists private.legacy_route_registry (
  route text primary key,
  normalized_route text not null,
  source_key text references private.legacy_migration_items(source_key) on delete set null,
  migration_decision text,
  destination_content_id uuid references public.content(id) on delete set null,
  destination_slug text,
  destination_canonical text,
  is_excluded boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table private.legacy_route_registry enable row level security;
revoke all on private.legacy_route_registry from public, anon, authenticated;
create index if not exists legacy_route_registry_normalized_idx on private.legacy_route_registry(normalized_route);
create index if not exists legacy_route_registry_destination_idx on private.legacy_route_registry(destination_content_id) where destination_content_id is not null;
create index if not exists legacy_route_registry_source_idx on private.legacy_route_registry(source_key) where source_key is not null;
comment on table private.legacy_route_registry is
  'Indexed registry of historical routes and their migration disposition, used for link integrity and preserved-URL release checks.';

alter table public.categories
  add column if not exists editorial_content_id uuid references public.content(id) on delete set null;
create index if not exists categories_editorial_content_idx
  on public.categories(editorial_content_id)
  where editorial_content_id is not null;
comment on column public.categories.editorial_content_id is
  'Optional reviewed landing/editorial content rendered inside the category page after publication; used to preserve rich legacy landing knowledge without duplicating taxonomy.';
