-- Rehabilitation professions expansion linkage / assertion record
-- Production editorial bodies were released through private.content_release_gate_v6.
-- This migration is idempotent and records taxonomy/source invariants only.

begin;

with role_slugs(slug) as (values
  ('physiatrist-role-rehabilitation-guide'),
  ('physical-therapy-role-rehabilitation-guide'),
  ('occupational-therapy-role-rehabilitation-guide'),
  ('speech-language-pathology-role-rehabilitation-guide'),
  ('rehabilitation-nursing-role-guide'),
  ('rehabilitation-psychology-neuropsychology-role-guide'),
  ('rehabilitation-social-work-case-management-role-guide'),
  ('prosthetics-orthotics-seating-assistive-technology-role-guide')
), resolved as (
  select c.id as content_id,cat.id as category_id
  from role_slugs r
  join public.content c on c.slug=r.slug
  join public.categories cat on cat.slug='rehabilitation-professions'
  join public.sectors s on s.id=cat.sector_id
  where s.slug='rehabilitation-functioning'
    and c.status='published'
    and c.robots_index=true
    and cat.is_active=true
    and cat.visibility='public'
)
insert into public.content_categories(content_id,category_id,is_primary)
select content_id,category_id,true from resolved
on conflict(content_id,category_id) do update set is_primary=true;

do $$
declare
  v_pages integer;
  v_linked integer;
  v_sourced integer;
  v_total integer;
begin
  select count(*) into v_pages
  from public.content
  where slug in (
    'physiatrist-role-rehabilitation-guide',
    'physical-therapy-role-rehabilitation-guide',
    'occupational-therapy-role-rehabilitation-guide',
    'speech-language-pathology-role-rehabilitation-guide',
    'rehabilitation-nursing-role-guide',
    'rehabilitation-psychology-neuropsychology-role-guide',
    'rehabilitation-social-work-case-management-role-guide',
    'prosthetics-orthotics-seating-assistive-technology-role-guide'
  )
    and status='published'
    and robots_index=true;

  if v_pages<>8 then
    raise exception 'Expected 8 rehabilitation profession role pages published/indexable, found %',v_pages;
  end if;

  select count(distinct c.id) into v_linked
  from public.content c
  join public.content_categories cc on cc.content_id=c.id and cc.is_primary=true
  join public.categories cat on cat.id=cc.category_id
  join public.sectors s on s.id=cat.sector_id
  where c.slug in (
    'physiatrist-role-rehabilitation-guide',
    'physical-therapy-role-rehabilitation-guide',
    'occupational-therapy-role-rehabilitation-guide',
    'speech-language-pathology-role-rehabilitation-guide',
    'rehabilitation-nursing-role-guide',
    'rehabilitation-psychology-neuropsychology-role-guide',
    'rehabilitation-social-work-case-management-role-guide',
    'prosthetics-orthotics-seating-assistive-technology-role-guide'
  )
    and s.slug='rehabilitation-functioning'
    and cat.slug='rehabilitation-professions';

  if v_linked<>8 then
    raise exception 'Expected all 8 role pages linked to rehabilitation-professions, found %',v_linked;
  end if;

  select count(*) into v_sourced
  from (
    select c.id
    from public.content c
    join public.content_sources cs on cs.content_id=c.id
    where c.slug in (
      'physiatrist-role-rehabilitation-guide',
      'physical-therapy-role-rehabilitation-guide',
      'occupational-therapy-role-rehabilitation-guide',
      'speech-language-pathology-role-rehabilitation-guide',
      'rehabilitation-nursing-role-guide',
      'rehabilitation-psychology-neuropsychology-role-guide',
      'rehabilitation-social-work-case-management-role-guide',
      'prosthetics-orthotics-seating-assistive-technology-role-guide'
    )
    group by c.id
    having count(*)>=5
  ) x;

  if v_sourced<>8 then
    raise exception 'Expected all 8 role pages to have >=5 central source links, found %',v_sourced;
  end if;

  select count(distinct ct.id) into v_total
  from public.content ct
  join public.content_categories cc on cc.content_id=ct.id
  join public.categories cat on cat.id=cc.category_id
  join public.sectors s on s.id=cat.sector_id
  where s.slug='rehabilitation-functioning'
    and cat.slug='rehabilitation-professions'
    and ct.status='published'
    and ct.robots_index=true;

  if v_total<>9 then
    raise exception 'Expected 9 total published/indexable profession pages after expansion, found %',v_total;
  end if;
end $$;

commit;
