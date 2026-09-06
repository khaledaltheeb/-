create or replace function private.link_research_catalog_publications()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_linked integer := 0;
begin
  with published as (
    select
      c.id,
      c.canonical_url,
      lower(regexp_replace(coalesce(c.schema_json->>'doi',''), '^https?://doi.org/', '', 'i')) as doi_norm,
      lower(coalesce(c.schema_json->>'source_url','')) as source_norm
    from public.content c
    where c.content_type = 'research'
      and c.status = 'published'
      and c.canonical_url like '/magazine/%'
  ), matched as (
    select distinct on (rc.id)
      rc.id as rc_id,
      p.id as content_id,
      p.canonical_url
    from public.research_catalog rc
    cross join published p
    where (p.doi_norm <> '' and lower(regexp_replace(coalesce(rc.doi,''), '^https?://doi.org/', '', 'i')) = p.doi_norm)
       or (p.source_norm <> '' and lower(coalesce(rc.source_url,'')) = p.source_norm)
    order by rc.id, p.id
  )
  update public.research_catalog rc
  set metadata = coalesce(rc.metadata, '{}'::jsonb) || jsonb_build_object(
    'editorial_status', 'published',
    'editorial_content_id', m.content_id,
    'editorial_content_url', m.canonical_url,
    'editorial_linked_at', now()
  )
  from matched m
  where rc.id = m.rc_id
    and (
      coalesce(rc.metadata->>'editorial_status','') <> 'published'
      or coalesce(rc.metadata->>'editorial_content_url','') <> m.canonical_url
    );
  get diagnostics v_linked = row_count;

  return jsonb_build_object(
    'success', true,
    'newly_linked', v_linked,
    'published_catalog_records', (
      select count(*) from public.research_catalog
      where metadata->>'editorial_status' = 'published'
    ),
    'finished_at', clock_timestamp()
  );
end;
$$;

