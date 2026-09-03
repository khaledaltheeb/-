create or replace function internal_search_v2.normalize_query_token_v3(p_token text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  with n as (
    select public.normalize_arabic_search(coalesce(p_token,'')) as t
  )
  select case
    when pg_catalog.char_length(t) >= 5 and t like 'بال%' then pg_catalog.substr(t,2)
    when pg_catalog.char_length(t) >= 5 and t like 'كال%' then pg_catalog.substr(t,2)
    when pg_catalog.char_length(t) >= 5 and t like 'وال%' then pg_catalog.substr(t,2)
    when pg_catalog.char_length(t) >= 5 and t like 'فال%' then pg_catalog.substr(t,2)
    when pg_catalog.char_length(t) >= 5 and t like 'لل%' then 'ال' || pg_catalog.substr(t,3)
    else t
  end
  from n;
$$;

revoke all on function internal_search_v2.normalize_query_token_v3(text) from public,anon,authenticated;
