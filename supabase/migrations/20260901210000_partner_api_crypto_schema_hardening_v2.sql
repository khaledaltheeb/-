begin;

-- Keep the SECURITY DEFINER search_path empty. pgcrypto is installed in the
-- extensions schema, so cryptographic functions must be schema-qualified.
create or replace function public.admin_issue_api_partner_key(
  p_partner_id uuid,
  p_label text,
  p_scopes text[] default null,
  p_expires_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid:=private.assert_partner_admin();
  v_partner public.api_partners;
  v_key public.api_partner_keys;
  v_plain text;
  v_scopes text[];
  v_expiry timestamptz;
  v_active_count integer;
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

  v_plain:='rawafid_live_'||encode(extensions.gen_random_bytes(32),'hex');
  insert into public.api_partner_keys(partner_id,label,key_prefix,key_hash,scopes,expires_at,created_by)
  values(
    v_partner.id,
    trim(p_label),
    left(v_plain,25),
    encode(extensions.digest(v_plain,'sha256'),'hex'),
    v_scopes,
    v_expiry,
    v_actor
  )
  returning * into v_key;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_actor,'api_partner_key',v_key.id::text,'issue',jsonb_build_object('partner_id',v_partner.id,'prefix',v_key.key_prefix,'label',v_key.label,'scopes',v_key.scopes,'expires_at',v_key.expires_at));

  return jsonb_build_object('key_id',v_key.id,'partner_id',v_partner.id,'key',v_plain,'key_prefix',v_key.key_prefix,'scopes',v_key.scopes,'expires_at',v_key.expires_at,'display_once',true);
end;
$$;

revoke execute on function public.admin_issue_api_partner_key(uuid,text,text[],timestamptz) from anon, public;
grant execute on function public.admin_issue_api_partner_key(uuid,text,text[],timestamptz) to authenticated, service_role;

comment on function public.admin_issue_api_partner_key(uuid,text,text[],timestamptz) is
  'Issues one-time-display Rawafid Partner API credentials using extensions.pgcrypto with an empty SECURITY DEFINER search_path.';

commit;
