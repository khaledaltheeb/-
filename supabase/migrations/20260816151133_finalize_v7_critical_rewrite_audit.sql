-- Exact SQL applied to Supabase as migration 20260816151133.
-- Later evidence-key/metric reconciliation is intentionally recorded in a new migration.

update public.content
set schema_json = jsonb_set(
  schema_json,
  '{content_quality_hold}',
  (schema_json->'content_quality_hold') || jsonb_build_object(
    'status','rewrite_completed_pending_rawafid_review',
    'metrics_state','post_rewrite_verified',
    'quality_reaudit_at',to_jsonb(now())
  ),
  true
), updated_at=now()
where slug in (
    'care-guide-suicide-risk-conversation-safety-plan',
    'care-guide-self-harm-family-safety-support'
  )
  and robots_index=false
  and robots_follow=true
  and last_reviewed_at is null;

do $$
begin
  if exists (
    select 1 from public.content
    where slug in (
      'care-guide-suicide-risk-conversation-safety-plan',
      'care-guide-self-harm-family-safety-support'
    )
      and (
        robots_index is distinct from false
        or robots_follow is distinct from true
        or last_reviewed_at is not null
        or schema_json->'content_quality_hold'->>'status' <> 'rewrite_completed_pending_rawafid_review'
        or schema_json->'content_quality_hold'->>'metrics_state' <> 'post_rewrite_verified'
      )
  ) then
    raise exception 'V7 critical rewrite safety/audit invariant failed';
  end if;
end
$$;
