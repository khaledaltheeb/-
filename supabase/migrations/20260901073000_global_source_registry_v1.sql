begin;

create extension if not exists pgcrypto;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  canonical_url text not null,
  normalized_url text not null,
  title text,
  publisher text,
  source_type text,
  authority_tier text,
  publication_year integer check (publication_year is null or publication_year between 1000 and 3000),
  doi text,
  pmid text,
  license text,
  rights_note text,
  language text,
  status text not null default 'active' check (status in ('active','superseded','withdrawn','unavailable')),
  metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sources_canonical_https check (canonical_url ~* '^https://')
);

create unique index if not exists sources_normalized_url_key on public.sources (normalized_url);
create index if not exists sources_publisher_idx on public.sources (publisher);
create index if not exists sources_doi_idx on public.sources (doi) where doi is not null;
create index if not exists sources_pmid_idx on public.sources (pmid) where pmid is not null;
create index if not exists sources_status_idx on public.sources (status);

create table if not exists public.source_versions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  version_label text,
  observed_url text not null,
  title text,
  publisher text,
  publication_year integer check (publication_year is null or publication_year between 1000 and 3000),
  license text,
  checksum_sha256 text check (checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-f]{64}$'),
  retrieved_at timestamptz not null default now(),
  valid_from timestamptz,
  valid_to timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists source_versions_source_idx on public.source_versions (source_id, retrieved_at desc);
create unique index if not exists source_versions_source_checksum_key on public.source_versions (source_id, checksum_sha256) where checksum_sha256 is not null;

create table if not exists public.content_sources (
  content_id uuid not null references public.content(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete restrict,
  source_version_id uuid references public.source_versions(id) on delete set null,
  citation_order integer,
  citation_label text,
  relationship text not null default 'reference' check (relationship in ('reference','evidence','guideline','dataset','review','rights','inspiration')),
  attribution_text text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (content_id, source_id)
);

create index if not exists content_sources_source_idx on public.content_sources (source_id);
create index if not exists content_sources_content_order_idx on public.content_sources (content_id, citation_order nulls last);

alter table public.sources enable row level security;
alter table public.source_versions enable row level security;
alter table public.content_sources enable row level security;

revoke all on public.sources from anon, authenticated;
revoke all on public.source_versions from anon, authenticated;
revoke all on public.content_sources from anon, authenticated;

create or replace function public.api_source_registry(
  p_limit integer default 25,
  p_offset integer default 0,
  p_publisher text default null,
  p_type text default null,
  p_q text default null
)
returns table (
  id uuid,
  canonical_url text,
  title text,
  publisher text,
  source_type text,
  authority_tier text,
  publication_year integer,
  doi text,
  pmid text,
  license text,
  status text,
  cited_by bigint,
  updated_at timestamptz
)
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select
    s.id, s.canonical_url, s.title, s.publisher, s.source_type, s.authority_tier,
    s.publication_year, s.doi, s.pmid, s.license, s.status,
    count(distinct cs.content_id)::bigint as cited_by,
    s.updated_at
  from public.sources s
  join public.content_sources cs on cs.source_id = s.id
  join public.content c on c.id = cs.content_id
  where s.status = 'active'
    and c.status = 'published'
    and c.robots_index = true
    and c.published_at <= now()
    and (p_publisher is null or s.publisher ilike p_publisher)
    and (p_type is null or s.source_type = p_type)
    and (p_q is null or s.title ilike '%' || p_q || '%' or s.publisher ilike '%' || p_q || '%' or s.canonical_url ilike '%' || p_q || '%')
  group by s.id
  order by count(distinct cs.content_id) desc, s.updated_at desc, s.id
  limit greatest(1, least(coalesce(p_limit,25),100))
  offset greatest(coalesce(p_offset,0),0);
$$;

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

grant execute on function public.api_source_registry(integer,integer,text,text,text) to anon, authenticated;
grant execute on function public.api_source_detail(uuid) to anon, authenticated;

with extracted as (
  select
    c.id as content_id,
    ref,
    ordinality::integer as citation_order,
    trim(ref->>'url') as url,
    nullif(trim(ref->>'title'),'') as title,
    nullif(trim(ref->>'publisher'),'') as publisher,
    nullif(trim(ref->>'source_type'),'') as source_type,
    nullif(trim(ref->>'authority_tier'),'') as authority_tier,
    case when (ref->>'year') ~ '^[0-9]{4}$' then (ref->>'year')::integer else null end as publication_year,
    nullif(trim(ref->>'doi'),'') as doi,
    nullif(trim(ref->>'pmid'),'') as pmid,
    nullif(trim(ref->>'license'),'') as license
  from public.content c
  cross join lateral jsonb_array_elements(c.references_json) with ordinality as r(ref, ordinality)
  where jsonb_typeof(c.references_json)='array'
    and ref ? 'url'
    and trim(ref->>'url') ~* '^https://'
), normalized as (
  select *, lower(regexp_replace(regexp_replace(url, '#.*$', ''), '/+$', '')) as normalized_url
  from extracted
), upserted as (
  insert into public.sources (
    canonical_url, normalized_url, title, publisher, source_type, authority_tier,
    publication_year, doi, pmid, license, metadata, last_seen_at
  )
  select distinct on (normalized_url)
    url, normalized_url, title, publisher, source_type, authority_tier,
    publication_year, doi, pmid, license, '{}'::jsonb, now()
  from normalized
  order by normalized_url, citation_order
  on conflict (normalized_url) do update set
    title = coalesce(public.sources.title, excluded.title),
    publisher = coalesce(public.sources.publisher, excluded.publisher),
    source_type = coalesce(public.sources.source_type, excluded.source_type),
    authority_tier = coalesce(public.sources.authority_tier, excluded.authority_tier),
    publication_year = coalesce(public.sources.publication_year, excluded.publication_year),
    doi = coalesce(public.sources.doi, excluded.doi),
    pmid = coalesce(public.sources.pmid, excluded.pmid),
    license = coalesce(public.sources.license, excluded.license),
    last_seen_at = now(),
    updated_at = now()
  returning id, normalized_url
)
insert into public.content_sources (content_id, source_id, citation_order)
select n.content_id, s.id, min(n.citation_order)
from normalized n
join public.sources s on s.normalized_url = n.normalized_url
group by n.content_id, s.id
on conflict (content_id, source_id) do update set
  citation_order = least(coalesce(public.content_sources.citation_order, excluded.citation_order), excluded.citation_order),
  updated_at = now();

insert into public.source_versions (
  source_id, version_label, observed_url, title, publisher, publication_year, license, metadata
)
select
  s.id,
  'legacy-reference-import-v1',
  s.canonical_url,
  s.title,
  s.publisher,
  s.publication_year,
  s.license,
  jsonb_build_object('imported_from','content.references_json')
from public.sources s
where not exists (select 1 from public.source_versions sv where sv.source_id=s.id);

commit;