begin;

-- Expand the addiction sector into explicit reference journeys without changing
-- canonical URLs or primary classifications of already-published content.
with sector as (
  select id
  from public.sectors
  where slug = 'addiction-recovery'
)
insert into public.categories (
  sector_id, slug, name_ar, description, sort_order, is_active,
  seo_title, seo_description, visibility, audience, metadata
)
select
  sector.id,
  v.slug,
  v.name_ar,
  v.description,
  v.sort_order,
  true,
  v.seo_title,
  v.seo_description,
  'public',
  array['الشخص المتأثر بالإدمان','الأسرة','المدربون وميسرو الأقران','المجتمع والمؤسسات','المختصون']::text[],
  jsonb_build_object(
    'page_role', v.page_role,
    'content_model', 'v3-cross-listed-reference-category',
    'reference_expansion', '2026-08-28',
    'cross_listing_policy', 'canonical-preserved'
  )
from sector
cross join (values
  (
    'addiction-treatment-care',
    'العلاج واختيار مستوى الرعاية',
    'مسار مرجعي يربط التقييم بخيارات العلاج الدوائي والنفسي والسلوكي، اختيار مستوى الرعاية، تقييم مقدم الخدمة، استمرارية العلاج وقياس النتائج دون وصفة فردية عبر الإنترنت.',
    12,
    'علاج الإدمان واختيار الرعاية | روافد',
    'دليل عربي لعلاج اضطرابات استخدام المواد: التقييم، اختيار مستوى الرعاية، الأدوية عند وجود دليل، العلاج النفسي، جودة مقدم الخدمة واستمرارية التعافي.',
    'addiction-treatment-reference-index'
  ),
  (
    'addiction-harm-reduction',
    'خفض الضرر والجرعة الزائدة والسلامة',
    'مسار للصحة العامة يشرح خفض الوفيات والإصابات والعدوى والجرعات الزائدة والربط بالعلاج، مع فصل واضح بين خفض الضرر وبين تشجيع الاستخدام أو استبدال العلاج.',
    18,
    'خفض الضرر والجرعة الزائدة | روافد',
    'مرجع عربي لخفض الضرر في اضطرابات استخدام المواد: الوقاية من الجرعة الزائدة، العدوى، الربط بالعلاج، الاستمرارية والحقوق ضمن نهج صحة عامة قائم على الدليل.',
    'addiction-harm-reduction-index'
  ),
  (
    'addiction-prevention-early-intervention',
    'الوقاية والتدخل المبكر',
    'مسار يميز الوقاية الفعالة عن التخويف العام، ويغطي الأسرة والمدرسة والمجتمع والسياسات وعوامل الخطر والحماية والتدخل المبكر عندما يبدأ الضرر الوظيفي بالظهور.',
    22,
    'الوقاية من الإدمان والتدخل المبكر | روافد',
    'مرجع عربي للوقاية من الإدمان والتدخل المبكر عبر الأسرة والمدرسة والمجتمع والسياسات، مع عوامل الحماية والخطر ومداخل قائمة على الدليل بدل التخويف والوصم.',
    'addiction-prevention-index'
  ),
  (
    'addiction-special-populations',
    'الفئات والاحتياجات الخاصة',
    'مسار يجمع تكييف التقييم والعلاج والتعافي وفق العمر والحمل والحالات الطبية والسكن والعدالة والإعاقة والموارد المحدودة، دون افتراض أن نموذج رعاية واحد يناسب الجميع.',
    24,
    'الإدمان لدى الفئات ذات الاحتياجات الخاصة | روافد',
    'دليل عربي لتكييف رعاية الإدمان للمراهقين وكبار السن والحمل والحالات الطبية وعدم استقرار السكن والاحتياجات الخاصة والسياقات محدودة الموارد.',
    'addiction-special-populations-index'
  ),
  (
    'addiction-community-systems',
    'المجتمع والخدمات ودعم الأقران',
    'مسار للمؤسسات والمجتمع يربط الرعاية الأولية والخدمات المتخصصة ودعم الأقران والعمل والتعليم والإحالة والحد من الوصمة وبناء نظام استمرارية رعاية قابل للقياس.',
    23,
    'منظومات الإدمان ودعم الأقران | روافد',
    'مرجع عربي لبناء خدمات الإدمان المجتمعية: الإحالة، الرعاية الأولية، دعم الأقران، العمل والتعليم، خفض الوصمة واستمرارية الرعاية وقياس الوصول والنتائج.',
    'addiction-community-systems-index'
  )
) as v(slug,name_ar,description,sort_order,seo_title,seo_description,page_role)
on conflict (slug) do update set
  sector_id = excluded.sector_id,
  name_ar = excluded.name_ar,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  visibility = excluded.visibility,
  audience = excluded.audience,
  metadata = public.categories.metadata || excluded.metadata,
  updated_at = now();

