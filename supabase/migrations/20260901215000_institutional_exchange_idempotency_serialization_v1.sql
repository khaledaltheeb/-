begin;

-- Serialize the same partner-level Idempotency-Key before the request ledger is
-- inspected. This closes the race where two concurrent requests using separate
-- active keys for the same partner could otherwise both pass the initial lookup
-- and collide on the unique ledger constraint.
create or replace function public.api_partner_submit_integration_serialized(
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
  v_partner_id uuid;
  v_lock_identity text;
begin
  if coalesce(p_idempotency_key,'') !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$' then
    return jsonb_build_object('authorized',false,'reason','invalid_idempotency_key');
  end if;

  select partner_id into v_partner_id
  from public.api_partner_keys
  where key_hash=p_key_hash
  limit 1;

  v_lock_identity:=coalesce(v_partner_id::text,p_key_hash)||':'||p_idempotency_key;
  perform pg_advisory_xact_lock(hashtextextended(v_lock_identity,77103));

  return public.api_partner_submit_integration(
    p_key_hash,
    p_resource_type,
    p_external_id,
    p_idempotency_key,
    p_payload,
    p_provenance
  );
end;
$$;

revoke execute on function public.api_partner_submit_integration_serialized(text,text,text,text,jsonb,jsonb) from public;
grant execute on function public.api_partner_submit_integration_serialized(text,text,text,text,jsonb,jsonb) to anon,authenticated,service_role;

comment on function public.api_partner_submit_integration_serialized(text,text,text,text,jsonb,jsonb) is
  'Serialized institutional submission entrypoint. Locks on partner plus Idempotency-Key before delegating to governed staging ingestion.';

commit;
