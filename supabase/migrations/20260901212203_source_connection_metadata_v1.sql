begin;

create table if not exists public.source_related_identifiers (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  related_identifier text not null check (char_length(trim(related_identifier)) between 1 and 1000),
  related_identifier_type text not null check (char_length(trim(related_identifier_type)) between 1 and 80),
  relation_type text not null check (char_length(trim(relation_type)) between 1 and 120),
  relation_scheme text not null default 'DataCite' check (char_length(trim(relation_scheme)) between 1 and 80),
  related_metadata_scheme text,
  scheme_uri text,
  scheme_type text,
  provenance jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, related_identifier, related_identifier_type, relation_type)
);

create index if not exists source_related_identifiers_source_idx on public.source_related_identifiers(source_id, relation_type);
create index if not exists source_related_identifiers_identifier_idx on public.source_related_identifiers(lower(related_identifier));

create table if not exists public.source_contributors (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 500),
  contributor_type text not null default 'Contributor' check (char_length(trim(contributor_type)) between 1 and 80),
  position integer check (position is null or position between 1 and 10000),
  orcid text,
  provenance jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_contributors_orcid_canonical check (orcid is null or orcid ~ '^https://orcid\.org/[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9X]{4}$')
);

create unique index if not exists source_contributors_orcid_unique on public.source_contributors(source_id, orcid, contributor_type) where orcid is not null;
create index if not exists source_contributors_source_idx on public.source_contributors(source_id, position nulls last, display_name);

create table if not exists public.source_contributor_organizations (
  contributor_id uuid not null references public.source_contributors(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  relationship text not null default 'affiliation' check (relationship in ('affiliation','current_affiliation','former_affiliation','other')),
  provenance jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (contributor_id, organization_id, relationship)
);

create index if not exists source_contributor_orgs_org_idx on public.source_contributor_organizations(organization_id, relationship);

alter table public.source_related_identifiers enable row level security;
alter table public.source_contributors enable row level security;
alter table public.source_contributor_organizations enable row level security;

revoke all on table public.source_related_identifiers from anon, authenticated;
revoke all on table public.source_contributors from anon, authenticated;
revoke all on table public.source_contributor_organizations from anon, authenticated;

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
    'related_identifiers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'identifier', sri.related_identifier,
        'identifier_type', sri.related_identifier_type,
        'relation_type', sri.relation_type,
        'relation_scheme', sri.relation_scheme,
        'related_metadata_scheme', sri.related_metadata_scheme,
        'scheme_uri', sri.scheme_uri,
        'scheme_type', sri.scheme_type,
        'verified_at', sri.verified_at
      ) order by sri.relation_type, sri.related_identifier)
      from public.source_related_identifiers sri
      where sri.source_id = s.id
    ), '[]'::jsonb),
    'contributors', coalesce((
      select jsonb_agg(jsonb_build_object(
        'display_name', sc.display_name,
        'contributor_type', sc.contributor_type,
        'position', sc.position,
        'orcid', sc.orcid,
        'verified_at', sc.verified_at,
        'affiliations', coalesce((
          select jsonb_agg(jsonb_build_object(
            'ror_id', o.ror_id,
            'display_name', o.display_name,
            'relationship', sco.relationship,
            'verified_at', sco.verified_at
          ) order by o.display_name)
          from public.source_contributor_organizations sco
          join public.organizations o on o.id = sco.organization_id
          where sco.contributor_id = sc.id
        ), '[]'::jsonb)
      ) order by sc.position nulls last, sc.display_name)
      from public.source_contributors sc
      where sc.source_id = s.id
    ), '[]'::jsonb),
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

notify pgrst, 'reload schema';
commit;
