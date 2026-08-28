-- Short encyclopedia v2: two root sections, scalable for additional sections later.
-- This migration does not duplicate content or change existing canonical URLs.
-- Existing published pages are cross-listed through content_categories while their
-- original sector/category remains primary.

update public.sectors
set
  description = 'موسوعة عربية مختصرة دقيقة ومنظمة تبدأ بقسمين مستقلين: مصطلحات علم النفس، واحتياجات خاصة وتربية دامجة. تُبنى الصفحات حول مصطلح أو حالة أو اضطراب أو متلازمة بنية موجزة مكتملة دون حشو، مع قابلية إضافة أقسام أخرى مستقبلًا.',
  seo_title = 'الموسوعة المختصرة: مصطلحات علم النفس والاحتياجات الخاصة | روافد',
  seo_description = 'موسوعة عربية مختصرة للمصطلحات النفسية والحالات والمتلازمات وموضوعات الاحتياجات الخاصة والتربية الدامجة، بتعريف وشرح وأعراض وأسباب ونصائح وأسئلة شائعة موثقة.',
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'architecture_version', 2,
    'minimum_root_sections', 2,
    'allow_future_sections', true,
    'quality_over_word_count', true,
    'minimum_word_count_enforced', false,
    'required_page_fields', jsonb_build_array(
      'term_ar','term_en','definition','explanation','symptoms','causes','advice','faq','sources'
    ),
    'seo_policy', 'expanded-entity-intent-schema-internal-linking-canonical-deduplication',
    'publication_policy', 'publish-only-after-scientific-editorial-seo-deduplication-validation'
  ),
  updated_at = now()
where slug = 'short-encyclopedia';

with sector as (
  select id from public.sectors where slug = 'short-encyclopedia'
)
insert into public.categories (
  sector_id, parent_id, slug, name_ar, description, sort_order, is_active,
  seo_title, seo_description, visibility, audience, icon_key, metadata
)
select
  sector.id,
  null,
  'short-encyclopedia-psychology-terms',
  'مصطلحات علم النفس',
  'مرجع مختصر ودقيق لمصطلحات علم النفس والاضطرابات والحالات والمتلازمات المرتبطة به. لكل صفحة اسم عربي وإنجليزي وتعريف وشرح وأعراض وأسباب ونصائح عملية وأسئلة وأجوبة ومصادر موثوقة، مع أولوية للدقة والقيمة على طول النص.',
  10,
  true,
  'مصطلحات علم النفس: الحالات والاضطرابات والمتلازمات | روافد',
  'دليل عربي لمصطلحات علم النفس والحالات والاضطرابات والمتلازمات: التعريف، المصطلح الإنجليزي، الشرح، الأعراض، الأسباب، النصائح، الأسئلة الشائعة والمراجع.',
  'public',
  array['الجمهور','الطلاب','الأسر','المختصون']::text[],
  'brain',
  jsonb_build_object(
    'collection_key','psychology_terms',
    'content_scope',jsonb_build_array(
      'psychology_terms','mental_health_conditions','psychological_disorders',
      'psychological_syndromes','psychological_states','psychological_concepts'
    ),
    'required_page_fields',jsonb_build_array(
      'term_ar','term_en','definition','explanation','symptoms','causes','advice','faq','sources'
    ),
    'minimum_word_count_enforced',false,
    'quality_gate',jsonb_build_array(
      'scientific_accuracy','source_verification','search_intent','no_filler',
      'no_duplicate_page','clear_arabic','seo_complete'
    ),
    'target_pages_per_hour',50,
    'agent_parallel_group','short_encyclopedia_hourly'
  )
from sector
on conflict (slug) do update
set
  sector_id = excluded.sector_id,
  parent_id = null,
  name_ar = excluded.name_ar,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  visibility = 'public',
  audience = excluded.audience,
  icon_key = excluded.icon_key,
  metadata = coalesce(public.categories.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

with sector as (
  select id from public.sectors where slug = 'short-encyclopedia'
)
insert into public.categories (
  sector_id, parent_id, slug, name_ar, description, sort_order, is_active,
  seo_title, seo_description, visibility, audience, icon_key, metadata
)
select
  sector.id,
  null,
  'short-encyclopedia-special-needs-inclusive-education',
  'احتياجات خاصة وتربية دامجة',
  'مرجع مختصر ودقيق للحالات والمتلازمات والاختلافات النمائية وصعوبات التعلم والاحتياجات التعليمية والدعم والتربية الدامجة. تُشرح الموضوعات بلغة واضحة ومحترمة ومبنية على الدليل دون حشو أو تعميم.',
  20,
  true,
  'احتياجات خاصة وتربية دامجة: حالات ومتلازمات ومصطلحات | روافد',
  'موسوعة عربية مختصرة للاحتياجات الخاصة والتربية الدامجة: حالات ومتلازمات ونمو وتعلم ودعم، مع تعريف وشرح وأعراض أو سمات وأسباب ونصائح وأسئلة شائعة ومراجع.',
  'public',
  array['الجمهور','الطلاب','الأسر','المعلمون','المختصون']::text[],
  'accessibility',
  jsonb_build_object(
    'collection_key','special_needs_inclusive_education',
    'public_label_policy','use_special_needs_and_inclusive_education',
    'content_scope',jsonb_build_array(
      'developmental_conditions','syndromes','learning_differences','special_education',
      'inclusive_education','communication','sensory_needs','motor_needs','support_and_accommodations'
    ),
    'required_page_fields',jsonb_build_array(
      'term_ar','term_en','definition','explanation','symptoms_or_features','causes','advice','faq','sources'
    ),
    'minimum_word_count_enforced',false,
    'quality_gate',jsonb_build_array(
      'scientific_accuracy','source_verification','respectful_language','search_intent',
      'no_filler','no_duplicate_page','clear_arabic','seo_complete'
    ),
    'target_pages_per_hour',50,
    'agent_parallel_group','short_encyclopedia_hourly'
  )
from sector
on conflict (slug) do update
set
  sector_id = excluded.sector_id,
  parent_id = null,
  name_ar = excluded.name_ar,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  visibility = 'public',
  audience = excluded.audience,
  icon_key = excluded.icon_key,
  metadata = coalesce(public.categories.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

-- Cross-list the already-published psychology encyclopedia content without
-- changing its primary taxonomy or canonical URL.
with target as (
  select id from public.categories where slug = 'short-encyclopedia-psychology-terms'
), source as (
  select c.id
  from public.content c
  join public.sectors s on s.id = c.sector_id
  where s.slug = 'mental-health'
    and c.content_type in ('glossary_term','condition')
    and c.status = 'published'
    and c.published_at <= now()
    and c.robots_index = true
)
insert into public.content_categories(content_id, category_id, is_primary)
select source.id, target.id, false
from source cross join target
on conflict (content_id, category_id) do nothing;

-- Cross-list the already-published special-needs/inclusive-education
-- encyclopedia content without changing its primary taxonomy or canonical URL.
with target as (
  select id from public.categories where slug = 'short-encyclopedia-special-needs-inclusive-education'
), source as (
  select c.id
  from public.content c
  join public.sectors s on s.id = c.sector_id
  where s.slug = 'special-needs-inclusion'
    and c.content_type in ('glossary_term','condition')
    and c.status = 'published'
    and c.published_at <= now()
    and c.robots_index = true
)
insert into public.content_categories(content_id, category_id, is_primary)
select source.id, target.id, false
from source cross join target
on conflict (content_id, category_id) do nothing;
