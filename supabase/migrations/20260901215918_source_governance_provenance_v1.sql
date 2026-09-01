begin;

create unique index if not exists source_versions_id_source_key
  on public.source_versions(id, source_id);

create table if not exists public.source_rights_profiles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  source_version_id uuid,
  metadata_access_status text not null default 'unknown' check (metadata_access_status in ('unknown','public','restricted','embargoed')),
  metadata_reuse_status text not null default 'unknown' check (metadata_reuse_status in ('unknown','allowed','conditional','prohibited')),
  metadata_license text,
  metadata_terms_url text check (metadata_terms_url is null or metadata_terms_url ~* '^https://'),
  content_access_status text not null default 'unknown' check (content_access_status in ('unknown','public','restricted','embargoed')),
  content_reuse_status text not null default 'unknown' check (content_reuse_status in ('unknown','allowed','conditional','prohibited')),
  content_license text,
  content_terms_url text check (content_terms_url is null or content_terms_url ~* '^https://'),
  rights_basis text not null default 'unknown' check (rights_basis in ('unknown','provider_terms','record_license','direct_permission','public_domain','other')),
  verified_at timestamptz,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_rights_profiles_version_source_fk
    foreign key (source_version_id, source_id)
    references public.source_versions(id, source_id)
    on delete cascade
);

create unique index if not exists source_rights_profiles_source_default_key
  on public.source_rights_profiles(source_id)
  where source_version_id is null;
create unique index if not exists source_rights_profiles_source_version_key
  on public.source_rights_profiles(source_id, source_version_id)
  where source_version_id is not null;
create index if not exists source_rights_profiles_reuse_idx
  on public.source_rights_profiles(metadata_reuse_status, content_reuse_status, verified_at desc);

create table if not exists public.source_translation_provenance (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  source_version_id uuid,
  field_path text not null check (char_length(trim(field_path)) between 1 and 200),
  source_language text check (source_language is null or char_length(trim(source_language)) between 2 and 35),
  target_language text not null check (char_length(trim(target_language)) between 2 and 35),
  translation_method text not null check (translation_method in ('human','machine','hybrid','unknown')),
  translation_tool text,
  translation_tool_version text,
  translator_display_name text,
  translator_orcid text,
  translator_affiliation_text text,
  translator_organization_id uuid references public.organizations(id) on delete set null,
  review_status text not null default 'unreviewed' check (review_status in ('unreviewed','reviewed','approved')),
  reviewer_display_name text,
  reviewer_orcid text,
  reviewer_affiliation_text text,
  reviewer_organization_id uuid references public.organizations(id) on delete set null,
  reviewed_at timestamptz,
  value_sha256 text,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_translation_version_source_fk
    foreign key (source_version_id, source_id)
    references public.source_versions(id, source_id)
    on delete cascade,
  constraint source_translation_translator_orcid_check
    check (translator_orcid is null or translator_orcid ~ '^https://orcid\.org/[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9X]{4}$'),
  constraint source_translation_reviewer_orcid_check
    check (reviewer_orcid is null or reviewer_orcid ~ '^https://orcid\.org/[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9X]{4}$'),
  constraint source_translation_value_hash_check
    check (value_sha256 is null or value_sha256 ~ '^[0-9a-f]{64}$'),
  constraint source_translation_human_attribution_check
    check (translation_method not in ('human','hybrid') or nullif(trim(translator_display_name),'') is not null),
  constraint source_translation_machine_tool_check
    check (translation_method not in ('machine','hybrid') or nullif(trim(translation_tool),'') is not null),
  constraint source_translation_review_attribution_check
    check (review_status = 'unreviewed' or (nullif(trim(reviewer_display_name),'') is not null and reviewed_at is not null))
);

create index if not exists source_translation_source_idx
  on public.source_translation_provenance(source_id, target_language, field_path);
create index if not exists source_translation_translator_org_idx
  on public.source_translation_provenance(translator_organization_id)
  where translator_organization_id is not null;
create index if not exists source_translation_reviewer_org_idx
  on public.source_translation_provenance(reviewer_organization_id)
  where reviewer_organization_id is not null;
create unique index if not exists source_translation_fingerprint_key
  on public.source_translation_provenance(source_id, coalesce(source_version_id, '00000000-0000-0000-0000-000000000000'::uuid), field_path, target_language, coalesce(value_sha256,''), translation_method);

alter table public.source_rights_profiles enable row level security;
alter table public.source_translation_provenance enable row level security;

revoke all on table public.source_rights_profiles from anon, authenticated;
revoke all on table public.source_translation_provenance from anon, authenticated;

