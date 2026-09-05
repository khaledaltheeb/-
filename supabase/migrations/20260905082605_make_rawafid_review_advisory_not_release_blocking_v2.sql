do $migration$
declare
  v_oid oid;
  v_def text;
begin
  select p.oid into v_oid
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='content_release_gate_legacy' and p.prokind='f';
  if v_oid is not null then
    v_def := pg_get_functiondef(v_oid);
    v_def := replace(v_def,
      $needle$ or v_schema ->> 'editorial_review_required' <> 'false'$needle$,
      '');
    v_def := replace(v_def,
      'legacy content must complete editorial release review',
      'legacy content must be publication ready');
    execute v_def;
  end if;

  select p.oid into v_oid
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='quick_info_release_gate_v1' and p.prokind='f';
  if v_oid is not null then
    v_def := pg_get_functiondef(v_oid);
    v_def := replace(v_def,
      $needle$     or v_schema->>'editorial_review_required' <> 'false'
$needle$,
      '');
    execute v_def;
  end if;

  select p.oid into v_oid
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='quick_info_stale_coordinator_hold_guard' and p.prokind='f';
  if v_oid is not null then
    v_def := pg_get_functiondef(v_oid);
    v_def := replace(v_def,
      $needle$     and not coalesce((new.schema_json->>'editorial_review_required')::boolean, false)
$needle$,
      '');
    execute v_def;
  end if;
end
$migration$;
