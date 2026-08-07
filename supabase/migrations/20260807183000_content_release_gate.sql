create or replace function private.content_release_gate()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_reference_count integer := 0;
  v_medical boolean := false;
begin
  if new.status in ('accessibility_review'::public.content_status,'approved'::public.content_status,'published'::public.content_status) then
    if nullif(pg_catalog.btrim(coalesce(new.seo_title,'')),'') is null or pg_catalog.char_length(pg_catalog.btrim(new.seo_title)) > 47 then
      raise exception 'SEO title is required and must fit the branded title contract';
    end if;
    if new.seo_description is null or pg_catalog.char_length(pg_catalog.btrim(new.seo_description)) < 150 or pg_catalog.char_length(pg_catalog.btrim(new.seo_description)) > 160 then
      raise exception 'meta description must be 150-160 characters';
    end if;
    if nullif(pg_catalog.btrim(coalesce(new.primary_keyword,'')),'') is null then
      raise exception 'primary keyword is required before accessibility review';
    end if;
    if new.canonical_url is null or pg_catalog.btrim(new.canonical_url) = '' then
      new.canonical_url := '/content/' || new.slug;
    end if;
  end if;

  if new.status in ('approved'::public.content_status,'published'::public.content_status) then
    if nullif(pg_catalog.btrim(coalesce(new.author_display_name,'')),'') is null then
      new.author_display_name := (select nullif(pg_catalog.btrim(coalesce(p.display_name,'')),'') from public.profiles p where p.id=new.author_id);
    end if;
    if new.author_display_name is null then raise exception 'visible author is required before approval'; end if;

    v_medical := new.content_type in ('condition','protocol','intervention','assessment','research','guide','article');
    if v_medical then
      if nullif(pg_catalog.btrim(coalesce(new.reviewer_display_name,'')),'') is null then raise exception 'scientific reviewer is required for YMYL content'; end if;
      if new.last_reviewed_at is null then raise exception 'last reviewed date is required for YMYL content'; end if;
      if pg_catalog.jsonb_typeof(coalesce(new.references_json,'[]'::jsonb)) <> 'array' then raise exception 'references must be an array'; end if;
      v_reference_count := pg_catalog.jsonb_array_length(coalesce(new.references_json,'[]'::jsonb));
      if v_reference_count < 1 then raise exception 'at least one scientific reference is required for YMYL content'; end if;
      if nullif(pg_catalog.btrim(coalesce(new.medical_disclaimer,'')),'') is null then raise exception 'medical disclaimer is required for YMYL content'; end if;
    end if;

    if new.featured_image_url is not null and nullif(pg_catalog.btrim(coalesce(new.featured_image_alt,'')),'') is null then
      raise exception 'featured image alt text is required';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.content_release_gate() from public,anon,authenticated;

drop trigger if exists content_release_gate on public.content;
create trigger content_release_gate
before insert or update of status on public.content
for each row execute function private.content_release_gate();
