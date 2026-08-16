-- Correct a previously stored provenance inference without changing content, canonical URLs,
-- publication status, or indexing holds. A review date alone is not evidence of a
-- specific reviewer or of a Rawafid-team review.
update public.content
set schema_json = jsonb_set(
  coalesce(schema_json, '{}'::jsonb),
  '{content_quality_hold}',
  coalesce(schema_json->'content_quality_hold', '{}'::jsonb) - 'review_provenance',
  true
)
where schema_json->'content_quality_hold'->>'review_provenance'
  = 'last_reviewed_at represents review by Rawafid team when no individual reviewer is recorded';

do $$
begin
  if exists (
    select 1
    from public.content
    where schema_json->'content_quality_hold'->>'review_provenance'
      = 'last_reviewed_at represents review by Rawafid team when no individual reviewer is recorded'
  ) then
    raise exception 'Inferred team-review provenance remains after correction';
  end if;
end
$$;
