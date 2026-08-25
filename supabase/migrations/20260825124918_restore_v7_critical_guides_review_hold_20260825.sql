create or replace function private.guard_published_content_presence()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if tg_op = 'DELETE' then
    if old.status::text = 'published'
       and old.published_at is not null
       and old.published_at <= pg_catalog.now() then
      raise exception 'published public content cannot be deleted; preserve the live page and revise it in place';
    end if;
    return old;
  end if;

  if old.status::text = 'published'
     and old.published_at is not null
     and old.published_at <= pg_catalog.now() then
    if new.status::text <> 'published' then
      raise exception 'published public content cannot be unpublished or archived; preserve the live page';
    end if;
    if new.published_at is null or new.published_at > pg_catalog.now() then
      raise exception 'published public content cannot be moved out of the live publication window';
    end if;
    if coalesce(old.robots_index, false) = true
       and coalesce(new.robots_index, false) = false
       and not (
         coalesce(new.robots_follow, false) = true
         and coalesce(new.schema_json #>> '{content_quality_hold,status}', '') in (
           'rewrite_completed_pending_rawafid_review',
           'safety_hold_pending_review'
         )
         and coalesce(new.schema_json #>> '{content_quality_hold,content_preserved}', 'false') = 'true'
       ) then
      raise exception 'an indexable published page cannot be changed to noindex without an explicit preserved-content safety/review hold';
    end if;
    if new.slug is distinct from old.slug then
      raise exception 'published public content slug is immutable; preserve the existing public route';
    end if;
    if new.canonical_url is distinct from old.canonical_url then
      raise exception 'published public content canonical URL is immutable; preserve the existing public route';
    end if;
  end if;

  return new;
end;
$function$;

do $$
declare v_count integer;
begin
  select count(*) into v_count
  from public.content
  where slug in (
    'care-guide-suicide-risk-conversation-safety-plan',
    'care-guide-self-harm-family-safety-support'
  )
    and status::text = 'published'
    and robots_index = true
    and robots_follow = true
    and last_reviewed_at is not null
    and reviewer_display_name = 'فريق روافد'
    and schema_json #>> '{content_quality_hold,status}' = 'released_after_fresh_rawafid_review';
  if v_count <> 2 then
    raise exception 'critical-guide retraction precondition failed: expected 2 released review-stamped records, found %', v_count;
  end if;
end
$$;

update public.content
set
  schema_json = (
    jsonb_set(
      jsonb_set(
        coalesce(schema_json, '{}'::jsonb),
        '{content_quality_hold}',
        (
          coalesce(schema_json -> 'content_quality_hold', '{}'::jsonb)
          || jsonb_build_object(
            'status', 'rewrite_completed_pending_rawafid_review',
            'review_status', 'pending_fresh_rawafid_review',
            'released_for_indexing', false,
            'robots_index', false,
            'robots_follow', true,
            'release_retracted_at', to_jsonb(pg_catalog.now()),
            'release_retraction_reason', 'database-only review release stamp lacked a matching repository release record and independent audit-log review event'
          )
        ) - 'review_completed_at',
        true
      ),
      '{revision_provenance}',
      coalesce(schema_json -> 'revision_provenance', '[]'::jsonb)
      || jsonb_build_array(
        jsonb_build_object(
          'review_status', 'retracted_unverified_database_release_stamp',
          'retracted_at', to_jsonb(pg_catalog.now()),
          'retracted_review_completed_at', to_jsonb(last_reviewed_at),
          'retracted_reviewer_display_name', reviewer_display_name,
          'reason', 'no matching repository release record or independent audit-log review event was found; fresh Rawafid review remains required',
          'visible_content_changed', false
        )
      ),
      true
    ) - 'review_visibility'
  ),
  reviewer_display_name = null,
  reviewer_credentials = null,
  last_reviewed_at = null,
  robots_index = false,
  robots_follow = true,
  updated_at = pg_catalog.now()
where slug in (
  'care-guide-suicide-risk-conversation-safety-plan',
  'care-guide-self-harm-family-safety-support'
)
  and status::text = 'published'
  and schema_json #>> '{content_quality_hold,status}' = 'released_after_fresh_rawafid_review';

do $$
declare v_count integer;
begin
  select count(*) into v_count
  from public.content
  where slug in (
    'care-guide-suicide-risk-conversation-safety-plan',
    'care-guide-self-harm-family-safety-support'
  )
    and status::text = 'published'
    and robots_index = false
    and robots_follow = true
    and last_reviewed_at is null
    and reviewer_display_name is null
    and reviewer_credentials is null
    and schema_json #>> '{content_quality_hold,status}' = 'rewrite_completed_pending_rawafid_review'
    and schema_json #>> '{content_quality_hold,review_status}' = 'pending_fresh_rawafid_review'
    and schema_json #>> '{content_quality_hold,released_for_indexing}' = 'false';
  if v_count <> 2 then
    raise exception 'critical-guide retraction postcondition failed: expected 2 held records, found %', v_count;
  end if;
end
$$;
