create or replace function private.capabilities_content_quality_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_words integer := 0;
begin
  if new.slug like 'capabilities-%' then
    new.canonical_url := '/content/' || new.slug;
    if new.status = 'published'::public.content_status then
      v_words := coalesce(pg_catalog.array_length(pg_catalog.regexp_split_to_array(pg_catalog.btrim(coalesce(new.body_text,'')), E'\\s+'),1),0);
      if v_words < 1500 then raise exception 'capabilities page must contain at least 1500 useful words before publication'; end if;
      if new.slug not in ('capabilities-hub','capabilities-methodology','capabilities-protocol','capabilities-registry')
         and (coalesce(new.body_text,'') like '%البروتوكول الكامل: تسع مراحل من الأمان إلى القرار المشترك%'
              or coalesce(new.body_text,'') like '%المخرج المطلوب: قائمة مخاطر وحدود مشاركة آمنة.%') then
        raise exception 'legacy repeated capabilities protocol must be removed before publication';
      end if;
      if new.slug = 'capabilities-registry' and new.body_json::text like '%healthrenewal.org/capabilities/%' then
        raise exception 'capabilities registry contains legacy destination links';
      end if;
    end if;
  end if;
  return new;
end;
$$;

update public.content
set canonical_url='/content/' || slug
where slug like 'capabilities-%';

alter table public.content drop constraint if exists content_capabilities_canonical_route_chk;
alter table public.content add constraint content_capabilities_canonical_route_chk
check (slug not like 'capabilities-%' or canonical_url = '/content/' || slug);

alter table public.content drop constraint if exists content_capabilities_no_legacy_template_chk;
alter table public.content add constraint content_capabilities_no_legacy_template_chk
check (
  status <> 'published'::public.content_status
  or slug not like 'capabilities-%'
  or slug in ('capabilities-hub','capabilities-methodology','capabilities-protocol','capabilities-registry')
  or (
    coalesce(body_text,'') not like '%البروتوكول الكامل: تسع مراحل من الأمان إلى القرار المشترك%'
    and coalesce(body_text,'') not like '%المخرج المطلوب: قائمة مخاطر وحدود مشاركة آمنة.%'
  )
);

alter table public.content drop constraint if exists content_capabilities_registry_links_chk;
alter table public.content add constraint content_capabilities_registry_links_chk
check (
  slug <> 'capabilities-registry'
  or status <> 'published'::public.content_status
  or body_json::text not like '%healthrenewal.org/capabilities/%'
);
