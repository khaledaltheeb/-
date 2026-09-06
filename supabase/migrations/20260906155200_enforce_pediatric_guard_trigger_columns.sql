-- The quality guard previously did not fire when medical_disclaimer, content_type,
-- or slug changed by themselves. Include every release-critical field checked by the
-- guard or included in the pediatric release token.

drop trigger if exists zzzz_pediatric_oncology_quality_release_guard on public.content;

create trigger zzzz_pediatric_oncology_quality_release_guard
before insert or update of
  status,
  content_type,
  slug,
  robots_index,
  title,
  excerpt,
  body_text,
  body_json,
  seo_title,
  seo_description,
  canonical_url,
  references_json,
  primary_keyword,
  secondary_keywords,
  semantic_terms,
  search_intent,
  sector_id,
  category_id,
  schema_json,
  medical_disclaimer,
  reviewer_display_name,
  reviewer_credentials,
  last_reviewed_at,
  author_display_name
on public.content
for each row
execute function private.pediatric_oncology_quality_release_guard();
