update public.content
set schema_json = jsonb_set(coalesce(schema_json,'{}'::jsonb), '{review_visibility}', '"metadata_only"'::jsonb, true), updated_at = now()
where canonical_url in (
  '/care-guides/cognitive-flexibility-switching-plan/',
  '/care-guides/cognitive-load-instruction-audit/',
  '/care-guides/inhibitory-control-pause-plan/',
  '/care-guides/metacognition-study-review-card/',
  '/care-guides/processing-speed-accuracy-balance/',
  '/care-guides/prospective-memory-external-cues/',
  '/care-guides/retrieval-practice-study-plan/',
  '/care-guides/selective-attention-distraction-audit/',
  '/care-guides/spaced-practice-study-calendar/',
  '/care-guides/sustained-attention-work-interval/',
  '/care-guides/working-memory-task-breakdown/',
  '/care-guides/suicide-risk-conversation-safety-plan/',
  '/care-guides/self-harm-family-safety-support/'
);

do $$
declare v_count integer;
begin
  select count(*) into v_count from public.content
  where canonical_url in (
    '/care-guides/cognitive-flexibility-switching-plan/',
    '/care-guides/cognitive-load-instruction-audit/',
    '/care-guides/inhibitory-control-pause-plan/',
    '/care-guides/metacognition-study-review-card/',
    '/care-guides/processing-speed-accuracy-balance/',
    '/care-guides/prospective-memory-external-cues/',
    '/care-guides/retrieval-practice-study-plan/',
    '/care-guides/selective-attention-distraction-audit/',
    '/care-guides/spaced-practice-study-calendar/',
    '/care-guides/sustained-attention-work-interval/',
    '/care-guides/working-memory-task-breakdown/',
    '/care-guides/suicide-risk-conversation-safety-plan/',
    '/care-guides/self-harm-family-safety-support/'
  ) and schema_json->>'review_visibility'='metadata_only';
  if v_count <> 13 then raise exception 'expected 13 metadata-only review records, found %', v_count; end if;
end $$;
