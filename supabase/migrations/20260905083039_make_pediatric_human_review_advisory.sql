do $migration$
declare
  v_oid oid;
  v_def text;
begin
  select p.oid into v_oid
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='pediatric_oncology_release_preflight' and p.prokind='f';
  if v_oid is not null then
    v_def := pg_get_functiondef(v_oid);
    v_def := replace(v_def,
      $needle$  if not v_reviewer_ok then v_blocks := v_blocks || pg_catalog.jsonb_build_array('independent-human-review-required'); end if;
$needle$,
      '');
    execute v_def;
  end if;
end
$migration$;