create or replace function private.get_research_editorial_queue(p_limit integer default 100)
returns table (
  id uuid,
  title text,
  doi text,
  source_url text,
  publication_date date,
  work_type text,
  evidence_kind_ar text,
  journal_title text,
  cited_by_count integer,
  is_open_access boolean,
  rawafid_cluster text,
  rawafid_cluster_ar text,
  primary_topic text,
  editorial_priority integer,
  priority_reason text
)
language sql
stable
security invoker
set search_path = ''
as $$
  with candidates as (
    select
      rc.*,
      lower(coalesce(rc.title,'')) as title_lc,
      (
        case
          when lower(coalesce(rc.title,'')) ~ 'network meta-analysis|network meta analysis' then 105
          when lower(coalesce(rc.title,'')) ~ 'systematic review' and lower(coalesce(rc.title,'')) ~ 'meta-analysis|meta analysis' then 100
          when lower(coalesce(rc.title,'')) ~ 'meta-analysis|meta analysis' then 95
          when lower(coalesce(rc.title,'')) ~ 'systematic review' then 90
          when lower(coalesce(rc.title,'')) ~ 'randomized controlled trial|randomised controlled trial' then 85
          when lower(coalesce(rc.title,'')) ~ 'clinical trial' then 80
          when lower(coalesce(rc.title,'')) ~ 'guideline|consensus statement|practice recommendation' then 78
          when lower(coalesce(rc.title,'')) ~ 'cohort|longitudinal' then 65
          when lower(coalesce(rc.title,'')) ~ 'case-control|case control' then 58
          else 40
        end
        + case when rc.is_open_access then 10 else 0 end
        + case when rc.doi is not null then 5 else 0 end
        + case
            when rc.publication_date >= current_date - 30 then 15
            when rc.publication_date >= current_date - 90 then 10
            when rc.publication_date >= current_date - 365 then 5
            else 0
          end
        + least(greatest(coalesce(rc.cited_by_count,0),0),10)
        + case rc.rawafid_cluster
            when 'pediatric-oncology' then 7
            when 'autism-neurodevelopment' then 6
            when 'mental-health' then 5
            when 'inclusive-special-education' then 5
            when 'epilepsy-seizures' then 5
            when 'addiction-recovery' then 5
            when 'rehabilitation-participation' then 4
            when 'child-family-parenting' then 3
            when 'learning-language-communication' then 3
            when 'shared-decision-making' then 2
            else 0
          end
      )::integer as score
    from public.research_catalog rc
    where rc.is_active = true
      and coalesce(rc.metadata->>'editorial_status','') <> 'published'
      and not exists (
        select 1
        from public.content c
        where c.content_type = 'research'
          and c.status = 'published'
          and c.canonical_url like '/magazine/%'
          and (
            (
              nullif(c.schema_json->>'doi','') is not null
              and lower(regexp_replace(coalesce(rc.doi,''), '^https?://doi.org/', '', 'i'))
                = lower(regexp_replace(c.schema_json->>'doi', '^https?://doi.org/', '', 'i'))
            )
            or (
              nullif(c.schema_json->>'source_url','') is not null
              and lower(coalesce(rc.source_url,'')) = lower(c.schema_json->>'source_url')
            )
          )
      )
  )
  select
    c.id,
    c.title,
    c.doi,
    c.source_url,
    c.publication_date,
    c.work_type,
    c.evidence_kind_ar,
    c.journal_title,
    c.cited_by_count,
    c.is_open_access,
    c.rawafid_cluster,
    c.rawafid_cluster_ar,
    c.primary_topic,
    c.score as editorial_priority,
    concat_ws(' · ',
      case
        when c.title_lc ~ 'network meta-analysis|network meta analysis' then 'تحليل شبكي'
        when c.title_lc ~ 'systematic review' and c.title_lc ~ 'meta-analysis|meta analysis' then 'مراجعة منهجية وتحليل تلوي'
        when c.title_lc ~ 'meta-analysis|meta analysis' then 'تحليل تلوي'
        when c.title_lc ~ 'systematic review' then 'مراجعة منهجية'
        when c.title_lc ~ 'randomized controlled trial|randomised controlled trial' then 'تجربة عشوائية'
        when c.title_lc ~ 'clinical trial' then 'تجربة سريرية'
        when c.title_lc ~ 'guideline|consensus statement|practice recommendation' then 'إرشاد أو توافق'
        when c.title_lc ~ 'cohort|longitudinal' then 'دراسة طولية'
        else 'دليل بحثي حديث'
      end,
      case when c.is_open_access then 'وصول مفتوح' else null end,
      case when c.doi is not null then 'DOI متاح' else null end,
      c.rawafid_cluster_ar
    ) as priority_reason
  from candidates c
  order by c.score desc, c.publication_date desc, c.cited_by_count desc, c.id
  limit greatest(1, least(coalesce(p_limit,100),1000));
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
  v_link jsonb;
begin
  v_refresh := private.refresh_research_magazine_catalog();
  v_dedupe := private.dedupe_research_magazine_catalog();
  v_link := private.link_research_catalog_publications();

  return jsonb_build_object(
    'success', coalesce((v_refresh->>'success')::boolean, false)
      and coalesce((v_dedupe->>'success')::boolean, false)
      and coalesce((v_link->>'success')::boolean, false),
    'refresh', v_refresh,
    'dedupe', v_dedupe,
    'publication_linking', v_link,
    'finished_at', clock_timestamp()
  );
end;
$$;

revoke all on function private.link_research_catalog_publications() from public, anon, authenticated;
revoke all on function private.get_research_editorial_queue(integer) from public, anon, authenticated;
revoke all on function private.refresh_research_magazine_catalog_clean() from public, anon, authenticated;
grant execute on function private.link_research_catalog_publications() to postgres;
grant execute on function private.get_research_editorial_queue(integer) to postgres;
grant execute on function private.refresh_research_magazine_catalog_clean() to postgres;