create or replace function public.api_source_detail(p_source_id uuid)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select jsonb_build_object(
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
    'rights_note', s.rights_note,
    'language', s.language,
    'status', s.status,
    'updated_at', s.updated_at,
    'rights_profiles', coalesce((
      select jsonb_agg(jsonb_build_object(
        'source_version_id', srp.source_version_id,
        'metadata', jsonb_build_object(
          'access_status', srp.metadata_access_status,
          'reuse_status', srp.metadata_reuse_status,
          'license', srp.metadata_license,
          'terms_url', srp.metadata_terms_url
        ),
        'content', jsonb_build_object(
          'access_status', srp.content_access_status,
          'reuse_status', srp.content_reuse_status,
          'license', srp.content_license,
          'terms_url', srp.content_terms_url
        ),
        'rights_basis', srp.rights_basis,
        'verified_at', srp.verified_at
      ) order by srp.source_version_id nulls first, srp.updated_at desc)
      from public.source_rights_profiles srp
      where srp.source_id = s.id
    ), '[]'::jsonb),
    'translations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'source_version_id', stp.source_version_id,
        'field_path', stp.field_path,
        'source_language', stp.source_language,
        'target_language', stp.target_language,
        'translation_method', stp.translation_method,
        'translation_tool', stp.translation_tool,
        'translation_tool_version', stp.translation_tool_version,
        'translator', jsonb_build_object(
          'display_name', stp.translator_display_name,
          'orcid', stp.translator_orcid,
          'affiliation', stp.translator_affiliation_text,
          'ror_id', translator_org.ror_id
        ),
        'review', jsonb_build_object(
          'status', stp.review_status,
          'reviewer_display_name', stp.reviewer_display_name,
          'reviewer_orcid', stp.reviewer_orcid,
          'reviewer_affiliation', stp.reviewer_affiliation_text,
          'reviewer_ror_id', reviewer_org.ror_id,
          'reviewed_at', stp.reviewed_at
        ),
        'value_sha256', stp.value_sha256
      ) order by stp.target_language, stp.field_path, stp.updated_at desc)
      from public.source_translation_provenance stp
      left join public.organizations translator_org on translator_org.id = stp.translator_organization_id
      left join public.organizations reviewer_org on reviewer_org.id = stp.reviewer_organization_id
      where stp.source_id = s.id
    ), '[]'::jsonb),
    'related_identifiers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'identifier', sri.related_identifier,
        'identifier_type', sri.related_identifier_type,
        'relation_type', sri.relation_type,
        'relation_scheme', sri.relation_scheme,
        'related_metadata_scheme', sri.related_metadata_scheme,
        'scheme_uri', sri.scheme_uri,
        'scheme_type', sri.scheme_type,
        'verified_at', sri.verified_at
      ) order by sri.relation_type, sri.related_identifier)
      from public.source_related_identifiers sri
      where sri.source_id = s.id
    ), '[]'::jsonb),
    'contributors', coalesce((
      select jsonb_agg(jsonb_build_object(
        'display_name', sc.display_name,
        'contributor_type', sc.contributor_type,
        'position', sc.position,
        'orcid', sc.orcid,
        'verified_at', sc.verified_at,
        'affiliations', coalesce((
          select jsonb_agg(jsonb_build_object(
            'ror_id', o.ror_id,
            'display_name', o.display_name,
            'relationship', sco.relationship,
            'verified_at', sco.verified_at
          ) order by o.display_name)
          from public.source_contributor_organizations sco
          join public.organizations o on o.id = sco.organization_id
          where sco.contributor_id = sc.id
        ), '[]'::jsonb)
      ) order by sc.position nulls last, sc.display_name)
      from public.source_contributors sc
      where sc.source_id = s.id
    ), '[]'::jsonb),
    'organizations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'ror_id', o.ror_id,
        'display_name', o.display_name,
        'status', o.status,
        'domains', o.domains,
        'organization_types', o.organization_types,
        'ror_schema_version', o.ror_schema_version,
        'relationship', so.relationship,
        'resolution_method', so.resolution_method,
        'matching_type', so.matching_type,
        'match_score', so.match_score,
        'chosen', so.chosen,
        'last_verified_at', so.last_verified_at
      ) order by so.relationship, o.display_name)
      from public.source_organizations so
      join public.organizations o on o.id = so.organization_id
      where so.source_id = s.id and so.chosen = true
    ), '[]'::jsonb),
    'cited_by', coalesce((
      select jsonb_agg(jsonb_build_object(
        'content_id', c.id,
        'slug', c.slug,
        'type', c.content_type,
        'title', c.title,
        'canonical_url', c.canonical_url,
        'relationship', cs.relationship,
        'citation_order', cs.citation_order
      ) order by cs.citation_order nulls last, c.published_at desc)
      from public.content_sources cs
      join public.content c on c.id = cs.content_id
      where cs.source_id = s.id
        and c.status = 'published'
        and c.robots_index = true
        and c.published_at <= now()
    ), '[]'::jsonb),
    'versions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', sv.id,
        'version_label', sv.version_label,
        'observed_url', sv.observed_url,
        'publication_year', sv.publication_year,
        'license', sv.license,
        'retrieved_at', sv.retrieved_at,
        'valid_from', sv.valid_from,
        'valid_to', sv.valid_to
      ) order by sv.retrieved_at desc)
      from public.source_versions sv
      where sv.source_id = s.id
    ), '[]'::jsonb)
  )
  from public.sources s
  where s.id = p_source_id
    and s.status = 'active'
    and exists (
      select 1 from public.content_sources cs
      join public.content c on c.id = cs.content_id
      where cs.source_id = s.id and c.status='published' and c.robots_index=true and c.published_at <= now()
    );
$$;

revoke all on function public.api_source_detail(uuid) from public;
grant execute on function public.api_source_detail(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
commit;