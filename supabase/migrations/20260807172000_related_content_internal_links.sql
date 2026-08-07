create index if not exists content_secondary_keywords_gin_idx on public.content using gin (secondary_keywords);
create index if not exists content_semantic_terms_gin_idx on public.content using gin (semantic_terms);

create or replace function public.related_public_content(p_content_id uuid,p_limit integer default 6)
returns table(id uuid,slug text,title text,excerpt text,content_type text,score double precision)
language sql
stable
security invoker
set search_path=''
as $$
  with target as (
    select c.id,c.sector_id,c.category_id,c.content_type,c.secondary_keywords,c.semantic_terms,c.search_aliases
    from public.content c
    where c.id=p_content_id and c.status='published'::public.content_status and c.published_at is not null and c.published_at<=now()
  ), ranked as (
    select c.id,c.slug,c.title,c.excerpt,c.content_type,
      (
        case when c.category_id is not null and c.category_id=t.category_id then 6.0 else 0 end +
        case when c.sector_id is not null and c.sector_id=t.sector_id then 3.0 else 0 end +
        case when c.semantic_terms && t.semantic_terms then 2.0 else 0 end +
        case when c.secondary_keywords && t.secondary_keywords then 1.5 else 0 end +
        case when c.search_aliases && t.search_aliases then 1.0 else 0 end +
        case when c.content_type=t.content_type then 0.5 else 0 end
      )::double precision as score
    from public.content c cross join target t
    where c.id<>t.id and c.status='published'::public.content_status and c.published_at is not null and c.published_at<=now() and c.robots_index=true
      and (c.category_id=t.category_id or c.sector_id=t.sector_id or c.semantic_terms && t.semantic_terms or c.secondary_keywords && t.secondary_keywords or c.search_aliases && t.search_aliases)
  )
  select r.id,r.slug,r.title,r.excerpt,r.content_type,r.score
  from ranked r
  where r.score>0
  order by r.score desc,r.title asc
  limit greatest(1,least(coalesce(p_limit,6),12));
$$;

revoke all on function public.related_public_content(uuid,integer) from public;
grant execute on function public.related_public_content(uuid,integer) to anon,authenticated,service_role;
