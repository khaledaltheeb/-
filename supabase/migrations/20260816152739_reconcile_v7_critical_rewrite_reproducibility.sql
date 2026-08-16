-- Reconcile the two Batch 001 rewrites so live Supabase state is reproducible
-- from versioned migrations without rewriting already-applied migration history.

update public.content
set references_json = case
      when slug = 'care-guide-suicide-risk-conversation-safety-plan'
       and not exists (
         select 1
         from jsonb_array_elements(coalesce(references_json, '[]'::jsonb)) r
         where coalesce(r->>'id', '') = 'WHO-Safety-Planning'
            or r->>'url' = 'https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme/evidence-centre/self-harm-and-suicide/safety-planning-interventions'
       )
      then coalesce(references_json, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'id', 'WHO-Safety-Planning',
        'url', 'https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme/evidence-centre/self-harm-and-suicide/safety-planning-interventions',
        'year', 2023,
        'title', 'Safety planning interventions',
        'publisher', 'World Health Organization',
        'source_type', 'guideline',
        'authority_tier', 'primary'
      ))
      else references_json
    end,
    schema_json = case
      when slug = 'care-guide-suicide-risk-conversation-safety-plan' then
        jsonb_set(
          jsonb_set(
            jsonb_set(
              schema_json,
              '{claim_source_map}',
              replace(
                coalesce((schema_json->'claim_source_map')::text, '[]'),
                'https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme/evidence-centre/self-harm-and-suicide/safety-planning-interventions',
                'WHO-Safety-Planning'
              )::jsonb,
              true
            ),
            '{content_quality_hold}',
            coalesce(schema_json->'content_quality_hold', '{}'::jsonb) || jsonb_build_object(
              'pre_rewrite_metrics', jsonb_build_object(
                'substantive_paragraphs', 35,
                'exact_duplicate_paragraphs', 8,
                'exact_duplicate_paragraph_pct', 22.9,
                'normalized_duplicate_paragraphs', 18,
                'normalized_duplicate_paragraph_pct', 51.4,
                'substantive_words', 2839,
                'normalized_duplicate_words', 1511,
                'normalized_duplicate_word_pct', 53.2
              ),
              'status', 'rewrite_completed_pending_rawafid_review',
              'metrics_state', 'post_rewrite_verified',
              'substantive_paragraphs', 23,
              'exact_duplicate_paragraphs', 0,
              'exact_duplicate_paragraph_pct', 0.0,
              'normalized_duplicate_paragraphs', 0,
              'normalized_duplicate_paragraph_pct', 0.0,
              'substantive_words', 1825,
              'normalized_duplicate_words', 0,
              'normalized_duplicate_word_pct', 0.0,
              'body_words', 2447
            ),
            true
          ),
          '{originality_report}',
          jsonb_build_object(
            'method', 'topic-specific-critical-rewrite-plus-full-v7-corpus-duplicate-recheck',
            'passed', true,
            'exact_duplicate_paragraph_pct', 0.0,
            'normalized_duplicate_paragraph_pct', 0.0,
            'normalized_duplicate_word_pct', 0.0,
            'verified_at', coalesce(schema_json->'originality_report'->'verified_at', to_jsonb(now()))
          ),
          true
        )
      when slug = 'care-guide-self-harm-family-safety-support' then
        jsonb_set(
          jsonb_set(
            schema_json,
            '{content_quality_hold}',
            coalesce(schema_json->'content_quality_hold', '{}'::jsonb) || jsonb_build_object(
              'pre_rewrite_metrics', jsonb_build_object(
                'substantive_paragraphs', 34,
                'exact_duplicate_paragraphs', 8,
                'exact_duplicate_paragraph_pct', 23.5,
                'normalized_duplicate_paragraphs', 18,
                'normalized_duplicate_paragraph_pct', 52.9,
                'substantive_words', 2556,
                'normalized_duplicate_words', 1521,
                'normalized_duplicate_word_pct', 59.5
              ),
              'status', 'rewrite_completed_pending_rawafid_review',
              'metrics_state', 'post_rewrite_verified',
              'substantive_paragraphs', 24,
              'exact_duplicate_paragraphs', 0,
              'exact_duplicate_paragraph_pct', 0.0,
              'normalized_duplicate_paragraphs', 0,
              'normalized_duplicate_paragraph_pct', 0.0,
              'substantive_words', 1646,
              'normalized_duplicate_words', 0,
              'normalized_duplicate_word_pct', 0.0,
              'body_words', 2328
            ),
            true
          ),
          '{originality_report}',
          jsonb_build_object(
            'method', 'topic-specific-critical-rewrite-plus-full-v7-corpus-duplicate-recheck',
            'passed', true,
            'exact_duplicate_paragraph_pct', 0.0,
            'normalized_duplicate_paragraph_pct', 0.0,
            'normalized_duplicate_word_pct', 0.0,
            'verified_at', coalesce(schema_json->'originality_report'->'verified_at', to_jsonb(now()))
          ),
          true
        )
      else schema_json
    end,
    robots_index = false,
    robots_follow = true,
    updated_at = now()
where slug in (
  'care-guide-suicide-risk-conversation-safety-plan',
  'care-guide-self-harm-family-safety-support'
);

do $$
begin
  if exists (
    select 1
    from public.content
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
        or coalesce((schema_json->'originality_report'->>'passed')::boolean, false) is distinct from true
        or coalesce((schema_json->'content_quality_hold'->>'normalized_duplicate_word_pct')::numeric, -1) <> 0
      )
  ) then
    raise exception 'V7 critical rewrite reconciliation invariant failed';
  end if;

  if not exists (
    select 1
    from public.content c
    cross join lateral jsonb_array_elements(coalesce(c.references_json, '[]'::jsonb)) r
    where c.slug = 'care-guide-suicide-risk-conversation-safety-plan'
      and coalesce(r->>'id', '') = 'WHO-Safety-Planning'
  ) then
    raise exception 'WHO safety-planning reference missing after reconciliation';
  end if;

  if exists (
    select 1
    from public.content
    where slug = 'care-guide-suicide-risk-conversation-safety-plan'
      and coalesce((schema_json->'claim_source_map')::text, '') like '%https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme/evidence-centre/self-harm-and-suicide/safety-planning-interventions%'
  ) then
    raise exception 'WHO safety-planning claim key was not normalized';
  end if;
end
$$;
