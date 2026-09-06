create or replace function private.get_research_editorial_queue_balanced(
  p_limit integer default 100,
  p_per_cluster integer default 10
)
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
  with q as (
    select *
    from private.get_research_editorial_queue(1000)
  ), ranked as (
    select
      q.*,
      row_number() over (
        partition by q.rawafid_cluster
        order by q.editorial_priority desc, q.publication_date desc, q.cited_by_count desc, q.id
      ) as cluster_position
    from q
  )
  select
    r.id,
    r.title,
    r.doi,
    r.source_url,
    r.publication_date,
    r.work_type,
    r.evidence_kind_ar,
    r.journal_title,
    r.cited_by_count,
    r.is_open_access,
    r.rawafid_cluster,
    r.rawafid_cluster_ar,
    r.primary_topic,
    r.editorial_priority,
    concat(r.priority_reason, ' · ترتيب القطاع #', r.cluster_position::text) as priority_reason
  from ranked r
  where r.cluster_position <= greatest(1, least(coalesce(p_per_cluster,10),100))
  order by r.cluster_position asc, r.editorial_priority desc, r.publication_date desc, r.id
  limit greatest(1, least(coalesce(p_limit,100),1000));
$$;

revoke all on function private.get_research_editorial_queue_balanced(integer, integer) from public, anon, authenticated;
grant execute on function private.get_research_editorial_queue_balanced(integer, integer) to postgres;