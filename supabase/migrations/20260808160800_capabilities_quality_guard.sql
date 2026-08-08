create or replace function private.capabilities_content_quality_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_words integer := 0;
begin
  if new.slug like 'capabilities-%' then
    -- The destination application renders CMS content at /content/[slug].
    new.canonical_url := '/content/' || new.slug;

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

      -- Shared methodology belongs only in the dedicated shared pages, never repeated in condition pages.
      if new.slug not in ('capabilities-hub','capabilities-methodology','capabilities-protocol','capabilities-registry')
         and (
           coalesce(new.body_text,'') like '%البروتوكول الكامل: تسع مراحل من الأمان إلى القرار المشترك%'
           or coalesce(new.body_text,'') like '%المخرج المطلوب: قائمة مخاطر وحدود مشاركة آمنة.%'
         ) then
        raise exception 'legacy repeated capabilities protocol must be removed before publication';
      end if;

      -- The registry must never publish links to the removed legacy /capabilities/* route.
      if new.slug = 'capabilities-registry'
         and new.body_json::text like '%healthrenewal.org/capabilities/%' then
        raise exception 'capabilities registry contains legacy destination links';
      end if;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.capabilities_content_quality_guard() from public, anon, authenticated;

drop trigger if exists capabilities_content_quality_guard on public.content;
create trigger capabilities_content_quality_guard
before insert or update on public.content
for each row execute function private.capabilities_content_quality_guard();
