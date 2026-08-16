create or replace function public.legacy_preserved_route_exists(p_route text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_route text;
  v_source_path text;
begin
  v_route := pg_catalog.btrim(coalesce(p_route, ''));
  v_route := pg_catalog.regexp_replace(v_route, '^/+|/+$', '', 'g');

  if pg_catalog.char_length(v_route) > 500
     or v_route ~ '(^|/)\.\.(/|$)'
     or v_route ~ '[\\]'
     or v_route ~ '[?#]' then
    return false;
  end if;

  if v_route = '' then
    v_source_path := 'index.html';
  elsif v_route ~ '\.html$' then
    v_source_path := v_route;
  else
    v_source_path := v_route || '/index.html';
  end if;

  return exists (
    select 1
    from private.legacy_migration_items l
    where l.source_kind = 'production-baseline'
      and l.source_path = v_source_path
      and coalesce(l.migration_state, '') <> 'DEVELOPMENT_ONLY'
      and coalesce(l.migration_decision, '') <> ''
      and l.migration_decision not like 'EXCLUDE_%'
  );
end;
$$;

revoke all on function public.legacy_preserved_route_exists(text) from public;
grant execute on function public.legacy_preserved_route_exists(text) to anon, authenticated;
