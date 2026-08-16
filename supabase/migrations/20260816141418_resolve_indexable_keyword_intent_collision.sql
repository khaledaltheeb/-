-- Separate the family-care search intent from the general gaming-disorder page.
-- Preserve the canonical URL and the broader term as a secondary keyword.

update public.content c
set primary_keyword = 'دليل الأسرة لاضطراب الألعاب الرقمية',
    secondary_keywords = case
      when 'اضطراب الألعاب الرقمية' = any(coalesce(c.secondary_keywords, array[]::text[])) then c.secondary_keywords
      else array_prepend('اضطراب الألعاب الرقمية', coalesce(c.secondary_keywords, array[]::text[]))
    end,
    schema_json = coalesce(c.schema_json, '{}'::jsonb) || jsonb_build_object(
      'seo_intent_dedupe', jsonb_build_object(
        'status', 'resolved',
        'decision', 'separate-family-care-intent',
        'previous_primary_keyword', 'اضطراب الألعاب الرقمية',
        'resolved_at', '2026-08-16',
        'canonical_preserved', true,
        'redirect_applied', false
      )
    )
where c.slug = 'care-guide-gaming-disorder-family-plan';

do $$
begin
  if exists (
    select 1
    from public.content
    where status = 'published'
      and robots_index = true
      and primary_keyword is not null
      and btrim(primary_keyword) <> ''
    group by primary_keyword
    having count(*) > 1
  ) then
    raise exception 'Indexable primary_keyword collision remains after intent dedupe migration';
  end if;
end
$$;
