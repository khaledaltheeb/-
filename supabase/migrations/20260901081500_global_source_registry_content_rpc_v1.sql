begin;

create or replace function public.api_content_sources(p_slug text)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select jsonb_build_object(
    'content', jsonb_build_object(
      'id', c.id,
      'type', c.content_type,
      'slug', c.slug,
      'title', c.title,
      'canonical_url', c.canonical_url,
      'updated_at', c.updated_at
    ),
    'sources', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id,
        'canonical_url', s.canonical_url,
        'title', s.title,
        'publisher', s.publisher,
        'source_type', s.source_type,
        'authority_tier', s.authority_tier,
        'publication_year', s.publication_year,
        'doi', s.doi,
        'pmid', s.pmid,
        'license', s.license,
        'status', s.status,
        'relationship', cs.relationship,
        'citation_order', cs.citation_order,
        'citation_label', cs.citation_label,
        'attribution_text', cs.attribution_text,
        'note', cs.note
      ) order by cs.citation_order nulls last, s.title nulls last, s.id)
      from public.content_sources cs
      join public.sources s on s.id=cs.source_id
      where cs.content_id=c.id and s.status='active'
    ), '[]'::jsonb)
  )
  from public.content c
  where c.slug=p_slug
    and c.status='published'
    and c.robots_index=true
    and c.published_at <= now();
$$;

grant execute on function public.api_content_sources(text) to anon, authenticated;

commit;