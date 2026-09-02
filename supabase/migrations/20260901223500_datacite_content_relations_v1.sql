begin;

create index if not exists source_related_identifiers_rawafid_content_idx
on public.source_related_identifiers ((provenance->>'rawafid_content_id'))
where relation_scheme = 'DataCite' and relation_type = 'IsReferencedBy';

create or replace function private.refresh_content_related_identifiers(p_content_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_content public.content%rowtype;
  v_url text;
begin
  delete from public.source_related_identifiers
  where provenance->>'rawafid_content_id' = p_content_id::text
    and relation_scheme = 'DataCite'
    and relation_type = 'IsReferencedBy';

  select * into v_content from public.content where id = p_content_id;
  if not found then return; end if;
  if v_content.status <> 'published' or not v_content.robots_index or v_content.published_at is null or v_content.published_at > now() then return; end if;
  if v_content.canonical_url is null or btrim(v_content.canonical_url) = '' then return; end if;

  v_url := case
    when v_content.canonical_url ~* '^https://' then v_content.canonical_url
    when v_content.canonical_url like '/%' then 'https://healthrenewal.org' || v_content.canonical_url
    else 'https://healthrenewal.org/' || v_content.canonical_url
  end;

  insert into public.source_related_identifiers (
    source_id,
    related_identifier,
    related_identifier_type,
    relation_type,
    relation_scheme,
    scheme_uri,
    provenance,
    verified_at
  )
  select
    cs.source_id,
    v_url,
    'URL',
    'IsReferencedBy',
    'DataCite',
    'https://schema.datacite.org/',
    jsonb_build_object(
      'kind', 'rawafid_content_citation',
      'rawafid_content_id', v_content.id,
      'rawafid_content_slug', v_content.slug,
      'materialized_from', 'content_sources'
    ),
    now()
  from public.content_sources cs
  where cs.content_id = p_content_id
  on conflict (source_id, related_identifier, related_identifier_type, relation_type)
  do update set
    relation_scheme = excluded.relation_scheme,
    scheme_uri = excluded.scheme_uri,
    provenance = excluded.provenance,
    verified_at = excluded.verified_at,
    updated_at = now();
end;
$$;

create or replace function private.content_source_related_identifier_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    perform private.refresh_content_related_identifiers(old.content_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.content_id is distinct from new.content_id then
    perform private.refresh_content_related_identifiers(old.content_id);
  end if;
  perform private.refresh_content_related_identifiers(new.content_id);
  return new;
end;
$$;

create or replace function private.content_related_identifier_refresh_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  perform private.refresh_content_related_identifiers(new.id);
  return new;
end;
$$;

drop trigger if exists content_source_related_identifier_sync on public.content_sources;
create trigger content_source_related_identifier_sync
after insert or update or delete on public.content_sources
for each row execute function private.content_source_related_identifier_trigger();

drop trigger if exists content_related_identifier_refresh on public.content;
create trigger content_related_identifier_refresh
after insert or update of canonical_url, status, robots_index, published_at on public.content
for each row execute function private.content_related_identifier_refresh_trigger();

revoke all on function private.refresh_content_related_identifiers(uuid) from public;
revoke all on function private.content_source_related_identifier_trigger() from public;
revoke all on function private.content_related_identifier_refresh_trigger() from public;

insert into public.source_related_identifiers (
  source_id,
  related_identifier,
  related_identifier_type,
  relation_type,
  relation_scheme,
  scheme_uri,
  provenance,
  verified_at
)
select
  cs.source_id,
  case
    when c.canonical_url ~* '^https://' then c.canonical_url
    when c.canonical_url like '/%' then 'https://healthrenewal.org' || c.canonical_url
    else 'https://healthrenewal.org/' || c.canonical_url
  end,
  'URL',
  'IsReferencedBy',
  'DataCite',
  'https://schema.datacite.org/',
  jsonb_build_object(
    'kind', 'rawafid_content_citation',
    'rawafid_content_id', c.id,
    'rawafid_content_slug', c.slug,
    'materialized_from', 'content_sources'
  ),
  now()
from public.content_sources cs
join public.content c on c.id = cs.content_id
where c.status = 'published'
  and c.robots_index = true
  and c.published_at <= now()
  and c.canonical_url is not null
  and btrim(c.canonical_url) <> ''
on conflict (source_id, related_identifier, related_identifier_type, relation_type)
do update set
  relation_scheme = excluded.relation_scheme,
  scheme_uri = excluded.scheme_uri,
  provenance = excluded.provenance,
  verified_at = excluded.verified_at,
  updated_at = now();

insert into public.source_rights_profiles (
  source_id,
  content_reuse_status,
  content_license,
  rights_basis,
  verified_at,
  provenance
)
select
  s.id,
  'unknown',
  s.license,
  'record_license',
  now(),
  jsonb_build_object('kind', 'source_registry_license_projection')
from public.sources s
where s.license is not null
  and btrim(s.license) <> ''
  and not exists (
    select 1 from public.source_rights_profiles srp
    where srp.source_id = s.id and srp.source_version_id is null
  );

notify pgrst, 'reload schema';
commit;
