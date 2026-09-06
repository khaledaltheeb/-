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
      lower(coalesce(rc.journal_title,'') || ' ' || coalesce(rc.publisher,'') || ' ' || coalesce(rc.source_url,'') || ' ' || coalesce(rc.doi,'')) as source_lc,
      case
        when lower(coalesce(rc.journal_title,'') || ' ' || coalesce(rc.publisher,'') || ' ' || coalesce(rc.source_url,'') || ' ' || coalesce(rc.doi,''))
          ~ '(zenodo|figshare|open science framework|osf\.io|eprints|institutional repository|research square|medrxiv|biorxiv|ssrn|arxiv|preprint)'
          then true
        else false
      end as repository_or_preprint,
      case
        when nullif(btrim(rc.journal_title),'') is not null
         and lower(coalesce(rc.journal_title,'') || ' ' || coalesce(rc.publisher,'') || ' ' || coalesce(rc.source_url,'') || ' ' || coalesce(rc.doi,''))
          !~ '(zenodo|figshare|open science framework|osf\.io|eprints|institutional repository|research square|medrxiv|biorxiv|ssrn|arxiv|preprint)'
          then true
        else false
      end as journal_likely,
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
        + case
            when nullif(btrim(rc.journal_title),'') is not null
             and lower(coalesce(rc.journal_title,'') || ' ' || coalesce(rc.publisher,'') || ' ' || coalesce(rc.source_url,'') || ' ' || coalesce(rc.doi,''))
              !~ '(zenodo|figshare|open science framework|osf\.io|eprints|institutional repository|research square|medrxiv|biorxiv|ssrn|arxiv|preprint)'
              then 12
            else 0
          end
        - case
            when lower(coalesce(rc.journal_title,'') || ' ' || coalesce(rc.publisher,'') || ' ' || coalesce(rc.source_url,'') || ' ' || coalesce(rc.doi,''))
              ~ '(zenodo|figshare|open science framework|osf\.io|eprints|institutional repository|research square|medrxiv|biorxiv|ssrn|arxiv|preprint)'
              then 45
            else 0
          end
        - case when rc.work_type = 'dissertation' then 18 else 0 end
        - case when lower(coalesce(rc.title,'')) ~ '(^|[^a-z])(study )?protocol([^a-z]|$)|trial protocol|protocol for ' then 35 else 0 end
        - case when lower(coalesce(rc.title,'')) ~ 'dataset|open data|data descriptor' then 20 else 0 end
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
      case when c.journal_likely then 'مصدر مجلاتي/دوري' else null end,
      case when c.repository_or_preprint then 'مستودع أو ما قبل التحكيم: يحتاج تحققًا إضافيًا' else null end,
      case when c.title_lc ~ '(^|[^a-z])(study )?protocol([^a-z]|$)|trial protocol|protocol for ' then 'بروتوكول دون نتائج نهائية' else null end,
      case when c.is_open_access then 'وصول مفتوح' else null end,
      case when c.doi is not null then 'DOI متاح' else null end,
      c.rawafid_cluster_ar
    ) as priority_reason
  from candidates c
  order by c.score desc, c.publication_date desc, c.cited_by_count desc, c.id
  limit greatest(1, least(coalesce(p_limit,100),1000));
$$;

revoke all on function private.get_research_editorial_queue(integer) from public, anon, authenticated;
grant execute on function private.get_research_editorial_queue(integer) to postgres;