update public.sectors
set
  description = 'مرجع عربي متكامل قائم على الدليل حول اضطرابات استخدام المواد والسلوكيات الإدمانية: الطوارئ والانسحاب، التقييم، العلاج، خفض الضرر، التعافي، الأسرة، الوقاية، الفئات الخاصة ومنظومات الرعاية.',
  seo_title = 'الإدمان والتعافي: مرجع عربي شامل | روافد',
  seo_description = 'مرجع عربي شامل للإدمان والتعافي: الأنواع والانسحاب والتقييم والعلاج وخفض الضرر والوقاية والأسرة والفئات الخاصة والتعافي المستمر، بمصادر قابلة للتتبع.',
  metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
    'reference_model', 'decision-to-recovery-continuum-v1',
    'reference_expansion', '2026-08-28',
    'seo_keywords', jsonb_build_array(
      'الإدمان','علاج الإدمان','التعافي من الإدمان','اضطرابات استخدام المواد',
      'أعراض الانسحاب','خفض الضرر','الوقاية من الإدمان','منع الانتكاس','دعم الأسرة'
    ),
    'semantic_terms', jsonb_build_array(
      'الجرعة الزائدة','التقييم','مستوى الرعاية','العلاج الدوائي','العلاج النفسي',
      'دعم الأقران','التدخل المبكر','الصحة النفسية المصاحبة','استمرارية الرعاية','رأس مال التعافي'
    )
  ),
  updated_at = now()
where slug = 'addiction-recovery';

-- Cross-list existing authoritative pages into the new journeys. This does not
-- mutate the content's primary category or canonical route.
with mapping(category_slug, content_slug) as (values
  ('addiction-treatment-care','legacy-addiction-protocol-atlas'),
  ('addiction-treatment-care','care-guide-addiction-treatment-first-appointment'),
  ('addiction-treatment-care','legacy-addiction-tools-treatment-provider-checklist'),
  ('addiction-treatment-care','care-guide-evaluate-addiction-treatment-claims'),
  ('addiction-treatment-care','care-guide-addiction-treatment-outcomes-review'),
  ('addiction-treatment-care','legacy-addiction-audiences-clinician'),
  ('addiction-treatment-care','legacy-hub-path-027'),

  ('addiction-harm-reduction','care-guide-opioid-overdose-prevention-response'),
  ('addiction-harm-reduction','polysubstance-use-overdose-risk'),
  ('addiction-harm-reduction','legacy-addiction-populations-injection-related-infections-integrated-care'),
  ('addiction-harm-reduction','legacy-addiction-audiences-community'),
  ('addiction-harm-reduction','legacy-addiction-family-guides-post-overdose-discharge-support'),

  ('addiction-prevention-early-intervention','legacy-sector-youth-guides-substance-use-early-support'),
  ('addiction-prevention-early-intervention','concept-1071'),
  ('addiction-prevention-early-intervention','legacy-hub-path-030'),
  ('addiction-prevention-early-intervention','legacy-addiction-tools-medication-household-safety-inventory'),

  ('addiction-special-populations','legacy-addiction-populations'),
  ('addiction-special-populations','legacy-addiction-populations-adolescents-young-adults'),
  ('addiction-special-populations','legacy-addiction-populations-older-adults'),
  ('addiction-special-populations','legacy-addiction-populations-pregnancy-postpartum'),
  ('addiction-special-populations','legacy-addiction-populations-homelessness-housing-instability'),
  ('addiction-special-populations','legacy-addiction-populations-complex-medical-conditions'),
  ('addiction-special-populations','legacy-addiction-populations-injection-related-infections-integrated-care'),

  ('addiction-community-systems','legacy-addiction-audiences-community'),
  ('addiction-community-systems','legacy-addiction-audiences-trainer'),
  ('addiction-community-systems','concept-1078'),
  ('addiction-community-systems','concept-1079'),
  ('addiction-community-systems','legacy-addiction-tools-treatment-provider-checklist')
), resolved as (
  select c.id as category_id, x.id as content_id
  from mapping m
  join public.categories c on c.slug = m.category_slug
  join public.content x on x.slug = m.content_slug
  join public.sectors s on s.id = c.sector_id and s.slug = 'addiction-recovery'
  where x.status = 'published'
    and x.robots_index = true
    and x.published_at <= now()
)
insert into public.content_categories (content_id, category_id, is_primary)
select content_id, category_id, false
from resolved
on conflict (content_id, category_id) do nothing;

do $$
declare
  v_category_count integer;
  v_cross_list_count integer;
begin
  select count(*) into v_category_count
  from public.categories c
  join public.sectors s on s.id = c.sector_id
  where s.slug = 'addiction-recovery'
    and c.is_active = true
    and c.visibility = 'public';

  if v_category_count < 10 then
    raise exception 'addiction reference taxonomy expected at least 10 public categories, found %', v_category_count;
  end if;

  select count(*) into v_cross_list_count
  from public.content_categories cc
  join public.categories c on c.id = cc.category_id
  where c.slug in (
    'addiction-treatment-care','addiction-harm-reduction',
    'addiction-prevention-early-intervention','addiction-special-populations',
    'addiction-community-systems'
  );

  if v_cross_list_count < 20 then
    raise exception 'addiction reference taxonomy cross-listing unexpectedly sparse: %', v_cross_list_count;
  end if;
end $$;

commit;
