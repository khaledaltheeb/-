do $reconcile$
declare
  v_row record;
  v_version integer;
begin
  for v_row in
    select c.id,c.slug,c.canonical_url
    from public.content c
    join private.legacy_migration_items l on l.destination_content_id=c.id
    where c.id in (
      '2de37655-39d1-4add-8fc7-a345bb52bbfd'::uuid,
      '4dc6c9fb-7b8f-4870-bae5-15835992de85'::uuid,
      '05485521-1bc3-4da6-bd27-8aa0a2e273bf'::uuid
    )
      and c.status='published'::public.content_status
      and c.published_at is null
      and coalesce((c.schema_json->>'content_contract_version')::integer,0)=0
      and l.migration_decision='PROMOTED_DRAFT'
      and l.destination_slug=c.slug
      and l.destination_canonical=c.canonical_url
  loop
    update public.content
    set status='draft'::public.content_status,
        robots_index=false,
        scheduled_at=null,
        published_at=null
    where id=v_row.id;

    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_row.id::text));
    select coalesce(max(version),0)+1 into v_version from public.content_versions where content_id=v_row.id;
    insert into public.content_versions(content_id,version,snapshot,created_by)
    select c.id,v_version,to_jsonb(c),null from public.content c where c.id=v_row.id;

    insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
    values(null,'content',v_row.id::text,'legacy_promoted_draft_state_reconciled',
      jsonb_build_object('status','published','published_at',null,'ledger_decision','PROMOTED_DRAFT'),
      jsonb_build_object('status','draft','robots_index',false,'canonical_url',v_row.canonical_url,'version',v_version));
  end loop;
end;
$reconcile$;

alter table public.content
  add constraint content_published_requires_published_at
  check (status <> 'published'::public.content_status or published_at is not null)
  not valid;

alter table public.content validate constraint content_published_requires_published_at;
