begin;

-- Complete administrative support for the expanded institutional scopes.
-- Existing partner-management RPCs originally validated read-only scopes.

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
declare
  v_actor uuid:=private.assert_partner_admin();
  v_partner public.api_partners;
  v_allowed constant text[] := array[
    'content:read','sources:read','search:read','changes:read','stats:read',
    'people:submit','specialists:submit','organizations:submit','courses:submit',
    'events:submit','schedules:submit','imports:read','webhooks:manage'
  ]::text[];
begin
  if trim(coalesce(p_name,''))='' or char_length(trim(p_name))>200 then raise exception 'invalid partner name'; end if;
  if coalesce(p_slug,'') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'invalid partner slug'; end if;
  if p_plan not in ('institutional','research','strategic') then raise exception 'invalid plan'; end if;
  if p_scopes is null or cardinality(p_scopes)=0 or not (p_scopes <@ v_allowed) then raise exception 'invalid scopes'; end if;
  if p_quota_per_minute not between 1 and 10000 or p_quota_per_day not between 1 and 10000000 then raise exception 'invalid quota'; end if;

  insert into public.api_partners(name,slug,contact_email,plan,scopes,quota_per_minute,quota_per_day,created_by)
  values(trim(p_name),p_slug,nullif(trim(coalesce(p_contact_email,'')),''),p_plan,p_scopes,p_quota_per_minute,p_quota_per_day,v_actor)
  returning * into v_partner;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_actor,'api_partner',v_partner.id::text,'create',jsonb_build_object(
    'slug',v_partner.slug,'name',v_partner.name,'plan',v_partner.plan,'scopes',v_partner.scopes
  ));

  return jsonb_build_object('id',v_partner.id,'slug',v_partner.slug,'name',v_partner.name,'status',v_partner.status,'scopes',v_partner.scopes);
end;
$$;

create or replace function public.admin_set_api_partner_scopes(
  p_partner_id uuid,
  p_scopes text[]
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_actor uuid:=private.assert_partner_admin();
  v_partner public.api_partners;
  v_before text[];
  v_allowed constant text[] := array[
    'content:read','sources:read','search:read','changes:read','stats:read',
    'people:submit','specialists:submit','organizations:submit','courses:submit',
    'events:submit','schedules:submit','imports:read','webhooks:manage'
  ]::text[];
begin
  if p_scopes is null or cardinality(p_scopes)=0 or not (p_scopes <@ v_allowed) then raise exception 'invalid scopes'; end if;

  select * into v_partner from public.api_partners where id=p_partner_id for update;
  if not found then raise exception 'partner not found'; end if;
  v_before:=v_partner.scopes;

  update public.api_partners
  set scopes=p_scopes, updated_at=now()
  where id=p_partner_id
  returning * into v_partner;

  -- Any key that now exceeds partner scopes is revoked atomically rather than
  -- silently retaining broader historical authority.
  update public.api_partner_keys
  set status='revoked', revoked_at=coalesce(revoked_at,now())
  where partner_id=p_partner_id
    and status='active'
    and not (scopes <@ p_scopes);

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values(v_actor,'api_partner',p_partner_id::text,'scope_change',jsonb_build_object('scopes',v_before),jsonb_build_object('scopes',v_partner.scopes));

  return jsonb_build_object('id',v_partner.id,'slug',v_partner.slug,'scopes',v_partner.scopes,'updated_at',v_partner.updated_at);
end;
$$;

revoke execute on function public.admin_create_api_partner(text,text,text,text,text[],integer,integer) from anon,public;
revoke execute on function public.admin_set_api_partner_scopes(uuid,text[]) from anon,public;
grant execute on function public.admin_create_api_partner(text,text,text,text,text[],integer,integer) to authenticated,service_role;
grant execute on function public.admin_set_api_partner_scopes(uuid,text[]) to authenticated,service_role;

comment on function public.admin_set_api_partner_scopes(uuid,text[]) is
  'Least-privilege partner scope administration. Revokes active keys that would exceed a reduced partner scope set.';

commit;
