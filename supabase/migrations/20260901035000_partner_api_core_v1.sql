-- Rawafid Institutional Partner API v1 core.
-- Keys are never stored in plaintext. Quotas are enforced atomically in Postgres.

create table if not exists public.api_partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 200),
  contact_email text,
  status text not null default 'active' check (status in ('active','suspended','revoked')),
  plan text not null default 'institutional' check (plan in ('institutional','research','strategic')),
  scopes text[] not null default array['content:read','sources:read','search:read','changes:read','stats:read']::text[],
  quota_per_minute integer not null default 120 check (quota_per_minute between 1 and 10000),
  quota_per_day integer not null default 25000 check (quota_per_day between 1 and 10000000),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint api_partners_scopes_valid check (
    scopes <@ array['content:read','sources:read','search:read','changes:read','stats:read']::text[]
    and cardinality(scopes) > 0
  )
);

create table if not exists public.api_partner_keys (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.api_partners(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 120),
  key_prefix text not null unique,
  key_hash text not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  scopes text[] not null,
  status text not null default 'active' check (status in ('active','revoked')),
  expires_at timestamptz not null,
  last_used_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint api_partner_keys_scopes_valid check (
    scopes <@ array['content:read','sources:read','search:read','changes:read','stats:read']::text[]
    and cardinality(scopes) > 0
  )
);

create index if not exists api_partner_keys_partner_idx on public.api_partner_keys(partner_id,status);
create index if not exists api_partner_keys_hash_idx on public.api_partner_keys(key_hash) where status='active';
create index if not exists api_partner_keys_expiry_idx on public.api_partner_keys(expires_at) where status='active';

create table if not exists private.api_partner_usage_windows (
  key_id uuid not null references public.api_partner_keys(id) on delete cascade,
  window_kind text not null check (window_kind in ('minute','day')),
  window_start timestamptz not null,
  used integer not null default 0 check (used >= 0),
  updated_at timestamptz not null default now(),
  primary key (key_id,window_kind,window_start)
);
create index if not exists api_partner_usage_window_start_idx on private.api_partner_usage_windows(window_start);

alter table public.api_partners enable row level security;
alter table public.api_partner_keys enable row level security;
revoke all on table public.api_partners from anon,authenticated;
revoke all on table public.api_partner_keys from anon,authenticated;
revoke all on table private.api_partner_usage_windows from public;

create or replace function private.assert_partner_admin()
returns uuid
language plpgsql
stable
security definer
set search_path=''
as $$
declare v_uid uuid:=auth.uid();
begin
  if v_uid is null or not private.is_admin() then
    raise exception 'administrator privileges required' using errcode='42501';
  end if;
  return v_uid;
end;
$$;
revoke all on function private.assert_partner_admin() from public;

create or replace function public.admin_create_api_partner(
  p_name text,
  p_slug text,
  p_contact_email text default null,
  p_plan text default 'institutional',
  p_scopes text[] default array['content:read','sources:read','search:read','changes:read','stats:read']::text[],
  p_quota_per_minute integer default 120,
  p_quota_per_day integer default 25000
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare v_actor uuid:=private.assert_partner_admin(); v_partner public.api_partners;
begin
  if trim(coalesce(p_name,''))='' or char_length(trim(p_name))>200 then raise exception 'invalid partner name'; end if;
  if coalesce(p_slug,'') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'invalid partner slug'; end if;
  if p_plan not in ('institutional','research','strategic') then raise exception 'invalid plan'; end if;
  if p_scopes is null or cardinality(p_scopes)=0 or not (p_scopes <@ array['content:read','sources:read','search:read','changes:read','stats:read']::text[]) then raise exception 'invalid scopes'; end if;
  if p_quota_per_minute not between 1 and 10000 or p_quota_per_day not between 1 and 10000000 then raise exception 'invalid quota'; end if;
  insert into public.api_partners(name,slug,contact_email,plan,scopes,quota_per_minute,quota_per_day,created_by)
  values(trim(p_name),p_slug,nullif(trim(coalesce(p_contact_email,'')),''),p_plan,p_scopes,p_quota_per_minute,p_quota_per_day,v_actor)
  returning * into v_partner;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_actor,'api_partner',v_partner.id::text,'create',jsonb_build_object('slug',v_partner.slug,'name',v_partner.name,'plan',v_partner.plan,'scopes',v_partner.scopes));
  return jsonb_build_object('id',v_partner.id,'slug',v_partner.slug,'name',v_partner.name,'status',v_partner.status);
end;
$$;

