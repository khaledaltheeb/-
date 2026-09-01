begin;

-- Rawafid Institutional Data Exchange v1.
-- External partners may submit governed data, but no partner credential can
-- write directly to public specialists, organizations, content, or other live
-- publication tables. Every submission enters a reviewable staging boundary.

alter table public.api_partners drop constraint if exists api_partners_scopes_valid;
alter table public.api_partner_keys drop constraint if exists api_partner_keys_scopes_valid;

alter table public.api_partners add constraint api_partners_scopes_valid check (
  scopes <@ array[
    'content:read','sources:read','search:read','changes:read','stats:read',
    'people:submit','specialists:submit','organizations:submit','courses:submit',
    'events:submit','schedules:submit','imports:read','webhooks:manage'
  ]::text[]
  and cardinality(scopes) > 0
);

alter table public.api_partner_keys add constraint api_partner_keys_scopes_valid check (
  scopes <@ array[
    'content:read','sources:read','search:read','changes:read','stats:read',
    'people:submit','specialists:submit','organizations:submit','courses:submit',
    'events:submit','schedules:submit','imports:read','webhooks:manage'
  ]::text[]
  and cardinality(scopes) > 0
);

create or replace function private.api_partner_authorize_core(
  p_key_hash text,
  p_scope text,
  p_consume_quota boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_key public.api_partner_keys;
  v_partner public.api_partners;
  v_minute_start timestamptz:=date_trunc('minute',now());
  v_day_start timestamptz:=(date_trunc('day',now() at time zone 'UTC') at time zone 'UTC');
  v_minute_used integer:=0;
  v_day_used integer:=0;
  v_minute_after integer:=0;
  v_day_after integer:=0;
  v_allowed_scopes constant text[] := array[
    'content:read','sources:read','search:read','changes:read','stats:read',
    'people:submit','specialists:submit','organizations:submit','courses:submit',
    'events:submit','schedules:submit','imports:read','webhooks:manage'
  ]::text[];
begin
  if coalesce(p_key_hash,'') !~ '^[0-9a-f]{64}$' then
    return jsonb_build_object('authorized',false,'reason','invalid_key');
  end if;
  if not (p_scope = any(v_allowed_scopes)) then
    return jsonb_build_object('authorized',false,'reason','invalid_scope');
  end if;

  select * into v_key
  from public.api_partner_keys
  where key_hash=p_key_hash and status='active'
  limit 1;

  if not found then return jsonb_build_object('authorized',false,'reason','invalid_key'); end if;
  if v_key.expires_at<=now() then return jsonb_build_object('authorized',false,'reason','expired_key'); end if;

  select * into v_partner from public.api_partners where id=v_key.partner_id;
  if not found or v_partner.status<>'active' then
    return jsonb_build_object('authorized',false,'reason','partner_inactive');
  end if;
  if not (p_scope=any(v_key.scopes)) or not (p_scope=any(v_partner.scopes)) then
    return jsonb_build_object('authorized',false,'reason','scope_denied');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_key.id::text,0));

  select used into v_minute_used
  from private.api_partner_usage_windows
  where key_id=v_key.id and window_kind='minute' and window_start=v_minute_start;
  select used into v_day_used
  from private.api_partner_usage_windows
  where key_id=v_key.id and window_kind='day' and window_start=v_day_start;

  v_minute_used:=coalesce(v_minute_used,0);
  v_day_used:=coalesce(v_day_used,0);

  if v_minute_used>=v_partner.quota_per_minute then
    return jsonb_build_object('authorized',false,'reason','rate_limited','window','minute','limit',v_partner.quota_per_minute,'remaining',0,'reset_at',v_minute_start+interval '1 minute');
  end if;
  if v_day_used>=v_partner.quota_per_day then
    return jsonb_build_object('authorized',false,'reason','rate_limited','window','day','limit',v_partner.quota_per_day,'remaining',0,'reset_at',v_day_start+interval '1 day');
  end if;

  if p_consume_quota then
    insert into private.api_partner_usage_windows(key_id,window_kind,window_start,used,updated_at)
    values(v_key.id,'minute',v_minute_start,1,now())
    on conflict(key_id,window_kind,window_start)
    do update set used=private.api_partner_usage_windows.used+1,updated_at=now()
    returning used into v_minute_after;

    insert into private.api_partner_usage_windows(key_id,window_kind,window_start,used,updated_at)
    values(v_key.id,'day',v_day_start,1,now())
    on conflict(key_id,window_kind,window_start)
    do update set used=private.api_partner_usage_windows.used+1,updated_at=now()
    returning used into v_day_after;

    if v_key.last_used_at is null or v_key.last_used_at<now()-interval '5 minutes' then
      update public.api_partner_keys set last_used_at=now() where id=v_key.id;
    end if;
  else
    v_minute_after:=v_minute_used;
    v_day_after:=v_day_used;
  end if;

  return jsonb_build_object(
    'authorized',true,
    'partner_id',v_partner.id,
    'partner_slug',v_partner.slug,
    'plan',v_partner.plan,
    'key_id',v_key.id,
    'key_prefix',v_key.key_prefix,
    'scope',p_scope,
    'scopes',v_key.scopes,
    'minute',jsonb_build_object('limit',v_partner.quota_per_minute,'remaining',greatest(v_partner.quota_per_minute-v_minute_after,0),'reset_at',v_minute_start+interval '1 minute'),
    'day',jsonb_build_object('limit',v_partner.quota_per_day,'remaining',greatest(v_partner.quota_per_day-v_day_after,0),'reset_at',v_day_start+interval '1 day')
  );
