-- Keep heavily templated V7 care/evidence guides accessible in place but out of the
-- index until they receive a genuinely unique rewrite. The measurement is intrinsic:
-- it evaluates the complete published V7 corpus, not only currently indexable rows.

create temporary table _v7_template_quality_candidates on commit drop as
with cohort as (
  select id, slug, primary_keyword, body_json
  from public.content
  where status = 'published'
    and schema_json->>'content_contract_version' = '7'
    and schema_json->>'page_role' in ('care-guide', 'guide')
), raw_paragraphs as (
  select
    c.id,
    c.slug,
    regexp_replace(b->>'text', '\s+', ' ', 'g') as raw_text,
    case
      when coalesce(c.primary_keyword, '') <> ''
        then replace(regexp_replace(b->>'text', '\s+', ' ', 'g'), c.primary_keyword, '{TOPIC}')
      else regexp_replace(b->>'text', '\s+', ' ', 'g')
    end as normalized_text,
    cardinality(regexp_split_to_array(trim(regexp_replace(b->>'text', '\s+', ' ', 'g')), '\s+')) as word_count
  from cohort c
  cross join lateral jsonb_array_elements(coalesce(c.body_json->'blocks', '[]'::jsonb)) b
  where b->>'type' = 'paragraph'
    and length(regexp_replace(coalesce(b->>'text', ''), '\s+', ' ', 'g')) >= 120
), raw_frequency as (
  select raw_text, count(distinct slug) as page_count
  from raw_paragraphs
  group by raw_text
), normalized_frequency as (
  select normalized_text, count(distinct slug) as page_count
  from raw_paragraphs
  group by normalized_text
), stats as (
  select
    p.id,
    p.slug,
    count(*) as substantive_paragraphs,
    count(*) filter (where rf.page_count > 1) as exact_duplicate_paragraphs,
    round((count(*) filter (where rf.page_count > 1)::numeric / nullif(count(*), 0)) * 100, 1) as exact_duplicate_paragraph_pct,
    count(*) filter (where nf.page_count > 1) as normalized_duplicate_paragraphs,
    round((count(*) filter (where nf.page_count > 1)::numeric / nullif(count(*), 0)) * 100, 1) as normalized_duplicate_paragraph_pct,
    sum(p.word_count) as substantive_words,
    coalesce(sum(p.word_count) filter (where nf.page_count > 1), 0) as normalized_duplicate_words,
    round((coalesce(sum(p.word_count) filter (where nf.page_count > 1), 0)::numeric / nullif(sum(p.word_count), 0)) * 100, 1) as normalized_duplicate_word_pct
  from raw_paragraphs p
  join raw_frequency rf using (raw_text)
  join normalized_frequency nf using (normalized_text)
  group by p.id, p.slug
)
select *
from stats
where exact_duplicate_paragraph_pct >= 40
   or normalized_duplicate_paragraph_pct >= 50
   or normalized_duplicate_word_pct >= 50;

update public.content c
set robots_index = false,
    robots_follow = true,
    schema_json = coalesce(c.schema_json, '{}'::jsonb) || jsonb_build_object(
      'content_quality_hold', jsonb_build_object(
        'status', 'noindex_pending_unique_rewrite',
        'reason', 'full_v7_corpus_template_duplication',
        'detected_at', '2026-08-16',
        'policy_version', 'v7-template-dedupe-2026-08-16',
        'method', 'all published V7 care-guide/guide pages regardless robots_index; exact duplicate substantive paragraphs >=40% OR primary-keyword-normalized duplicate substantive paragraphs >=50% OR normalized duplicate substantive-paragraph words >=50%',
        'content_preserved', true,
        'canonical_preserved', true,
        'redirect_applied', false,
        'review_provenance', 'last_reviewed_at represents review by Rawafid team when no individual reviewer is recorded',
        'substantive_paragraphs', q.substantive_paragraphs,
        'exact_duplicate_paragraphs', q.exact_duplicate_paragraphs,
        'exact_duplicate_paragraph_pct', q.exact_duplicate_paragraph_pct,
        'normalized_duplicate_paragraphs', q.normalized_duplicate_paragraphs,
        'normalized_duplicate_paragraph_pct', q.normalized_duplicate_paragraph_pct,
        'substantive_words', q.substantive_words,
        'normalized_duplicate_words', q.normalized_duplicate_words,
        'normalized_duplicate_word_pct', q.normalized_duplicate_word_pct
      )
    )
from _v7_template_quality_candidates q
where c.id = q.id;

do $$
begin
  if exists (
    select 1
    from public.content c
    join _v7_template_quality_candidates q on q.id = c.id
    where c.robots_index = true or c.robots_follow = false
  ) then
    raise exception 'V7 template quality hold invariant failed';
  end if;
end
$$;

alter table public.content
  drop constraint if exists content_quality_hold_requires_noindex;

alter table public.content
  add constraint content_quality_hold_requires_noindex
  check (
    coalesce(schema_json->'content_quality_hold'->>'status', '') <> 'noindex_pending_unique_rewrite'
    or robots_index = false
  );
