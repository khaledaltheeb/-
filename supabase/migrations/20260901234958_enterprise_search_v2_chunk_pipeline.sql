create extension if not exists pgmq;

create or replace function internal_search_v2.rebuild_content_chunks(p_content_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer := 0;
begin
  delete from internal_search_v2.chunks
  where entity_type='content' and entity_id=p_content_id;

  with source as materialized (
    select c.id,c.slug,c.title,c.body_text,c.updated_at,p.destination,p.published_at
    from public.content c
    join internal_search_v2.pages p
      on p.entity_type='content' and p.entity_id=c.id and p.is_public=true
    where c.id=p_content_id
      and c.status='published'::public.content_status
      and c.published_at is not null
      and c.published_at<=pg_catalog.now()
  ),
  paragraphs as materialized (
    select
      s.id,s.slug,s.title,s.destination,s.published_at,s.updated_at,
      x.ordinality::bigint as paragraph_no,
      pg_catalog.btrim(x.segment) as segment
    from source s
    cross join lateral pg_catalog.regexp_split_to_table(
      coalesce(s.body_text,''), E'\n[[:space:]]*\n+'
    ) with ordinality as x(segment,ordinality)
    where pg_catalog.btrim(x.segment)<>''
      and pg_catalog.lower(pg_catalog.btrim(x.segment)) not in
        ('paragraph','heading','list','table','faq','callout','document','doc')
  ),
  expanded as materialized (
    select
      p.*,gs.part_no,
      case
        when pg_catalog.char_length(p.segment)<=2400 then p.segment
        else pg_catalog.substr(p.segment, gs.part_no*1800+1,2200)
      end as part_text,
      p.paragraph_no*100000 + gs.part_no as order_key
    from paragraphs p
    cross join lateral pg_catalog.generate_series(
      0,
      case
        when pg_catalog.char_length(p.segment)<=2400 then 0
        else greatest(0,pg_catalog.ceil((pg_catalog.char_length(p.segment)-2200)::numeric/1800)::integer)
      end
    ) as gs(part_no)
  ),
  positioned as materialized (
    select
      e.*,
      coalesce(
        sum(pg_catalog.char_length(e.part_text)+2) over (
          partition by e.id
          order by e.order_key
          rows between unbounded preceding and 1 preceding
        ),0
      )::bigint as chars_before
    from expanded e
    where pg_catalog.btrim(e.part_text)<>''
  ),
  grouped as materialized (
    select
      id,slug,title,destination,published_at,updated_at,
      pg_catalog.floor(chars_before::numeric/2200)::integer as chunk_group,
      pg_catalog.string_agg(part_text,E'\n\n' order by order_key) as chunk_text,
      (pg_catalog.array_agg(part_text order by order_key)
        filter (where pg_catalog.char_length(part_text)<=180))[1] as heading
    from positioned
    group by id,slug,title,destination,published_at,updated_at,
      pg_catalog.floor(chars_before::numeric/2200)::integer
  ),
  numbered as (
    select
      g.*,'content'::text as entity_type,
      (pg_catalog.row_number() over (order by chunk_group)-1)::integer as chunk_index
    from grouped g
    where pg_catalog.btrim(chunk_text)<>''
  )
  insert into internal_search_v2.chunks (
    entity_type,entity_id,chunk_index,slug,title,heading,content_text,destination,
    metadata,embedding,embedding_model,embedding_version,content_hash,published_at,
    source_updated_at,is_public,updated_at
  )
  select
    entity_type,id,chunk_index,slug,title,heading,chunk_text,destination,
    pg_catalog.jsonb_build_object(
      'chunker','paragraph-window-v1',
      'target_chars',2200,
      'long_paragraph_step',1800,
      'long_paragraph_window',2200,
      'artifact_filter','v1'
    ),
    null,null,1,pg_catalog.md5(chunk_text),published_at,updated_at,true,pg_catalog.now()
  from numbered
  on conflict (entity_type,entity_id,chunk_index) do update set
    slug=excluded.slug,title=excluded.title,heading=excluded.heading,
    content_text=excluded.content_text,destination=excluded.destination,
    metadata=excluded.metadata,embedding=null,embedding_model=null,
    embedding_version=excluded.embedding_version,content_hash=excluded.content_hash,
    published_at=excluded.published_at,source_updated_at=excluded.source_updated_at,
    is_public=true,updated_at=pg_catalog.now();

  get diagnostics inserted_count = row_count;

  if inserted_count=0 then
    insert into internal_search_v2.chunks (
      entity_type,entity_id,chunk_index,slug,title,heading,content_text,destination,
      metadata,content_hash,published_at,source_updated_at,is_public,updated_at
    )
    select
      'content',p.entity_id,0,p.slug,p.title,null,
      pg_catalog.left(p.search_text,4000),p.destination,
      pg_catalog.jsonb_build_object('chunker','page-fallback-v1','artifact_filter','v1'),
      pg_catalog.md5(pg_catalog.left(p.search_text,4000)),p.published_at,p.source_updated_at,true,pg_catalog.now()
    from internal_search_v2.pages p
    where p.entity_type='content' and p.entity_id=p_content_id and p.is_public=true
      and pg_catalog.btrim(p.search_text)<>''
    on conflict (entity_type,entity_id,chunk_index) do update set
      content_text=excluded.content_text,content_hash=excluded.content_hash,
      embedding=null,embedding_model=null,updated_at=pg_catalog.now();
    get diagnostics inserted_count = row_count;
  end if;

  return inserted_count;
end;
$$;

revoke all on function internal_search_v2.rebuild_content_chunks(uuid) from public;

create table if not exists internal_search_v2.index_jobs (
  entity_type text not null,
  entity_id uuid not null,
  reason text not null default 'content-change',
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (entity_type,entity_id)
);
revoke all on internal_search_v2.index_jobs from public,anon,authenticated;

create or replace function internal_search_v2.queue_content_reindex()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op='DELETE' then
    delete from internal_search_v2.chunks where entity_type='content' and entity_id=old.id;
    delete from internal_search_v2.index_jobs where entity_type='content' and entity_id=old.id;
    return old;
  end if;

  delete from internal_search_v2.chunks where entity_type='content' and entity_id=new.id;

  if new.status='published'::public.content_status
     and new.published_at is not null
     and new.published_at<=pg_catalog.now() then
    insert into internal_search_v2.index_jobs(entity_type,entity_id,reason,available_at,locked_at,last_error,updated_at)
    values('content',new.id,'content-change',pg_catalog.now(),null,null,pg_catalog.now())
    on conflict(entity_type,entity_id) do update set
      reason='content-change',available_at=pg_catalog.now(),locked_at=null,last_error=null,updated_at=pg_catalog.now();
  else
    delete from internal_search_v2.index_jobs where entity_type='content' and entity_id=new.id;
  end if;
  return new;
end;
$$;

revoke all on function internal_search_v2.queue_content_reindex() from public;

drop trigger if exists search_v2_queue_content_reindex on public.content;
create trigger search_v2_queue_content_reindex
after insert or delete or update of body_text,body_json,title,excerpt,status,published_at,primary_keyword,secondary_keywords,semantic_terms,search_aliases,canonical_url,robots_index
on public.content
for each row execute function internal_search_v2.queue_content_reindex();

create index if not exists search_v2_index_jobs_available_idx
  on internal_search_v2.index_jobs (available_at,updated_at)
  where locked_at is null;