end;
$$;

revoke all on function private.api_partner_authorize_core(text,text,boolean) from public;

create or replace function public.api_partner_authorize(p_key_hash text,p_scope text)
returns jsonb
language sql
security definer
set search_path=''
as $$
  select private.api_partner_authorize_core(p_key_hash,p_scope,true);
$$;

revoke execute on function public.api_partner_authorize(text,text) from public;
grant execute on function public.api_partner_authorize(text,text) to anon,authenticated,service_role;

create table if not exists public.api_integration_items (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.api_partners(id) on delete cascade,
  resource_type text not null check (resource_type in ('person','specialist','organization','course','event','schedule')),
  external_id text not null check (char_length(external_id) between 1 and 200),
  status text not null default 'received' check (status in ('received','needs_review','accepted','rejected','published','failed')),
  payload jsonb not null check (jsonb_typeof(payload)='object'),
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  provenance jsonb not null default '{}'::jsonb check (jsonb_typeof(provenance)='object'),
  review_note text,
  published_entity_type text,
  published_entity_id uuid,
  published_url text,
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  unique(partner_id,resource_type,external_id)
);

create table if not exists public.api_integration_requests (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.api_partners(id) on delete cascade,
  key_id uuid not null references public.api_partner_keys(id) on delete cascade,
  item_id uuid not null references public.api_integration_items(id) on delete cascade,
  idempotency_key text not null check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'),
  resource_type text not null,
  external_id text not null,
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  outcome text not null check (outcome in ('accepted','idempotent_replay')),
  created_at timestamptz not null default now(),
  unique(partner_id,idempotency_key)
);

create index if not exists api_integration_items_partner_status_idx on public.api_integration_items(partner_id,status,updated_at desc);
create index if not exists api_integration_items_resource_idx on public.api_integration_items(resource_type,status,updated_at desc);
create index if not exists api_integration_requests_item_idx on public.api_integration_requests(item_id,created_at desc);

alter table public.api_integration_items enable row level security;
alter table public.api_integration_requests enable row level security;
revoke all on table public.api_integration_items from anon,authenticated;
revoke all on table public.api_integration_requests from anon,authenticated;

create policy api_integration_items_deny_direct
on public.api_integration_items
for all
to anon,authenticated
using (false)
with check (false);

create policy api_integration_requests_deny_direct
on public.api_integration_requests
for all
to anon,authenticated
using (false)
with check (false);

