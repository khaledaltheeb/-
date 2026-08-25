do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.content
  where canonical_url in (
    '/care-guides/suicide-risk-conversation-safety-plan/',
    '/care-guides/self-harm-family-safety-support/'
  )
    and status::text = 'published'
    and robots_index = true
    and robots_follow = true
    and coalesce(schema_json->'content_quality_hold'->>'metrics_state','') = 'post_rewrite_verified'
    and coalesce((schema_json->'content_quality_hold'->>'exact_duplicate_paragraph_pct')::numeric,0) = 0
    and coalesce((schema_json->'content_quality_hold'->>'normalized_duplicate_paragraph_pct')::numeric,0) = 0
    and coalesce((schema_json->'content_quality_hold'->>'normalized_duplicate_word_pct')::numeric,0) = 0;

  if v_count <> 2 then
    raise exception 'V7 critical guide release precondition failed: expected 2 verified published indexable records, found %', v_count;
  end if;
end
$$;

update public.content
set
  reviewer_display_name = 'فريق روافد',
  reviewer_credentials = 'فريق التدقيق والتحرير المؤسسي — منصة روافد',
  last_reviewed_at = now(),
  schema_json = jsonb_set(
    jsonb_set(
      schema_json,
      '{content_quality_hold}',
      coalesce(schema_json->'content_quality_hold','{}'::jsonb) || jsonb_build_object(
        'status','released_after_fresh_rawafid_review',
        'review_status','completed',
        'released_for_indexing',true,
        'review_completed_at',to_jsonb(now()),
        'robots_index',true,
        'robots_follow',true
      ),
      true
    ),
    '{revision_provenance}',
    coalesce(schema_json->'revision_provenance','[]'::jsonb) || jsonb_build_array(
      jsonb_build_object(
        'review_status','completed_by_rawafid_team',
        'review_completed_at',to_jsonb(now()),
        'review_scope','fresh post-rewrite editorial release review',
        'visible_content_changed',false
      )
    ),
    true
  ),
  robots_index = true,
  robots_follow = true,
  updated_at = now()
where canonical_url in (
  '/care-guides/suicide-risk-conversation-safety-plan/',
  '/care-guides/self-harm-family-safety-support/'
)
  and status::text = 'published'
  and robots_index = true
  and robots_follow = true;

do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.content
  where canonical_url in (
    '/care-guides/suicide-risk-conversation-safety-plan/',
    '/care-guides/self-harm-family-safety-support/'
  )
    and status::text = 'published'
    and robots_index = true
    and robots_follow = true
    and reviewer_display_name = 'فريق روافد'
    and nullif(btrim(coalesce(reviewer_credentials,'')),'') is not null
    and last_reviewed_at is not null
    and schema_json->'content_quality_hold'->>'status' = 'released_after_fresh_rawafid_review'
    and schema_json->'content_quality_hold'->>'metrics_state' = 'post_rewrite_verified';

  if v_count <> 2 then
    raise exception 'V7 critical guide release postcondition failed: expected 2 reviewed released records, found %', v_count;
  end if;
end
$$;