create or replace function public.admin_issue_api_partner_key(
  p_partner_id uuid,
  p_label text,
  p_scopes text[] default null,
  p_expires_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_actor uuid:=private.assert_partner_admin(); v_partner public.api_partners; v_key public.api_partner_keys;
  v_plain text; v_scopes text[]; v_expiry timestamptz; v_active_count integer;
begin
  select * into v_partner from public.api_partners where id=p_partner_id for update;
  if not found then raise exception 'partner not found'; end if;
  if v_partner.status<>'active' then raise exception 'partner is not active'; end if;
  if trim(coalesce(p_label,''))='' or char_length(trim(p_label))>120 then raise exception 'invalid key label'; end if;
  v_scopes:=coalesce(p_scopes,v_partner.scopes);
  if cardinality(v_scopes)=0 or not (v_scopes <@ v_partner.scopes) then raise exception 'key scopes exceed partner scopes'; end if;
  v_expiry:=coalesce(p_expires_at,now()+interval '180 days');
  if v_expiry<=now()+interval '5 minutes' or v_expiry>now()+interval '730 days' then raise exception 'invalid key expiry'; end if;
  select count(*)::integer into v_active_count from public.api_partner_keys where partner_id=p_partner_id and status='active' and expires_at>now();
  if v_active_count>=10 then raise exception 'active key limit reached'; end if;
  v_plain:='rawafid_live_'||encode(gen_random_bytes(32),'hex');
  insert into public.api_partner_keys(partner_id,label,key_prefix,key_hash,scopes,expires_at,created_by)
  values(v_partner.id,trim(p_label),left(v_plain,25),encode(digest(v_plain,'sha256'),'hex'),v_scopes,v_expiry,v_actor)
  returning * into v_key;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_actor,'api_partner_key',v_key.id::text,'issue',jsonb_build_object('partner_id',v_partner.id,'prefix',v_key.key_prefix,'label',v_key.label,'scopes',v_key.scopes,'expires_at',v_key.expires_at));
  return jsonb_build_object('key_id',v_key.id,'partner_id',v_partner.id,'key',v_plain,'key_prefix',v_key.key_prefix,'scopes',v_key.scopes,'expires_at',v_key.expires_at,'display_once',true);
end;
$$;

create or replace function public.admin_revoke_api_partner_key(p_key_id uuid)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare v_actor uuid:=private.assert_partner_admin(); v_key public.api_partner_keys;
begin
  update public.api_partner_keys set status='revoked',revoked_at=now() where id=p_key_id and status='active' returning * into v_key;
  if not found then return false; end if;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_actor,'api_partner_key',v_key.id::text,'revoke',jsonb_build_object('partner_id',v_key.partner_id,'prefix',v_key.key_prefix));
  return true;
end;
$$;

create or replace function public.admin_set_api_partner_status(p_partner_id uuid,p_status text)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare v_actor uuid:=private.assert_partner_admin(); v_old text;
begin
  if p_status not in ('active','suspended','revoked') then raise exception 'invalid status'; end if;
  select status into v_old from public.api_partners where id=p_partner_id for update;
  if not found then return false; end if;
  update public.api_partners set status=p_status,updated_at=now() where id=p_partner_id;
  if p_status='revoked' then update public.api_partner_keys set status='revoked',revoked_at=coalesce(revoked_at,now()) where partner_id=p_partner_id and status='active'; end if;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values(v_actor,'api_partner',p_partner_id::text,'status_change',jsonb_build_object('status',v_old),jsonb_build_object('status',p_status));
  return true;
end;
$$;

create or replace function public.api_partner_authorize(p_key_hash text,p_scope text)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_key public.api_partner_keys; v_partner public.api_partners;
  v_minute_start timestamptz:=date_trunc('minute',now());
  v_day_start timestamptz:=(date_trunc('day',now() at time zone 'UTC') at time zone 'UTC');
  v_minute_used integer:=0; v_day_used integer:=0; v_minute_after integer; v_day_after integer;
