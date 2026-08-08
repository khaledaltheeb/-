-- The earlier 16:12 migration owns content-quality gates but normalized
-- Capabilities through the generic /content/ namespace. Capabilities has a
-- dedicated public route tree, so this later migration intentionally
-- supersedes only that route-normalization behavior while preserving the
-- existing publication-quality constraints.

alter table public.content
  drop constraint if exists content_capabilities_canonical_route_chk;

create or replace function private.capabilities_canonical_route_guard()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.slug like 'capabilities-%' then
    new.canonical_url := case
      when new.slug = 'capabilities-hub' then '/capabilities/'
      else '/capabilities/' || pg_catalog.regexp_replace(new.slug, '^capabilities-', '') || '/'
    end;
  end if;
  return new;
end;
$function$;

-- BEFORE triggers execute by name. The zz_ prefix deliberately makes this
-- final route guard run after the pre-existing capabilities quality guard.
drop trigger if exists zz_capabilities_canonical_route_guard on public.content;
create trigger zz_capabilities_canonical_route_guard
before insert or update on public.content
for each row execute function private.capabilities_canonical_route_guard();

update public.content
set featured_image_url = case
      when slug = 'capabilities-hub' then '/capabilities/cover'
      else '/capabilities/' || pg_catalog.regexp_replace(slug, '^capabilities-', '') || '/cover'
    end,
    updated_at = now()
where slug like 'capabilities-%';

alter table public.content
add constraint content_capabilities_canonical_route_chk
check (
  slug not like 'capabilities-%'
  or canonical_url = case
    when slug = 'capabilities-hub' then '/capabilities/'
    else '/capabilities/' || pg_catalog.regexp_replace(slug, '^capabilities-', '') || '/'
  end
);
