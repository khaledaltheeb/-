create or replace function private.capabilities_content_quality_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_words integer := 0;
  v_route_slug text;
begin
  if new.slug like 'capabilities-%' then
    v_route_slug := pg_catalog.regexp_replace(new.slug, '^capabilities-', '');
    new.canonical_url := case
      when new.slug = 'capabilities-hub' then '/capabilities/'
      else '/capabilities/' || v_route_slug || '/'
    end;

    if new.status = 'published'::public.content_status then
      v_words := coalesce(
        pg_catalog.array_length(
          pg_catalog.regexp_split_to_array(pg_catalog.btrim(coalesce(new.body_text,'')), E'\\s+'),
          1
        ),
        0
      );
      if v_words < 1500 then
        raise exception 'capabilities page must contain at least 1500 useful words before publication';
      end if;

      if new.slug not in ('capabilities-hub','capabilities-methodology','capabilities-protocol','capabilities-registry')
         and (
           coalesce(new.body_text,'') like '%البروتوكول الكامل: تسع مراحل من الأمان إلى القرار المشترك%'
           or coalesce(new.body_text,'') like '%المخرج المطلوب: قائمة مخاطر وحدود مشاركة آمنة.%'
         ) then
        raise exception 'legacy repeated capabilities protocol must be removed before publication';
      end if;
    end if;
  end if;
  return new;
end;
$$;

update public.content
set canonical_url = case
  when slug = 'capabilities-hub' then '/capabilities/'
  else '/capabilities/' || pg_catalog.regexp_replace(slug, '^capabilities-', '') || '/'
end
where slug like 'capabilities-%';

alter table public.content drop constraint if exists content_capabilities_canonical_route_chk;
alter table public.content add constraint content_capabilities_canonical_route_chk
check (
  slug not like 'capabilities-%'
  or canonical_url = case
    when slug = 'capabilities-hub' then '/capabilities/'
    else '/capabilities/' || pg_catalog.regexp_replace(slug, '^capabilities-', '') || '/'
  end
);

-- The dedicated /capabilities/[slug] route now exists. Registry resource URLs targeting
-- /capabilities/<slug>/ are no longer broken; the registry browser also derives live items
-- directly from published CMS records.
alter table public.content drop constraint if exists content_capabilities_registry_links_chk;
