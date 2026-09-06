-- Jordan and MENA rehabilitation expansion linkage / assertion record
-- Editorial bodies were released through private.content_release_gate_v6.
-- This migration is idempotent and records taxonomy/source invariants only.

begin;

with wave_slugs(slug) as (values
  ('jordan-rehabilitation-services-access-guide'),
  ('jordan-assistive-technology-access-guide'),
  ('jordan-rehabilitation-discharge-continuity-guide'),
  ('mena-rehabilitation-system-strengthening-guide')
), resolved as (
  select c.id as content_id,cat.id as category_id
  from wave_slugs w
  join public.content c on c.slug=w.slug
  join public.categories cat on cat.slug='rehabilitation-mena-jordan'
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
    'jordan-rehabilitation-services-access-guide',
    'jordan-assistive-technology-access-guide',
    'jordan-rehabilitation-discharge-continuity-guide',
    'mena-rehabilitation-system-strengthening-guide'
  )
    and status='published'
    and robots_index=true;

  if v_pages<>4 then
    raise exception 'Expected 4 Jordan/MENA rehabilitation pages published/indexable, found %',v_pages;
  end if;

  select count(distinct c.id) into v_linked
  from public.content c
  join public.content_categories cc on cc.content_id=c.id and cc.is_primary=true
  join public.categories cat on cat.id=cc.category_id
  join public.sectors s on s.id=cat.sector_id
  where c.slug in (
    'jordan-rehabilitation-services-access-guide',
    'jordan-assistive-technology-access-guide',
    'jordan-rehabilitation-discharge-continuity-guide',
    'mena-rehabilitation-system-strengthening-guide'
  )
    and s.slug='rehabilitation-functioning'
    and cat.slug='rehabilitation-mena-jordan';

  if v_linked<>4 then
    raise exception 'Expected all 4 Jordan/MENA pages linked to rehabilitation-mena-jordan, found %',v_linked;
  end if;

  select count(*) into v_sourced
  from (
    select c.id
    from public.content c
    join public.content_sources cs on cs.content_id=c.id
    where c.slug in (
      'jordan-rehabilitation-services-access-guide',
      'jordan-assistive-technology-access-guide',
      'jordan-rehabilitation-discharge-continuity-guide',
      'mena-rehabilitation-system-strengthening-guide'
    )
    group by c.id
    having count(*)>=5
  ) x;

  if v_sourced<>4 then
    raise exception 'Expected all 4 Jordan/MENA pages to have >=5 central source links, found %',v_sourced;
  end if;

  select count(distinct ct.id) into v_total
  from public.content ct
  join public.content_categories cc on cc.content_id=ct.id
  join public.categories cat on cat.id=cc.category_id
  join public.sectors s on s.id=cat.sector_id
  where s.slug='rehabilitation-functioning'
    and cat.slug='rehabilitation-mena-jordan'
    and ct.status='published'
    and ct.robots_index=true;

  if v_total<>4 then
    raise exception 'Expected 4 total published/indexable Jordan/MENA pages after expansion, found %',v_total;
  end if;
end $$;

commit;
