begin;

-- Extend governed inbound exchange to editorial pages and learning paths.
-- These remain staged submissions; this migration does not publish content.

alter table public.api_partners drop constraint if exists api_partners_scopes_valid;
alter table public.api_partner_keys drop constraint if exists api_partner_keys_scopes_valid;
alter table public.api_integration_items drop constraint if exists api_integration_items_resource_type_check;

alter table public.api_partners add constraint api_partners_scopes_valid check (
  scopes <@ array[
    'content:read','sources:read','search:read','changes:read','stats:read',
    'people:submit','specialists:submit','organizations:submit','courses:submit',
    'pages:submit','learning:submit','events:submit','schedules:submit','imports:read','webhooks:manage'
  ]::text[] and cardinality(scopes)>0
);

alter table public.api_partner_keys add constraint api_partner_keys_scopes_valid check (
  scopes <@ array[
    'content:read','sources:read','search:read','changes:read','stats:read',
    'people:submit','specialists:submit','organizations:submit','courses:submit',
    'pages:submit','learning:submit','events:submit','schedules:submit','imports:read','webhooks:manage'
  ]::text[] and cardinality(scopes)>0
);

alter table public.api_integration_items add constraint api_integration_items_resource_type_check
  check (resource_type in ('person','specialist','organization','course','page','learning_path','event','schedule'));

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
    'pages:submit','learning:submit','events:submit','schedules:submit','imports:read','webhooks:manage'
  ]::text[];
begin
  if coalesce(p_key_hash,'') !~ '^[0-9a-f]{64}$' then return jsonb_build_object('authorized',false,'reason','invalid_key'); end if;
  if not (p_scope=any(v_allowed_scopes)) then return jsonb_build_object('authorized',false,'reason','invalid_scope'); end if;

  select * into v_key from public.api_partner_keys where key_hash=p_key_hash and status='active' limit 1;
  if not found then return jsonb_build_object('authorized',false,'reason','invalid_key'); end if;
  if v_key.expires_at<=now() then return jsonb_build_object('authorized',false,'reason','expired_key'); end if;
  select * into v_partner from public.api_partners where id=v_key.partner_id;
  if not found or v_partner.status<>'active' then return jsonb_build_object('authorized',false,'reason','partner_inactive'); end if;
  if not (p_scope=any(v_key.scopes)) or not (p_scope=any(v_partner.scopes)) then return jsonb_build_object('authorized',false,'reason','scope_denied'); end if;

  perform pg_advisory_xact_lock(hashtextextended(v_key.id::text,0));
  select used into v_minute_used from private.api_partner_usage_windows where key_id=v_key.id and window_kind='minute' and window_start=v_minute_start;
  select used into v_day_used from private.api_partner_usage_windows where key_id=v_key.id and window_kind='day' and window_start=v_day_start;
  v_minute_used:=coalesce(v_minute_used,0); v_day_used:=coalesce(v_day_used,0);
  if v_minute_used>=v_partner.quota_per_minute then return jsonb_build_object('authorized',false,'reason','rate_limited','window','minute','limit',v_partner.quota_per_minute,'remaining',0,'reset_at',v_minute_start+interval '1 minute'); end if;
  if v_day_used>=v_partner.quota_per_day then return jsonb_build_object('authorized',false,'reason','rate_limited','window','day','limit',v_partner.quota_per_day,'remaining',0,'reset_at',v_day_start+interval '1 day'); end if;

  if p_consume_quota then
    insert into private.api_partner_usage_windows(key_id,window_kind,window_start,used,updated_at)
    values(v_key.id,'minute',v_minute_start,1,now())
    on conflict(key_id,window_kind,window_start) do update set used=private.api_partner_usage_windows.used+1,updated_at=now()
    returning used into v_minute_after;
    insert into private.api_partner_usage_windows(key_id,window_kind,window_start,used,updated_at)
    values(v_key.id,'day',v_day_start,1,now())
    on conflict(key_id,window_kind,window_start) do update set used=private.api_partner_usage_windows.used+1,updated_at=now()
    returning used into v_day_after;
    if v_key.last_used_at is null or v_key.last_used_at<now()-interval '5 minutes' then update public.api_partner_keys set last_used_at=now() where id=v_key.id; end if;
  else
    v_minute_after:=v_minute_used; v_day_after:=v_day_used;
  end if;

  return jsonb_build_object(
    'authorized',true,'partner_id',v_partner.id,'partner_slug',v_partner.slug,'plan',v_partner.plan,
    'key_id',v_key.id,'key_prefix',v_key.key_prefix,'scope',p_scope,'scopes',v_key.scopes,
    'minute',jsonb_build_object('limit',v_partner.quota_per_minute,'remaining',greatest(v_partner.quota_per_minute-v_minute_after,0),'reset_at',v_minute_start+interval '1 minute'),
    'day',jsonb_build_object('limit',v_partner.quota_per_day,'remaining',greatest(v_partner.quota_per_day-v_day_after,0),'reset_at',v_day_start+interval '1 day')
  );
