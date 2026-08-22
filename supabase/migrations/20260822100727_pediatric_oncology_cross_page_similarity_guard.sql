create or replace function private.pediatric_oncology_cross_page_similarity_audit(p_id uuid)
returns jsonb
language plpgsql
stable
set search_path = ''
as $function$
declare
  v public.content%rowtype;
  v_max numeric := 0;
  v_slug text;
  v_title text;
  v_threshold constant numeric := 0.58;
begin
  select * into v from public.content where id=p_id;
  if v.id is null then
    return pg_catalog.jsonb_build_object('passed',false,'reason','content-not-found');
  end if;

  select x.score,x.slug,x.title into v_max,v_slug,v_title
  from (
    select c.slug,c.title,
      extensions.similarity(
        pg_catalog.left(pg_catalog.regexp_replace(coalesce(v.body_text,''),'\s+',' ','g'),12000),
        pg_catalog.left(pg_catalog.regexp_replace(coalesce(c.body_text,''),'\s+',' ','g'),12000)
      )::numeric as score
    from public.content c
    join public.sectors s on s.id=c.sector_id
    where c.id<>v.id
      and s.slug='pediatric-oncology'
      and c.status='published'::public.content_status
      and c.content_type=v.content_type
      and pg_catalog.char_length(coalesce(c.body_text,''))>1000
    order by score desc
    limit 1
  ) x;

  return pg_catalog.jsonb_build_object(
    'passed',coalesce(v_max,0)<v_threshold,
    'threshold',v_threshold,
    'max_body_similarity',coalesce(v_max,0),
    'closest_slug',v_slug,
    'closest_title',v_title,
    'method','normalized-first-12000-char-pg-trgm-v1'
  );
end;
$function$;

create or replace function private.pediatric_oncology_similarity_release_guard()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  v_is_pediatric boolean := false;
  v_is_release_transition boolean := false;
  v_max numeric := 0;
begin
  select exists(
    select 1 from public.sectors s
    where s.id=new.sector_id and s.slug='pediatric-oncology' and s.is_active
  ) into v_is_pediatric;

  if not v_is_pediatric then return new; end if;

  if tg_op='INSERT' then
    v_is_release_transition := new.status in ('approved'::public.content_status,'scheduled'::public.content_status,'published'::public.content_status);
  else
    v_is_release_transition := new.status in ('approved'::public.content_status,'scheduled'::public.content_status,'published'::public.content_status)
      and old.status not in ('approved'::public.content_status,'scheduled'::public.content_status,'published'::public.content_status);
  end if;

  if not v_is_release_transition then return new; end if;

  select coalesce(max(sim),0) into v_max
  from (
    select extensions.similarity(
      pg_catalog.left(pg_catalog.regexp_replace(coalesce(new.body_text,''),'\s+',' ','g'),12000),
      pg_catalog.left(pg_catalog.regexp_replace(coalesce(c.body_text,''),'\s+',' ','g'),12000)
    )::numeric as sim
    from public.content c
    join public.sectors s on s.id=c.sector_id
    where c.id is distinct from new.id
      and s.slug='pediatric-oncology'
      and c.status='published'::public.content_status
      and c.content_type=new.content_type
      and pg_catalog.char_length(coalesce(c.body_text,''))>1000
  ) q;

  if v_max >= 0.58 then
    raise exception 'pediatric oncology release blocked: cross-page body similarity %.3f exceeds 0.58', v_max using errcode='23514';
  end if;
  return new;
end;
$function$;

drop trigger if exists zzzz_pediatric_oncology_similarity_release_guard on public.content;
create trigger zzzz_pediatric_oncology_similarity_release_guard
before insert or update of status on public.content
for each row execute function private.pediatric_oncology_similarity_release_guard();
