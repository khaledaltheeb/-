begin;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  ror_id text not null unique,
  display_name text not null,
  status text check (status is null or status in ('active','inactive','withdrawn')),
  domains text[] not null default '{}'::text[],
  organization_types text[] not null default '{}'::text[],
  ror_schema_version text,
  metadata jsonb not null default '{}'::jsonb,
  refreshed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_ror_id_canonical check (ror_id ~ '^https://ror\.org/0[a-hj-km-np-tv-z0-9]{6}[0-9]{2}$'),
  constraint organizations_display_name_present check (char_length(trim(display_name)) between 1 and 500)
);

create index if not exists organizations_display_name_idx on public.organizations (lower(display_name));
create index if not exists organizations_domains_gin_idx on public.organizations using gin (domains);

create table if not exists public.source_organizations (
  source_id uuid not null references public.sources(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  relationship text not null default 'publisher' check (relationship in ('publisher','author_affiliation','institutional_owner','sponsor','other')),
  resolution_method text not null check (resolution_method in ('ror_rest_api','ror_dataset','lens','manual')),
  matching_type text,
  match_score double precision,
  chosen boolean not null default true,
  provenance jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (source_id, organization_id, relationship),
  constraint source_organizations_score_valid check (match_score is null or (match_score >= 0 and match_score <= 1))
);

create index if not exists source_organizations_org_idx on public.source_organizations (organization_id, relationship);
create index if not exists source_organizations_source_idx on public.source_organizations (source_id, relationship);

alter table public.organizations enable row level security;
alter table public.source_organizations enable row level security;
revoke all on public.organizations from anon, authenticated;
revoke all on public.source_organizations from anon, authenticated;

create or replace function public.api_source_detail(p_source_id uuid)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select jsonb_build_object(
    'id', s.id,
    'canonical_url', s.canonical_url,
    'title', s.title,
    'publisher', s.publisher,
    'source_type', s.source_type,
    'authority_tier', s.authority_tier,
    'publication_year', s.publication_year,
    'doi', s.doi,
    'pmid', s.pmid,
    'license', s.license,
    'rights_note', s.rights_note,
    'language', s.language,
    'status', s.status,
    'updated_at', s.updated_at,
    'organizations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'ror_id', o.ror_id,
        'display_name', o.display_name,
        'status', o.status,
        'domains', o.domains,
        'organization_types', o.organization_types,
        'ror_schema_version', o.ror_schema_version,
        'relationship', so.relationship,
        'resolution_method', so.resolution_method,
        'matching_type', so.matching_type,
        'match_score', so.match_score,
        'chosen', so.chosen,
        'last_verified_at', so.last_verified_at
      ) order by so.relationship, o.display_name)
      from public.source_organizations so
      join public.organizations o on o.id = so.organization_id
      where so.source_id = s.id and so.chosen = true
    ), '[]'::jsonb),
    'cited_by', coalesce((
      select jsonb_agg(jsonb_build_object(
        'content_id', c.id,
        'slug', c.slug,
        'type', c.content_type,
        'title', c.title,
        'canonical_url', c.canonical_url,
        'relationship', cs.relationship,
        'citation_order', cs.citation_order
      ) order by cs.citation_order nulls last, c.published_at desc)
      from public.content_sources cs
      join public.content c on c.id = cs.content_id
      where cs.source_id = s.id
        and c.status = 'published'
        and c.robots_index = true
        and c.published_at <= now()
    ), '[]'::jsonb),
    'versions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', sv.id,
        'version_label', sv.version_label,
        'observed_url', sv.observed_url,
        'publication_year', sv.publication_year,
        'license', sv.license,
        'retrieved_at', sv.retrieved_at,
        'valid_from', sv.valid_from,
        'valid_to', sv.valid_to
      ) order by sv.retrieved_at desc)
      from public.source_versions sv
      where sv.source_id = s.id
    ), '[]'::jsonb)
  )
  from public.sources s
  where s.id = p_source_id
    and s.status = 'active'
    and exists (
      select 1 from public.content_sources cs
      join public.content c on c.id = cs.content_id
      where cs.source_id = s.id and c.status='published' and c.robots_index=true and c.published_at <= now()
    );
$$;

revoke all on function public.api_source_detail(uuid) from public;
grant execute on function public.api_source_detail(uuid) to anon, authenticated;

commit;
