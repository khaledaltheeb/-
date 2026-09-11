create or replace function private.publish_gold_standard_guide_v1(
  p jsonb,
  title_similarity_limit numeric default 0.72,
  body_similarity_limit numeric default 0.62
)
returns table(
  id uuid,
  slug text,
  canonical_url text,
  status public.content_status,
  arabic_words integer,
  h2_count integer,
  h3_count integer,
  faq_count integer,
  reference_count integer,
  exact_long_paragraph_matches integer,
  max_title_similarity numeric,
  max_body_similarity numeric
)
language plpgsql
set search_path to 'public','private','extensions','pg_temp'
as $$
declare
  v_id uuid;
  v_slug text := nullif(p->>'slug','');
  v_canonical text := nullif(p->>'canonical_url','');
  v_primary_keyword text := nullif(p->>'primary_keyword','');
  v_blocks jsonb := coalesce(p->'blocks','[]'::jsonb);
  v_refs jsonb := coalesce(p->'references','[]'::jsonb);
  v_schema jsonb := coalesce(p->'schema_json','{}'::jsonb);
  v_body text;
  v_ar_words integer := 0;
  v_h2 integer := 0;
  v_h3 integer := 0;
  v_faq integer := 0;
  v_ref_count integer := 0;
  v_dupes integer := 0;
  v_title_sim numeric := 0;
  v_body_sim numeric := 0;
begin
  if v_slug is null or v_canonical is null or v_primary_keyword is null then
    raise exception 'slug, canonical_url and primary_keyword are required';
  end if;
  if jsonb_typeof(v_blocks) <> 'array' or jsonb_array_length(v_blocks)=0 then
    raise exception 'blocks must be a non-empty array';
  end if;
  if exists(
    select 1 from public.content c
    where c.slug=v_slug
       or lower(coalesce(c.canonical_url,''))=lower(v_canonical)
       or lower(coalesce(c.primary_keyword,''))=lower(v_primary_keyword)
  ) then
    raise exception 'duplicate slug/canonical/primary keyword for %',v_slug;
  end if;

  select string_agg(
    case
      when b->>'type' in ('heading','paragraph') then coalesce(b->>'text','')
      when b->>'type'='faq' and jsonb_typeof(b->'items')='array' then coalesce((select string_agg(coalesce(i->>'question','')||' '||coalesce(i->>'answer',''),E'\n\n') from jsonb_array_elements(b->'items') i),'')
      else ''
    end,
    E'\n\n'
  ) into v_body
  from jsonb_array_elements(v_blocks) b;

  select count(*)::integer into v_ar_words from regexp_matches(coalesce(v_body,''),'[ء-ي]+','g');

  select
    count(*) filter(where b->>'type'='heading' and b->>'level'='2')::integer,
    count(*) filter(where b->>'type'='heading' and b->>'level'='3')::integer,
    coalesce(sum(case when b->>'type'='faq' and jsonb_typeof(b->'items')='array' then jsonb_array_length(b->'items') else 0 end),0)::integer
  into v_h2,v_h3,v_faq
  from jsonb_array_elements(v_blocks) b;
  v_ref_count := case when jsonb_typeof(v_refs)='array' then jsonb_array_length(v_refs) else 0 end;

  if v_ar_words < 2500 then raise exception 'gold guide requires at least 2500 Arabic words; found %',v_ar_words; end if;
  if v_h2 < 8 or v_h3 < 4 then raise exception 'gold guide requires at least 8 H2 and 4 H3; found %/%',v_h2,v_h3; end if;
  if v_faq < 6 then raise exception 'gold guide requires at least 6 FAQs; found %',v_faq; end if;
  if v_ref_count < 5 then raise exception 'gold guide requires at least 5 references; found %',v_ref_count; end if;

  select count(*)::integer into v_dupes
  from jsonb_array_elements(v_blocks) nb
  join public.content c on c.status='published' and c.robots_index
  cross join lateral jsonb_array_elements(coalesce(c.body_json->'blocks','[]'::jsonb)) ob
  where nb->>'type'='paragraph'
    and length(coalesce(nb->>'text',''))>=180
    and nb->>'text'=ob->>'text';
  if v_dupes>0 then raise exception 'exact long-paragraph duplication detected: % for %',v_dupes,v_slug; end if;

  select
    coalesce(max(extensions.similarity(p->>'title',c.title)),0),
    coalesce(max(extensions.similarity(left(v_body,8000),left(c.body_text,8000))),0)
  into v_title_sim,v_body_sim
  from public.content c
  where c.status='published' and c.robots_index;
  if v_title_sim >= title_similarity_limit then raise exception 'title similarity % at/above limit % for %',v_title_sim,title_similarity_limit,v_slug; end if;
  if v_body_sim >= body_similarity_limit then raise exception 'body similarity % at/above limit % for %',v_body_sim,body_similarity_limit,v_slug; end if;

  insert into public.content(
    content_type,slug,title,excerpt,body_json,body_text,sector_id,category_id,audience,status,
    seo_title,seo_description,canonical_url,robots_index,robots_follow,schema_json,search_aliases,
    primary_keyword,secondary_keywords,semantic_terms,search_intent,author_display_name,last_reviewed_at,
    references_json,medical_disclaimer,featured_image_alt
  ) values (
    coalesce(nullif(p->>'content_type',''),'guide'),v_slug,p->>'title',p->>'excerpt',jsonb_build_object('blocks',v_blocks),v_body,
    (p->>'sector_id')::uuid,(p->>'category_id')::uuid,
    coalesce(array(select jsonb_array_elements_text(coalesce(p->'audience','["general"]'::jsonb))),array['general']::text[]),
    'draft'::public.content_status,
    p->>'seo_title',p->>'seo_description',v_canonical,true,true,v_schema,
    coalesce(array(select jsonb_array_elements_text(coalesce(p->'search_aliases','[]'::jsonb))),array[]::text[]),
    v_primary_keyword,
    coalesce(array(select jsonb_array_elements_text(coalesce(p->'secondary_keywords','[]'::jsonb))),array[]::text[]),
    coalesce(array(select jsonb_array_elements_text(coalesce(p->'semantic_terms','[]'::jsonb))),array[]::text[]),
    coalesce(nullif(p->>'search_intent',''),'informational'),
    coalesce(nullif(p->>'author_display_name',''),'فريق تحرير منصة روافد'),now(),v_refs,null,null
  ) returning public.content.id into v_id;

  update public.content c
     set status='published'::public.content_status,
         published_at=now(),
         updated_at=now()
   where c.id=v_id;

  update private.content_expansion_backlog b
     set status='published',dedup_status='clear',source_status='strong',updated_at=now(),
         notes=coalesce(b.notes,'{}'::jsonb)||jsonb_build_object('published_content_id',v_id,'published_at',now(),'publisher','private.publish_gold_standard_guide_v1')
   where b.slug=v_slug;

  return query select c.id,c.slug,c.canonical_url,c.status,v_ar_words,v_h2,v_h3,v_faq,v_ref_count,v_dupes,v_title_sim,v_body_sim from public.content c where c.id=v_id;
end;
$$;
revoke all on function private.publish_gold_standard_guide_v1(jsonb,numeric,numeric) from public,anon,authenticated;
grant execute on function private.publish_gold_standard_guide_v1(jsonb,numeric,numeric) to service_role;