begin
  if coalesce(p_key_hash,'') !~ '^[0-9a-f]{64}$' then return jsonb_build_object('authorized',false,'reason','invalid_key'); end if;
  if p_scope not in ('content:read','sources:read','search:read','changes:read','stats:read') then return jsonb_build_object('authorized',false,'reason','invalid_scope'); end if;
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
  if v_minute_used>=v_partner.quota_per_minute then
    return jsonb_build_object('authorized',false,'reason','rate_limited','window','minute','limit',v_partner.quota_per_minute,'remaining',0,'reset_at',v_minute_start+interval '1 minute');
  end if;
  if v_day_used>=v_partner.quota_per_day then
    return jsonb_build_object('authorized',false,'reason','rate_limited','window','day','limit',v_partner.quota_per_day,'remaining',0,'reset_at',v_day_start+interval '1 day');
  end if;
  insert into private.api_partner_usage_windows(key_id,window_kind,window_start,used,updated_at)
  values(v_key.id,'minute',v_minute_start,1,now())
  on conflict(key_id,window_kind,window_start) do update set used=private.api_partner_usage_windows.used+1,updated_at=now()
  returning used into v_minute_after;
  insert into private.api_partner_usage_windows(key_id,window_kind,window_start,used,updated_at)
  values(v_key.id,'day',v_day_start,1,now())
  on conflict(key_id,window_kind,window_start) do update set used=private.api_partner_usage_windows.used+1,updated_at=now()
  returning used into v_day_after;
  if v_key.last_used_at is null or v_key.last_used_at<now()-interval '5 minutes' then update public.api_partner_keys set last_used_at=now() where id=v_key.id; end if;
  return jsonb_build_object(
    'authorized',true,'partner_id',v_partner.id,'partner_slug',v_partner.slug,'plan',v_partner.plan,
    'key_id',v_key.id,'key_prefix',v_key.key_prefix,'scope',p_scope,'scopes',v_key.scopes,
    'minute',jsonb_build_object('limit',v_partner.quota_per_minute,'remaining',greatest(v_partner.quota_per_minute-v_minute_after,0),'reset_at',v_minute_start+interval '1 minute'),
    'day',jsonb_build_object('limit',v_partner.quota_per_day,'remaining',greatest(v_partner.quota_per_day-v_day_after,0),'reset_at',v_day_start+interval '1 day')
  );
end;
$$;

create or replace function public.admin_api_partner_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path=''
as $$
declare v_actor uuid:=private.assert_partner_admin(); v_result jsonb;
begin
  select jsonb_build_object('generated_at',now(),'partners',coalesce(jsonb_agg(row_json order by created_at desc),'[]'::jsonb)) into v_result
  from (
    select p.created_at,jsonb_build_object(
      'id',p.id,'slug',p.slug,'name',p.name,'contact_email',p.contact_email,'status',p.status,'plan',p.plan,
      'scopes',p.scopes,'quota_per_minute',p.quota_per_minute,'quota_per_day',p.quota_per_day,'created_at',p.created_at,
      'keys',coalesce((select jsonb_agg(jsonb_build_object('id',k.id,'label',k.label,'key_prefix',k.key_prefix,'scopes',k.scopes,'status',k.status,'expires_at',k.expires_at,'last_used_at',k.last_used_at,'created_at',k.created_at) order by k.created_at desc) from public.api_partner_keys k where k.partner_id=p.id),'[]'::jsonb),
      'usage_today',coalesce((select sum(u.used)::bigint from private.api_partner_usage_windows u join public.api_partner_keys k2 on k2.id=u.key_id where k2.partner_id=p.id and u.window_kind='day' and u.window_start=(date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')),0)
    ) row_json
    from public.api_partners p
  ) q;
  return v_result;
end;
$$;

revoke all on function public.admin_create_api_partner(text,text,text,text,text[],integer,integer) from public;
revoke all on function public.admin_issue_api_partner_key(uuid,text,text[],timestamptz) from public;
revoke all on function public.admin_revoke_api_partner_key(uuid) from public;
revoke all on function public.admin_set_api_partner_status(uuid,text) from public;
revoke all on function public.admin_api_partner_dashboard() from public;
revoke all on function public.api_partner_authorize(text,text) from public;
grant execute on function public.admin_create_api_partner(text,text,text,text,text[],integer,integer) to authenticated;
grant execute on function public.admin_issue_api_partner_key(uuid,text,text[],timestamptz) to authenticated;
grant execute on function public.admin_revoke_api_partner_key(uuid) to authenticated;
grant execute on function public.admin_set_api_partner_status(uuid,text) to authenticated;
grant execute on function public.admin_api_partner_dashboard() to authenticated;
grant execute on function public.api_partner_authorize(text,text) to anon,authenticated;

create or replace function private.prune_partner_api_usage()
returns integer
language plpgsql
security definer
set search_path=''
as $$
declare v_count integer;
begin
  delete from private.api_partner_usage_windows where window_start<now()-interval '90 days';
  get diagnostics v_count=row_count;
  return v_count;
end;
$$;
revoke all on function private.prune_partner_api_usage() from public;

do $$ declare r record; begin
  for r in select jobid from cron.job where jobname='rawafid-partner-api-prune-v1' loop perform cron.unschedule(r.jobid); end loop;
end $$;
select cron.schedule('rawafid-partner-api-prune-v1','17 3 * * *','select private.prune_partner_api_usage();');
notify pgrst,'reload schema';
