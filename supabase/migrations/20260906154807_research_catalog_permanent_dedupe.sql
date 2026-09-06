create or replace function private.dedupe_research_magazine_catalog()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_deactivated integer := 0;
  v_ranked integer := 0;
begin
  with normalized as (
    select
      rc.id,
      rc.openalex_id,
      rc.title,
      rc.doi,
      rc.source_url,
      rc.journal_title,
      rc.cited_by_count,
      rc.publication_date,
      lower(regexp_replace(btrim(rc.title), '[^[:alnum:]]+', ' ', 'g')) as norm_title,
      case
        when lower(coalesce(rc.doi, '') || ' ' || coalesce(rc.source_url, '')) ~ '(zenodo|figshare|osf\.io|10\.5281|10\.6084|10\.17613|10\.26180|10\.20372)'
          then 1
        else 0
      end as repository_copy
    from public.research_catalog rc
    where rc.is_active
  ), ranked as (
    select
      n.*,
      row_number() over (
        partition by n.norm_title
        order by
          n.repository_copy asc,
          (n.journal_title is not null) desc,
          (n.doi is not null) desc,
          n.cited_by_count desc,
          n.publication_date desc,
          n.openalex_id
      ) as rn,
      first_value(n.id) over (
        partition by n.norm_title
        order by
          n.repository_copy asc,
          (n.journal_title is not null) desc,
          (n.doi is not null) desc,
          n.cited_by_count desc,
          n.publication_date desc,
          n.openalex_id
      ) as keep_id,
      first_value(n.openalex_id) over (
        partition by n.norm_title
        order by
          n.repository_copy asc,
          (n.journal_title is not null) desc,
          (n.doi is not null) desc,
          n.cited_by_count desc,
          n.publication_date desc,
          n.openalex_id
      ) as keep_openalex
    from normalized n
    where length(n.norm_title) >= 20
  )
  update public.research_catalog rc
  set
    is_active = false,
    metadata = coalesce(rc.metadata, '{}'::jsonb) || jsonb_build_object(
      'dedupe_status', 'duplicate',
      'duplicate_of_id', r.keep_id,
      'duplicate_of_openalex_id', r.keep_openalex,
      'dedupe_key', 'normalized_title',
      'deduped_at', now()
    )
  from ranked r
  where rc.id = r.id
    and r.rn > 1;
  get diagnostics v_deactivated = row_count;

  with reranked as (
    select
      rc.id,
      row_number() over (
        order by rc.publication_date desc, rc.cited_by_count desc, rc.first_seen_at desc, rc.openalex_id
      )::integer as new_rank
    from public.research_catalog rc
    where rc.is_active
  )
  update public.research_catalog rc
  set catalog_rank = r.new_rank
  from reranked r
  where rc.id = r.id
    and rc.catalog_rank is distinct from r.new_rank;
  get diagnostics v_ranked = row_count;

  return jsonb_build_object(
    'success', true,
    'deactivated_duplicates', v_deactivated,
    'reranked_records', v_ranked,
    'active_records', (select count(*) from public.research_catalog where is_active),
    'finished_at', clock_timestamp()
  );
end;
$$;

create or replace function private.refresh_research_magazine_catalog_clean()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_refresh jsonb;
  v_dedupe jsonb;
begin
  v_refresh := private.refresh_research_magazine_catalog();
  v_dedupe := private.dedupe_research_magazine_catalog();

  return jsonb_build_object(
    'success', coalesce((v_refresh->>'success')::boolean, false)
      and coalesce((v_dedupe->>'success')::boolean, false),
    'refresh', v_refresh,
    'dedupe', v_dedupe,
    'finished_at', clock_timestamp()
  );
end;
$$;

revoke all on function private.dedupe_research_magazine_catalog() from public, anon, authenticated;
revoke all on function private.refresh_research_magazine_catalog_clean() from public, anon, authenticated;
grant execute on function private.dedupe_research_magazine_catalog() to postgres;
grant execute on function private.refresh_research_magazine_catalog_clean() to postgres;

do $$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid
  from cron.job
  where jobname = 'refresh-research-magazine-catalog'
  order by jobid
  limit 1;

  if v_jobid is null then
    raise exception 'Cron job refresh-research-magazine-catalog was not found';
  end if;

  perform cron.alter_job(
    v_jobid,
    command => 'select private.refresh_research_magazine_catalog_clean();'
  );
end;
$$;