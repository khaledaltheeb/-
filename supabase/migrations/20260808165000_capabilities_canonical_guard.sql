-- Keep the Capabilities library on its dedicated public route namespace.
-- The pre-existing quality guard is intentionally left untouched: it owns
-- publication quality checks. This migration adds a final route guard that
-- runs after the other BEFORE triggers, so later content edits cannot move
-- Capabilities Canonicals back under the generic /content/ namespace.

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

drop trigger if exists zz_capabilities_canonical_route_guard on public.content;
create trigger zz_capabilities_canonical_route_guard
before insert or update on public.content
for each row execute function private.capabilities_canonical_route_guard();

-- Re-normalize existing migrated records. The zz_ trigger runs after the
-- older quality guard and therefore owns the final Canonical value.
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