end;
$$;

revoke all on function private.api_partner_authorize_core(text,text,boolean) from public;

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
  v_scope:=case p_resource_type
    when 'person' then 'people:submit'
    when 'specialist' then 'specialists:submit'
    when 'organization' then 'organizations:submit'
    when 'course' then 'courses:submit'
    when 'page' then 'pages:submit'
    when 'learning_path' then 'learning:submit'
    when 'event' then 'events:submit'
    when 'schedule' then 'schedules:submit'
    else null end;
  if v_scope is null then return jsonb_build_object('authorized',false,'reason','invalid_resource_type'); end if;
  if char_length(trim(coalesce(p_external_id,''))) not between 1 and 200 then return jsonb_build_object('authorized',false,'reason','invalid_external_id'); end if;
  if coalesce(p_idempotency_key,'') !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$' then return jsonb_build_object('authorized',false,'reason','invalid_idempotency_key'); end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>262144 then return jsonb_build_object('authorized',false,'reason','invalid_payload'); end if;
  if p_provenance is null or jsonb_typeof(p_provenance)<>'object' or octet_length(p_provenance::text)>65536 then return jsonb_build_object('authorized',false,'reason','invalid_provenance'); end if;

  v_auth:=private.api_partner_authorize_core(p_key_hash,v_scope,true);
  if coalesce((v_auth->>'authorized')::boolean,false)=false then return v_auth; end if;
  v_partner_id:=(v_auth->>'partner_id')::uuid; v_key_id:=(v_auth->>'key_id')::uuid;
  v_payload_sha:=encode(extensions.digest(convert_to(p_payload::text,'UTF8'),'sha256'),'hex');

  select * into v_existing_request from public.api_integration_requests where partner_id=v_partner_id and idempotency_key=p_idempotency_key;
  if found then
    if v_existing_request.resource_type<>p_resource_type or v_existing_request.external_id<>trim(p_external_id) or v_existing_request.payload_sha256<>v_payload_sha then
      return v_auth||jsonb_build_object('accepted',false,'reason','idempotency_conflict');
    end if;
    select * into v_existing_item from public.api_integration_items where id=v_existing_request.item_id;
    return v_auth||jsonb_build_object('accepted',true,'idempotent_replay',true,'submission_id',v_existing_request.id,'item_id',v_existing_item.id,'resource_type',v_existing_item.resource_type,'external_id',v_existing_item.external_id,'status',v_existing_item.status,'review_required',true,'published_url',v_existing_item.published_url);
  end if;

  insert into public.api_integration_items(partner_id,resource_type,external_id,status,payload,payload_sha256,provenance,received_at,updated_at)
  values(v_partner_id,p_resource_type,trim(p_external_id),'received',p_payload,v_payload_sha,p_provenance,now(),now())
  on conflict(partner_id,resource_type,external_id) do update set payload=excluded.payload,payload_sha256=excluded.payload_sha256,provenance=excluded.provenance,status=case when public.api_integration_items.status='published' then 'needs_review' else 'received' end,review_note=null,reviewed_at=null,received_at=now(),updated_at=now()
  returning * into v_item;

  insert into public.api_integration_requests(partner_id,key_id,item_id,idempotency_key,resource_type,external_id,payload_sha256,outcome)
  values(v_partner_id,v_key_id,v_item.id,p_idempotency_key,p_resource_type,trim(p_external_id),v_payload_sha,'accepted') returning * into v_request;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(null,'api_integration_item',v_item.id::text,'partner_submit',jsonb_build_object('partner_id',v_partner_id,'key_id',v_key_id,'resource_type',p_resource_type,'external_id',trim(p_external_id),'status',v_item.status,'request_id',v_request.id));
  return v_auth||jsonb_build_object('accepted',true,'idempotent_replay',false,'submission_id',v_request.id,'item_id',v_item.id,'resource_type',v_item.resource_type,'external_id',v_item.external_id,'status',v_item.status,'review_required',true,'published_url',v_item.published_url);
end;
$$;

revoke execute on function public.api_partner_submit_integration(text,text,text,text,jsonb,jsonb) from public;
grant execute on function public.api_partner_submit_integration(text,text,text,text,jsonb,jsonb) to anon,authenticated,service_role;

commit;
