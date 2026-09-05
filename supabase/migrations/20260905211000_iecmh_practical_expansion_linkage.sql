-- IECMH practical expansion linkage record
-- Applied to the production content database on 2026-09-05.
-- Editorial bodies are stored in public.content and were individually released
-- through private.content_release_gate_v6 before this repository record.
-- This file is intentionally idempotent and does not claim WAIMH, ZERO TO THREE,
-- WHO, UNICEF, HRSA, or IECMHC endorsement of Rawafid.

begin;

-- Keep the six practical expansion pages discoverable from the IECMH root and
-- the strongest secondary journeys without changing their canonical URLs or
-- primary classifications.
with mapping(content_slug, category_slug) as (values
  ('iecmh-dc05-assessment-guide','infant-early-childhood-mental-health'),
  ('iecmh-dc05-assessment-guide','iecmh-regulation-development'),

  ('iecmh-consultation-early-childhood-guide','infant-early-childhood-mental-health'),

  ('iecmh-home-visiting-family-guide','infant-early-childhood-mental-health'),
  ('iecmh-home-visiting-family-guide','iecmh-relationships-caregiving'),
  ('iecmh-home-visiting-family-guide','iecmh-caregiver-perinatal'),

  ('iecmh-father-involvement-guide','infant-early-childhood-mental-health'),
  ('iecmh-father-involvement-guide','iecmh-caregiver-perinatal'),

  ('iecmh-responsive-feeding-guide','infant-early-childhood-mental-health'),
  ('iecmh-responsive-feeding-guide','iecmh-relationships-caregiving'),

  ('iecmh-practical-family-professional-library','iecmh-relationships-caregiving'),
  ('iecmh-practical-family-professional-library','iecmh-caregiver-perinatal'),
  ('iecmh-practical-family-professional-library','iecmh-regulation-development'),
  ('iecmh-practical-family-professional-library','iecmh-trauma-medical'),
  ('iecmh-practical-family-professional-library','iecmh-practice-inclusion')
), resolved as (
  select c.id as content_id, cat.id as category_id
  from mapping m
  join public.content c on c.slug = m.content_slug
  join public.categories cat on cat.slug = m.category_slug
  where c.status = 'published'
    and c.robots_index = true
    and cat.is_active = true
    and cat.visibility = 'public'
)
insert into public.content_categories(content_id, category_id, is_primary)
select content_id, category_id, false
from resolved
on conflict(content_id, category_id) do nothing;

-- Assert that all six expansion pages remain published and attached to an IECMH journey.
do $$
declare
  v_pages integer;
  v_linked integer;
begin
  select count(*) into v_pages
  from public.content
  where slug in (
    'iecmh-dc05-assessment-guide',
    'iecmh-consultation-early-childhood-guide',
    'iecmh-home-visiting-family-guide',
    'iecmh-father-involvement-guide',
    'iecmh-responsive-feeding-guide',
    'iecmh-practical-family-professional-library'
  )
    and status = 'published'
    and robots_index = true;

  if v_pages <> 6 then
    raise exception 'IECMH practical expansion expected 6 published pages, found %', v_pages;
  end if;

  select count(distinct c.id) into v_linked
  from public.content c
  join public.content_categories cc on cc.content_id = c.id
  join public.categories cat on cat.id = cc.category_id
  where c.slug in (
    'iecmh-dc05-assessment-guide',
    'iecmh-consultation-early-childhood-guide',
    'iecmh-home-visiting-family-guide',
    'iecmh-father-involvement-guide',
    'iecmh-responsive-feeding-guide',
    'iecmh-practical-family-professional-library'
  )
    and (
      cat.slug = 'infant-early-childhood-mental-health'
      or cat.parent_id = (select id from public.categories where slug = 'infant-early-childhood-mental-health')
    );

  if v_linked <> 6 then
    raise exception 'IECMH practical expansion expected all 6 pages linked into the IECMH taxonomy, found %', v_linked;
  end if;
end $$;

commit;
