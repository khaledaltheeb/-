create or replace function public.get_legacy_preserved_page(p_route text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_route text;
  v_source_path text;
  v_result jsonb;
begin
  v_route := pg_catalog.btrim(coalesce(p_route, ''));
  v_route := pg_catalog.regexp_replace(v_route, '^/+|/+$', '', 'g');
  if pg_catalog.char_length(v_route) > 500 or v_route ~ '(^|/)\.\.(/|$)' or v_route ~ '[\\]' or v_route ~ '[?#]' then return null; end if;
  if v_route = '' then v_source_path := 'index.html'; elsif v_route ~ '\.html$' then v_source_path := v_route; else v_source_path := v_route || '/index.html'; end if;
  select pg_catalog.jsonb_build_object(
    'source_family',l.source_family,'source_path',l.source_path,'title',l.title,'h1',l.h1,'meta_description',l.meta_description,'word_count',l.word_count,'body_text',l.body_text,
    'body_json',coalesce(l.body_json,'{}'::jsonb),'references_json',coalesce(l.references_json,'[]'::jsonb),'internal_links_json',coalesce(l.internal_links_json,'[]'::jsonb),'images_json',coalesce(l.images_json,'[]'::jsonb)
  ) into v_result
  from private.legacy_migration_items l
  where l.source_kind='production-baseline' and l.source_path=v_source_path
    and coalesce(l.migration_state,'')<>'DEVELOPMENT_ONLY' and coalesce(l.migration_decision,'')<>''
    and l.migration_decision not like 'EXCLUDE_%' and l.migration_decision not in ('INTERACTIVE_REVIEW','ASSET_REVIEW')
  order by l.id limit 1;
  return v_result;
end;
$$;
revoke all on function public.get_legacy_preserved_page(text) from public;
grant execute on function public.get_legacy_preserved_page(text) to anon, authenticated;
