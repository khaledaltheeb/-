begin;

create or replace function private.sync_content_source_registry(p_content_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_refs jsonb;
begin
  select references_json into v_refs from public.content where id = p_content_id;
  if not found then return; end if;

  create temporary table if not exists pg_temp.rawafid_refs (
    normalized_url text primary key,
    url text not null,
    title text,
    publisher text,
    source_type text,
    authority_tier text,
    publication_year integer,
    doi text,
    pmid text,
    license text,
    citation_order integer
  ) on commit drop;
  truncate pg_temp.rawafid_refs;

  if jsonb_typeof(v_refs) = 'array' then
    insert into pg_temp.rawafid_refs (
      normalized_url,url,title,publisher,source_type,authority_tier,publication_year,doi,pmid,license,citation_order
    )
    select distinct on (normalized_url)
      normalized_url,url,title,publisher,source_type,authority_tier,publication_year,doi,pmid,license,citation_order
    from (
      select
        lower(regexp_replace(regexp_replace(trim(ref->>'url'), '#.*$', ''), '/+$', '')) as normalized_url,
        trim(ref->>'url') as url,
        nullif(trim(ref->>'title'),'') as title,
        nullif(trim(ref->>'publisher'),'') as publisher,
        nullif(trim(ref->>'source_type'),'') as source_type,
        nullif(trim(ref->>'authority_tier'),'') as authority_tier,
        case when (ref->>'year') ~ '^[0-9]{4}$' then (ref->>'year')::integer else null end as publication_year,
        nullif(trim(ref->>'doi'),'') as doi,
        nullif(trim(ref->>'pmid'),'') as pmid,
        nullif(trim(ref->>'license'),'') as license,
        ordinality::integer as citation_order
      from jsonb_array_elements(v_refs) with ordinality as r(ref, ordinality)
      where ref ? 'url' and trim(ref->>'url') ~* '^https://'
    ) q
    where normalized_url <> ''
    order by normalized_url, citation_order;
  end if;

  insert into public.sources (
    canonical_url,normalized_url,title,publisher,source_type,authority_tier,publication_year,doi,pmid,license,last_seen_at
  )
  select url,normalized_url,title,publisher,source_type,authority_tier,publication_year,doi,pmid,license,now()
  from pg_temp.rawafid_refs
  on conflict (normalized_url) do update set
    title = coalesce(excluded.title, public.sources.title),
    publisher = coalesce(excluded.publisher, public.sources.publisher),
    source_type = coalesce(excluded.source_type, public.sources.source_type),
    authority_tier = coalesce(excluded.authority_tier, public.sources.authority_tier),
    publication_year = coalesce(excluded.publication_year, public.sources.publication_year),
    doi = coalesce(excluded.doi, public.sources.doi),
    pmid = coalesce(excluded.pmid, public.sources.pmid),
    license = coalesce(excluded.license, public.sources.license),
    last_seen_at = now(),
    updated_at = now();

  insert into public.source_versions (source_id,version_label,observed_url,title,publisher,publication_year,license,metadata)
  select s.id,'content-reference-sync-v1',r.url,r.title,r.publisher,r.publication_year,r.license,
    jsonb_build_object('content_id',p_content_id)
  from pg_temp.rawafid_refs r
  join public.sources s on s.normalized_url=r.normalized_url
  where not exists (
    select 1 from public.source_versions sv
    where sv.source_id=s.id
      and sv.observed_url=r.url
      and coalesce(sv.title,'')=coalesce(r.title,'')
      and coalesce(sv.publisher,'')=coalesce(r.publisher,'')
      and coalesce(sv.publication_year,-1)=coalesce(r.publication_year,-1)
      and coalesce(sv.license,'')=coalesce(r.license,'')
  );

  insert into public.content_sources (content_id,source_id,citation_order)
  select p_content_id,s.id,r.citation_order
  from pg_temp.rawafid_refs r
  join public.sources s on s.normalized_url=r.normalized_url
  on conflict (content_id,source_id) do update set citation_order=excluded.citation_order,updated_at=now();

  delete from public.content_sources cs
  where cs.content_id=p_content_id
    and not exists (
      select 1 from pg_temp.rawafid_refs r
      join public.sources s on s.normalized_url=r.normalized_url
      where s.id=cs.source_id
    );
end;
$$;

create or replace function private.content_source_registry_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  perform private.sync_content_source_registry(new.id);
  return new;
end;
$$;

drop trigger if exists content_source_registry_sync on public.content;
create trigger content_source_registry_sync
after insert or update of references_json on public.content
for each row execute function private.content_source_registry_trigger();

revoke all on function private.sync_content_source_registry(uuid) from public;
revoke all on function private.content_source_registry_trigger() from public;

commit;