create or replace function public.api_partner_submit_integration(
  p_key_hash text,
  p_resource_type text,
  p_external_id text,
  p_idempotency_key text,
  p_payload jsonb,
  p_provenance jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_scope text;
  v_auth jsonb;
  v_partner_id uuid;
  v_key_id uuid;
  v_payload_sha text;
  v_existing_request public.api_integration_requests;
  v_existing_item public.api_integration_items;
  v_item public.api_integration_items;
  v_request public.api_integration_requests;
begin
  v_scope := case p_resource_type
    when 'person' then 'people:submit'
    when 'specialist' then 'specialists:submit'
    when 'organization' then 'organizations:submit'
    when 'course' then 'courses:submit'
    when 'event' then 'events:submit'
    when 'schedule' then 'schedules:submit'
    else null
  end;

  if v_scope is null then
    return jsonb_build_object('authorized',false,'reason','invalid_resource_type');
  end if;
  if char_length(trim(coalesce(p_external_id,''))) not between 1 and 200 then
    return jsonb_build_object('authorized',false,'reason','invalid_external_id');
  end if;
  if coalesce(p_idempotency_key,'') !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$' then
    return jsonb_build_object('authorized',false,'reason','invalid_idempotency_key');
  end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>262144 then
    return jsonb_build_object('authorized',false,'reason','invalid_payload');
  end if;
  if p_provenance is null or jsonb_typeof(p_provenance)<>'object' or octet_length(p_provenance::text)>65536 then
    return jsonb_build_object('authorized',false,'reason','invalid_provenance');
  end if;

  v_auth:=private.api_partner_authorize_core(p_key_hash,v_scope,true);
  if coalesce((v_auth->>'authorized')::boolean,false)=false then return v_auth; end if;

  v_partner_id:=(v_auth->>'partner_id')::uuid;
  v_key_id:=(v_auth->>'key_id')::uuid;
  v_payload_sha:=encode(extensions.digest(convert_to(p_payload::text,'UTF8'),'sha256'),'hex');

  select * into v_existing_request
  from public.api_integration_requests
  where partner_id=v_partner_id and idempotency_key=p_idempotency_key;

  if found then
    if v_existing_request.resource_type<>p_resource_type
       or v_existing_request.external_id<>trim(p_external_id)
       or v_existing_request.payload_sha256<>v_payload_sha then
      return v_auth || jsonb_build_object('accepted',false,'reason','idempotency_conflict');
    end if;
    select * into v_existing_item from public.api_integration_items where id=v_existing_request.item_id;
    return v_auth || jsonb_build_object(
      'accepted',true,
      'idempotent_replay',true,
      'submission_id',v_existing_request.id,
      'item_id',v_existing_item.id,
      'resource_type',v_existing_item.resource_type,
      'external_id',v_existing_item.external_id,
      'status',v_existing_item.status,
      'review_required',true,
      'published_url',v_existing_item.published_url
    );
  end if;

  insert into public.api_integration_items(partner_id,resource_type,external_id,status,payload,payload_sha256,provenance,received_at,updated_at)
  values(v_partner_id,p_resource_type,trim(p_external_id),'received',p_payload,v_payload_sha,p_provenance,now(),now())
  on conflict(partner_id,resource_type,external_id)
  do update set
    payload=excluded.payload,
    payload_sha256=excluded.payload_sha256,
    provenance=excluded.provenance,
    status=case when public.api_integration_items.status='published' then 'needs_review' else 'received' end,
    review_note=null,
    reviewed_at=null,
    received_at=now(),
    updated_at=now()
  returning * into v_item;

  insert into public.api_integration_requests(partner_id,key_id,item_id,idempotency_key,resource_type,external_id,payload_sha256,outcome)
  values(v_partner_id,v_key_id,v_item.id,p_idempotency_key,p_resource_type,trim(p_external_id),v_payload_sha,'accepted')
  returning * into v_request;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(null,'api_integration_item',v_item.id::text,'partner_submit',jsonb_build_object(
    'partner_id',v_partner_id,'key_id',v_key_id,'resource_type',p_resource_type,'external_id',trim(p_external_id),'status',v_item.status,'request_id',v_request.id
  ));

  return v_auth || jsonb_build_object(
    'accepted',true,
    'idempotent_replay',false,
    'submission_id',v_request.id,
    'item_id',v_item.id,
    'resource_type',v_item.resource_type,
    'external_id',v_item.external_id,
    'status',v_item.status,
    'review_required',true,
    'published_url',v_item.published_url
  );
end;
$$;

create or replace function public.api_partner_integration_status(
  p_key_hash text,
  p_resource_type text,
  p_external_id text
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_auth jsonb;
  v_partner_id uuid;
  v_item public.api_integration_items;
begin
  v_auth:=private.api_partner_authorize_core(p_key_hash,'imports:read',true);
  if coalesce((v_auth->>'authorized')::boolean,false)=false then return v_auth; end if;
  v_partner_id:=(v_auth->>'partner_id')::uuid;

  select * into v_item
  from public.api_integration_items
  where partner_id=v_partner_id
    and resource_type=p_resource_type
    and external_id=trim(p_external_id);

  if not found then
    return v_auth || jsonb_build_object('found',false);
  end if;

  return v_auth || jsonb_build_object(
    'found',true,
    'item_id',v_item.id,
    'resource_type',v_item.resource_type,
    'external_id',v_item.external_id,
    'status',v_item.status,
    'review_note',v_item.review_note,
    'published_entity_type',v_item.published_entity_type,
    'published_entity_id',v_item.published_entity_id,
    'published_url',v_item.published_url,
    'received_at',v_item.received_at,
    'updated_at',v_item.updated_at,
    'reviewed_at',v_item.reviewed_at,
    'published_at',v_item.published_at
  );
end;
$$;

revoke execute on function public.api_partner_submit_integration(text,text,text,text,jsonb,jsonb) from public;
revoke execute on function public.api_partner_integration_status(text,text,text) from public;
grant execute on function public.api_partner_submit_integration(text,text,text,text,jsonb,jsonb) to anon,authenticated,service_role;
grant execute on function public.api_partner_integration_status(text,text,text) to anon,authenticated,service_role;

create or replace function public.admin_review_api_integration_item(
  p_item_id uuid,
  p_decision text,
  p_review_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_actor uuid:=private.assert_partner_admin();
  v_item public.api_integration_items;
  v_new_status text;
begin
  if p_decision not in ('accept','reject') then raise exception 'invalid decision'; end if;
  v_new_status:=case when p_decision='accept' then 'accepted' else 'rejected' end;

  update public.api_integration_items
  set status=v_new_status,
      review_note=nullif(trim(coalesce(p_review_note,'')),''),
      reviewed_at=now(),
      updated_at=now()
  where id=p_item_id
  returning * into v_item;

  if not found then raise exception 'integration item not found'; end if;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_actor,'api_integration_item',v_item.id::text,'review',jsonb_build_object('decision',p_decision,'status',v_new_status,'review_note',v_item.review_note));

  return jsonb_build_object('id',v_item.id,'status',v_item.status,'reviewed_at',v_item.reviewed_at);
end;
$$;

create or replace function public.admin_mark_api_integration_published(
  p_item_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_published_url text
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_actor uuid:=private.assert_partner_admin();
  v_item public.api_integration_items;
begin
  if trim(coalesce(p_entity_type,''))='' then raise exception 'entity type is required'; end if;
  if p_entity_id is null then raise exception 'entity id is required'; end if;
  if coalesce(p_published_url,'') !~ '^https://healthrenewal\.org/' then raise exception 'published URL must use canonical healthrenewal.org origin'; end if;

  update public.api_integration_items
  set status='published',
      published_entity_type=trim(p_entity_type),
      published_entity_id=p_entity_id,
      published_url=p_published_url,
      published_at=now(),
      updated_at=now()
  where id=p_item_id and status='accepted'
  returning * into v_item;

  if not found then raise exception 'accepted integration item not found'; end if;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_actor,'api_integration_item',v_item.id::text,'published',jsonb_build_object('published_entity_type',v_item.published_entity_type,'published_entity_id',v_item.published_entity_id,'published_url',v_item.published_url));

  return jsonb_build_object('id',v_item.id,'status',v_item.status,'published_url',v_item.published_url,'published_at',v_item.published_at);
end;
$$;

revoke execute on function public.admin_review_api_integration_item(uuid,text,text) from anon,public;
revoke execute on function public.admin_mark_api_integration_published(uuid,text,uuid,text) from anon,public;
grant execute on function public.admin_review_api_integration_item(uuid,text,text) to authenticated,service_role;
grant execute on function public.admin_mark_api_integration_published(uuid,text,uuid,text) to authenticated,service_role;

comment on table public.api_integration_items is 'Governed partner-submitted staging entities. Never a direct publication surface.';
comment on table public.api_integration_requests is 'Idempotent request ledger for institutional partner submissions.';
comment on function public.api_partner_submit_integration(text,text,text,text,jsonb,jsonb) is 'Authenticates, quota-checks, deduplicates, and stages one partner submission. It cannot publish live entities.';

commit;
