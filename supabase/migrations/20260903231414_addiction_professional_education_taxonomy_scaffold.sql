begin;

with parent as (
  select id, sector_id
  from public.categories
  where slug = 'addiction-professional-education'
)
insert into public.categories (
  sector_id,
  parent_id,
  slug,
  name_ar,
  description,
  sort_order,
  is_active,
  seo_title,
  seo_description,
  visibility,
  audience,
  metadata
)
select
  p.sector_id,
  p.id,
  v.slug,
  v.name_ar,
  v.description,
  v.sort_order,
  false,
  v.seo_title,
  v.seo_description,
  'public',
  v.audience,
  jsonb_build_object(
    'page_role', v.page_role,
    'lifecycle', 'scaffold-ready',
    'activation_state', 'hold-until-content-ready',
    'planned_route', v.planned_route,
    'content_model', 'professional-competency-learning-path-v1',
    'cross_listing_policy', 'reuse-existing-canonical-pages-no-duplication'
  )
from parent p
cross join (values
  (
    'addiction-education-core-competencies',
    'الكفاءات الأساسية ومسار التعلم',
    'الإطار المرجعي للكفاءات الأساسية في رعاية اضطرابات استخدام المواد، ويجمع المعرفة والمهارات والمواقف المهنية وحدود الدور ومسار التعلم من الأساسيات إلى التطبيق.',
    10,
    'الكفاءات الأساسية في رعاية اضطرابات استخدام المواد | روافد',
    'إطار عربي للكفاءات الأساسية في رعاية اضطرابات استخدام المواد: المعرفة والمهارات والمواقف المهنية وحدود الدور ومسار التعلم متعدد التخصصات.',
    array['المختصون','الأطباء','التمريض','الصيادلة','الأخصائيون الاجتماعيون','العاملون في الصحة النفسية']::text[],
    'addiction-education-core-competencies-index',
    '/addiction/education/core-competencies/'
  ),
  (
    'addiction-education-clinical-skills',
    'مهارات التحري والتقييم والتدخل',
    'مسار تطبيقي لمهارات التعرف المبكر والتحري والتقييم وتحديد الخطورة وSBIRT والمقابلة التحفيزية والإحالة والانتقال إلى العلاج أو مستوى رعاية أعلى عند الحاجة.',
    20,
    'التحري والتقييم والتدخل في اضطرابات استخدام المواد | روافد',
    'مهارات مهنية عملية للتحري والتقييم وSBIRT والمقابلة التحفيزية وتحديد الخطورة والإحالة في رعاية اضطرابات استخدام المواد.',
    array['المختصون','الأطباء','التمريض','الصيادلة','الأخصائيون الاجتماعيون','العاملون في الصحة النفسية','مقدمو الرعاية الأولية']::text[],
    'addiction-education-clinical-skills-index',
    '/addiction/education/clinical-skills/'
  ),
  (
    'addiction-education-professional-roles',
    'الكفاءات حسب المهنة والعمل متعدد التخصصات',
    'مسار يوضح الكفاءات وحدود الصلاحية والتعاون والإحالة لكل من الطب والتمريض والصيدلة والعمل الاجتماعي والصحة النفسية والرعاية الأولية ودعم الأقران ضمن فريق متكامل.',
    30,
    'الكفاءات المهنية والعمل متعدد التخصصات في رعاية الإدمان | روافد',
    'دليل للكفاءات المهنية وحدود الدور والتعاون بين الأطباء والتمريض والصيادلة والأخصائيين الاجتماعيين والصحة النفسية ودعم الأقران في رعاية اضطرابات استخدام المواد.',
    array['المختصون','الأطباء','التمريض','الصيادلة','الأخصائيون الاجتماعيون','العاملون في الصحة النفسية','مدربو وميسرو التعافي']::text[],
    'addiction-education-professional-roles-index',
    '/addiction/education/professional-roles/'
  ),
  (
    'addiction-education-special-contexts',
    'الفئات والسياقات الخاصة',
    'مسار تدريبي لتكييف الرعاية المهنية عند الحمل وما بعد الولادة، والمراهقة، وكبار السن، والاضطرابات النفسية المصاحبة، والألم المزمن، والعنف أو الإكراه المرتبط بالمواد، وعدم استقرار السكن وغيرها.',
    40,
    'الكفاءات المهنية للفئات والسياقات الخاصة في رعاية الإدمان | روافد',
    'تكييف مهارات رعاية اضطرابات استخدام المواد للحمل والمراهقين وكبار السن والألم والمصاحبات النفسية والعنف وعدم استقرار السكن والسياقات الخاصة.',
    array['المختصون','الأطباء','التمريض','الصيادلة','الأخصائيون الاجتماعيون','العاملون في الصحة النفسية']::text[],
    'addiction-education-special-contexts-index',
    '/addiction/education/special-contexts/'
  ),
  (
    'addiction-education-ethics-communication',
    'الأخلاقيات والتواصل والوصمة',
    'مسار للكفاءات الأخلاقية والتواصلية: اللغة الخالية من الوصمة، الخصوصية والموافقة، احترام الاستقلالية، التوثيق، التواصل مع الأسرة، الحدود المهنية، والعدالة في الوصول إلى الرعاية.',
    50,
    'الأخلاقيات والتواصل والوصمة في رعاية اضطرابات استخدام المواد | روافد',
    'كفاءات أخلاقية وتواصلية لرعاية اضطرابات استخدام المواد: لغة غير وصمية، الخصوصية والموافقة والتوثيق وحدود الدور والعدالة في الوصول.',
    array['المختصون','الأطباء','التمريض','الصيادلة','الأخصائيون الاجتماعيون','العاملون في الصحة النفسية','مدربو وميسرو التعافي']::text[],
    'addiction-education-ethics-communication-index',
    '/addiction/education/ethics-communication/'
  ),
  (
    'addiction-education-evidence-implementation',
    'الأدلة والتنفيذ والتطوير المهني المستمر',
    'مسار يربط تقييم الأدلة والتحديث المستمر بالتطبيق داخل الخدمات، ويفصل بين الإرشاد السريري والبحث الناشئ والسياسات، مع أدوات للتنفيذ ومراجعة الجودة والتعلم المستمر.',
    60,
    'الأدلة والتنفيذ والتطوير المهني في رعاية الإدمان | روافد',
    'مسار مهني لتقييم الأدلة وتطبيقها في خدمات الإدمان، ومراجعة الجودة والتعلم المستمر والتمييز بين الإرشادات الراسخة والبحث الناشئ والسياسات.',
    array['المختصون','الأطباء','التمريض','الصيادلة','الأخصائيون الاجتماعيون','العاملون في الصحة النفسية','المدربون']::text[],
    'addiction-education-evidence-implementation-index',
    '/addiction/education/evidence-implementation/'
  )
) as v(slug,name_ar,description,sort_order,seo_title,seo_description,audience,page_role,planned_route)
on conflict (slug) do update set
  sector_id = excluded.sector_id,
  parent_id = excluded.parent_id,
  name_ar = excluded.name_ar,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = false,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  visibility = excluded.visibility,
  audience = excluded.audience,
  metadata = coalesce(public.categories.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

do $$
declare
  v_parent_id uuid;
  v_children integer;
  v_active_children integer;
begin
  select id into v_parent_id
  from public.categories
  where slug = 'addiction-professional-education';

  if v_parent_id is null then
    raise exception 'professional education parent scaffold missing';
  end if;

  select count(*), count(*) filter (where is_active)
    into v_children, v_active_children
  from public.categories
  where parent_id = v_parent_id
    and slug like 'addiction-education-%';

  if v_children <> 6 then
    raise exception 'professional education scaffold expected 6 child categories, found %', v_children;
  end if;

  if v_active_children <> 0 then
    raise exception 'professional education child scaffolds must remain inactive before content release';
  end if;
end $$;

commit;
