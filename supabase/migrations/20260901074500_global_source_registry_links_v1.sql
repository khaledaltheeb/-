begin;

with extracted as (
  select
    c.id as content_id,
    ordinality::integer as citation_order,
    lower(regexp_replace(regexp_replace(trim(ref->>'url'), '#.*$', ''), '/+$', '')) as normalized_url
  from public.content c
  cross join lateral jsonb_array_elements(c.references_json) with ordinality as r(ref, ordinality)
  where jsonb_typeof(c.references_json)='array'
    and ref ? 'url'
    and trim(ref->>'url') ~* '^https://'
)
insert into public.content_sources (content_id, source_id, citation_order)
select e.content_id, s.id, min(e.citation_order)
from extracted e
join public.sources s on s.normalized_url = e.normalized_url
group by e.content_id, s.id
on conflict (content_id, source_id) do update set
  citation_order = least(coalesce(public.content_sources.citation_order, excluded.citation_order), excluded.citation_order),
  updated_at = now();

commit;