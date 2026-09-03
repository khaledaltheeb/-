alter table internal_search_v2.chunks
  add column if not exists embedding_locked_at timestamptz,
  add column if not exists embedding_attempts integer not null default 0,
  add column if not exists embedding_last_error text;

create index if not exists search_v2_chunks_embedding_pending_idx
  on internal_search_v2.chunks (id)
  where is_public=true and embedding is null and embedding_locked_at is null;

create or replace function public.search_v2_claim_embedding_batch(p_limit integer default 32)
returns table (
  id bigint,
  title text,
  heading text,
  content_text text,
  content_hash text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with candidates as materialized (
    select c.id
    from internal_search_v2.chunks c
    where c.is_public=true
      and c.embedding is null
      and (c.embedding_locked_at is null or c.embedding_locked_at < pg_catalog.now() - interval '10 minutes')
      and c.embedding_attempts < 5
    order by c.id
    for update skip locked
    limit greatest(1,least(coalesce(p_limit,32),64))
  ),
  claimed as (
    update internal_search_v2.chunks c
    set embedding_locked_at=pg_catalog.now(),
        embedding_attempts=c.embedding_attempts+1,
        embedding_last_error=null,
        updated_at=pg_catalog.now()
    from candidates x
    where c.id=x.id
    returning c.id,c.title,c.heading,c.content_text,c.content_hash
  )
  select claimed.id,claimed.title,claimed.heading,claimed.content_text,claimed.content_hash
  from claimed
  order by claimed.id;
end;
$$;

revoke all on function public.search_v2_claim_embedding_batch(integer) from public,anon,authenticated;
grant execute on function public.search_v2_claim_embedding_batch(integer) to service_role;

create or replace function public.search_v2_store_embedding_batch(
  p_items jsonb,
  p_model text,
  p_version integer default 1
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer := 0;
begin
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array' then
    raise exception 'p_items must be a JSON array';
  end if;

  with incoming as materialized (
    select
      (x->>'id')::bigint as id,
      x->>'content_hash' as content_hash,
      (x->>'embedding')::extensions.vector(512) as embedding
    from pg_catalog.jsonb_array_elements(p_items) as t(x)
    where x ? 'id' and x ? 'content_hash' and x ? 'embedding'
  )
  update internal_search_v2.chunks c
  set embedding=i.embedding,
      embedding_model=pg_catalog.left(coalesce(p_model,'unknown'),120),
      embedding_version=greatest(1,coalesce(p_version,1)),
      embedding_locked_at=null,
      embedding_last_error=null,
      updated_at=pg_catalog.now()
  from incoming i
  where c.id=i.id
    and c.content_hash=i.content_hash
    and c.is_public=true;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.search_v2_store_embedding_batch(jsonb,text,integer) from public,anon,authenticated;
grant execute on function public.search_v2_store_embedding_batch(jsonb,text,integer) to service_role;

create or replace function public.search_v2_fail_embedding_batch(
  p_ids bigint[],
  p_error text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer := 0;
begin
  update internal_search_v2.chunks c
  set embedding_locked_at=null,
      embedding_last_error=pg_catalog.left(coalesce(p_error,'unknown embedding failure'),500),
      updated_at=pg_catalog.now()
  where c.id=any(coalesce(p_ids,'{}'::bigint[]));
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.search_v2_fail_embedding_batch(bigint[],text) from public,anon,authenticated;
grant execute on function public.search_v2_fail_embedding_batch(bigint[],text) to service_role;

create or replace function public.search_v2_process_index_jobs(p_limit integer default 20)
returns table(entity_id uuid, chunks_written integer)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with jobs as materialized (
    select j.entity_id
    from internal_search_v2.index_jobs j
    where j.entity_type='content'
      and j.available_at<=pg_catalog.now()
      and (j.locked_at is null or j.locked_at<pg_catalog.now()-interval '10 minutes')
    order by j.available_at,j.entity_id
    for update skip locked
    limit greatest(1,least(coalesce(p_limit,20),100))
  ),
  locked as materialized (
    update internal_search_v2.index_jobs j
    set locked_at=pg_catalog.now(),attempts=j.attempts+1,updated_at=pg_catalog.now()
    from jobs x
    where j.entity_type='content' and j.entity_id=x.entity_id
    returning j.entity_id
  ),
  rebuilt as materialized (
    select l.entity_id,internal_search_v2.rebuild_content_chunks(l.entity_id) as chunks_written
    from locked l
  ),
  cleared as (
    delete from internal_search_v2.index_jobs j
    using rebuilt r
    where j.entity_type='content' and j.entity_id=r.entity_id
    returning j.entity_id
  )
  select r.entity_id,r.chunks_written from rebuilt r order by r.entity_id;
end;
$$;

revoke all on function public.search_v2_process_index_jobs(integer) from public,anon,authenticated;
grant execute on function public.search_v2_process_index_jobs(integer) to service_role;
