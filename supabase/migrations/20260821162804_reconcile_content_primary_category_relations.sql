do $reconcile$
declare
  v_row record;
  v_before_primary jsonb;
  v_version integer;
  v_snapshot jsonb;
begin
  for v_row in
    select c.id,c.category_id,c.status
    from public.content c
    where c.category_id is not null
      and not exists(
        select 1 from public.content_categories cc
        where cc.content_id=c.id and cc.category_id=c.category_id and cc.is_primary=true
      )
    order by c.id
  loop
    select coalesce(jsonb_agg(cc.category_id order by cc.category_id),'[]'::jsonb)
    into v_before_primary
    from public.content_categories cc
    where cc.content_id=v_row.id and cc.is_primary=true;

    update public.content_categories
    set is_primary=false
    where content_id=v_row.id
      and is_primary=true
      and category_id is distinct from v_row.category_id;

    insert into public.content_categories(content_id,category_id,is_primary)
    values(v_row.id,v_row.category_id,true)
    on conflict(content_id,category_id) do update set is_primary=true;

    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_row.id::text));
    select coalesce(max(version),0)+1 into v_version
    from public.content_versions where content_id=v_row.id;
    select private.content_snapshot_with_relations(v_row.id) into v_snapshot;
    insert into public.content_versions(content_id,version,snapshot,created_by)
    values(v_row.id,v_version,v_snapshot,null);

    insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
    values(
      null,'content',v_row.id::text,'primary_category_relation_reconciled',
      jsonb_build_object('primary_category_relations',v_before_primary,'status',v_row.status),
      jsonb_build_object('primary_category_id',v_row.category_id,'version',v_version,'previous_primary_relations_preserved_as_secondary',true)
    );
  end loop;
end;
$reconcile$;
