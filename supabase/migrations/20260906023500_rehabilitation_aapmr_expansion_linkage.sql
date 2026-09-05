-- Rehabilitation evidence expansion linkage / assertion record
-- Applied to the production content database on 2026-09-06.
-- Editorial bodies are stored in public.content and were individually released
-- through private.content_release_gate_v6 before this repository record.
-- This migration is intentionally idempotent and does not claim endorsement by
-- AAPM&R, AHA, AACVPR, ATS, NICE, WHO, ASIA, PVA, SCIRE, Cochrane, ACR, OARSI,
-- Canadian Stroke Best Practices, VA/DoD, GOLD, or any other cited organization.

begin;

with mapping(content_slug, category_slug) as (values
  ('stroke-rehabilitation-guide','neurological-rehabilitation'),
  ('traumatic-brain-injury-rehabilitation-guide','neurological-rehabilitation'),
  ('spinal-cord-injury-rehabilitation-guide','neurological-rehabilitation'),
  ('multiple-sclerosis-rehabilitation-guide','neurological-rehabilitation'),
  ('spasticity-rehabilitation-management-guide','neurological-rehabilitation'),
  ('cardiac-rehabilitation-guide','cardiopulmonary-rehabilitation'),
  ('copd-pulmonary-rehabilitation-guide','cardiopulmonary-rehabilitation'),
  ('knee-osteoarthritis-rehabilitation-guide','musculoskeletal-rehabilitation')
), resolved as (
  select c.id as content_id, cat.id as category_id
  from mapping m
  join public.content c on c.slug = m.content_slug
  join public.categories cat on cat.slug = m.category_slug
  join public.sectors s on s.id = cat.sector_id
  where c.status = 'published'
    and c.robots_index = true
    and cat.is_active = true
    and cat.visibility = 'public'
    and s.slug = 'rehabilitation-functioning'
)
insert into public.content_categories(content_id, category_id, is_primary)
select content_id, category_id, true
from resolved
on conflict(content_id, category_id) do update set is_primary = true;

do $$
declare
  v_pages integer;
  v_linked integer;
  v_sourced integer;
begin
  select count(*) into v_pages
  from public.content
  where slug in (
    'stroke-rehabilitation-guide',
    'traumatic-brain-injury-rehabilitation-guide',
    'spinal-cord-injury-rehabilitation-guide',
    'multiple-sclerosis-rehabilitation-guide',
    'spasticity-rehabilitation-management-guide',
    'cardiac-rehabilitation-guide',
    'copd-pulmonary-rehabilitation-guide',
    'knee-osteoarthritis-rehabilitation-guide'
  )
    and status = 'published'
    and robots_index = true;

  if v_pages <> 8 then
    raise exception 'Rehabilitation AAPM&R expansion expected 8 published/indexable pages, found %', v_pages;
  end if;

  with mapping(content_slug, category_slug) as (values
    ('stroke-rehabilitation-guide','neurological-rehabilitation'),
    ('traumatic-brain-injury-rehabilitation-guide','neurological-rehabilitation'),
    ('spinal-cord-injury-rehabilitation-guide','neurological-rehabilitation'),
    ('multiple-sclerosis-rehabilitation-guide','neurological-rehabilitation'),
    ('spasticity-rehabilitation-management-guide','neurological-rehabilitation'),
    ('cardiac-rehabilitation-guide','cardiopulmonary-rehabilitation'),
    ('copd-pulmonary-rehabilitation-guide','cardiopulmonary-rehabilitation'),
    ('knee-osteoarthritis-rehabilitation-guide','musculoskeletal-rehabilitation')
  )
  select count(distinct c.id) into v_linked
  from mapping m
  join public.content c on c.slug = m.content_slug
  join public.content_categories cc on cc.content_id = c.id
  join public.categories cat on cat.id = cc.category_id and cat.slug = m.category_slug
  join public.sectors s on s.id = cat.sector_id
  where s.slug = 'rehabilitation-functioning'
    and cc.is_primary = true;

  if v_linked <> 8 then
    raise exception 'Rehabilitation AAPM&R expansion expected all 8 pages linked to intended primary categories, found %', v_linked;
  end if;

  select count(*) into v_sourced
  from (
    select c.id
    from public.content c
    join public.content_sources cs on cs.content_id = c.id
    where c.slug in (
      'stroke-rehabilitation-guide',
      'traumatic-brain-injury-rehabilitation-guide',
      'spinal-cord-injury-rehabilitation-guide',
      'multiple-sclerosis-rehabilitation-guide',
      'spasticity-rehabilitation-management-guide',
      'cardiac-rehabilitation-guide',
      'copd-pulmonary-rehabilitation-guide',
      'knee-osteoarthritis-rehabilitation-guide'
    )
    group by c.id
    having count(*) >= 5
  ) sourced_pages;

  if v_sourced <> 8 then
    raise exception 'Rehabilitation AAPM&R expansion expected all 8 pages to have at least 5 source-registry links, found %', v_sourced;
  end if;
end $$;

commit;
