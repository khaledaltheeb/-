do $$
declare
  v_sector uuid;
  v_parent uuid;
  v_family uuid;
begin
  select id into v_sector from public.sectors where slug = 'child-family-education' and is_active = true limit 1;
  select id into v_parent from public.categories where slug = 'parenting-family' and is_active = true limit 1;

  if v_sector is null or v_parent is null then
    raise exception 'required child-family-education / parenting-family taxonomy is missing';
  end if;

  insert into public.categories (
    sector_id, parent_id, slug, name_ar, description, sort_order, is_active,
    seo_title, seo_description, visibility, audience, icon_key, metadata
  ) values (
    v_sector, v_parent, 'family-counseling', 'الإرشاد والعلاج الأسري',
    'قسم علمي منظم لفهم نظريات ومدارس الإرشاد والعلاج الأسري، المفاهيم النظامية، المبادئ المهنية والأخلاقية، التقييم، التقنيات، الإرشاد الزوجي، الأزمات والمرونة الأسرية.',
    40, true,
    'الإرشاد والعلاج الأسري | النظريات والمبادئ والتطبيقات',
    'مرجع عربي منظم في الإرشاد والعلاج الأسري يشرح النظريات والمدارس والمفاهيم النظامية والمبادئ المهنية والتقنيات والتقييم والتطبيقات الزوجية والأسرية.',
    'public', array['الأسر','المرشدون الأسريون','الأخصائيون النفسيون','طلبة الإرشاد والتربية'],
    'family', jsonb_build_object('program','family_counseling','taxonomy_version',1,'editorial_scope','systemic-relational-family-counseling','created_by','rawafid')
  )
  on conflict (slug) do update set
    sector_id = excluded.sector_id,
    parent_id = excluded.parent_id,
    name_ar = excluded.name_ar,
    description = excluded.description,
    sort_order = excluded.sort_order,
    is_active = true,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    visibility = 'public',
    audience = excluded.audience,
    icon_key = excluded.icon_key,
    metadata = public.categories.metadata || excluded.metadata,
    updated_at = now()
  returning id into v_family;

  insert into public.categories (
    sector_id, parent_id, slug, name_ar, description, sort_order, is_active,
    seo_title, seo_description, visibility, audience, icon_key, metadata
  ) values
    (v_sector,v_family,'family-counseling-theories','النظريات والمدارس العلاجية','النظريات والنماذج الكبرى التي تفسر عمل الأسرة والعلاقات وتوجه التقييم والتدخل، مع توضيح الفروق والحدود والأدلة لكل نموذج.',10,true,'نظريات ومدارس الإرشاد والعلاج الأسري','مدخل منظم إلى أهم نظريات ومدارس العلاج الأسري: بوين، البنيوي، الاستراتيجي، المرتكز على الحل، السردي، السياقي، المعرفي السلوكي وغيرها.','public',array['المرشدون الأسريون','الأخصائيون','الطلبة','الأسر'],'theory',jsonb_build_object('program','family_counseling','group','theories')),
    (v_sector,v_family,'family-counseling-principles','المبادئ المهنية والأخلاقية','مبادئ الاستقلالية والموافقة والسرية والحياد متعدد الأطراف وحدود دور المرشد ومتى يكون التدخل أو عدم التدخل مناسبًا وآمنًا.',20,true,'مبادئ وأخلاقيات الإرشاد والعلاج الأسري','مبادئ الممارسة المهنية في الإرشاد الأسري: استقلالية القرار، الموافقة المستنيرة، السرية، الحياد متعدد الأطراف، الحدود والإحالة والسلامة.','public',array['المرشدون الأسريون','الأخصائيون','الطلبة','الأسر'],'ethics',jsonb_build_object('program','family_counseling','group','principles')),
    (v_sector,v_family,'family-systems-concepts','مفاهيم النظم الأسرية','مفاهيم تساعد على قراءة الأسرة كنظام مترابط، مثل التثليث والتمايز والحدود والتحالفات والقطع العاطفي والاستتباب والانتقال عبر الأجيال.',30,true,'مفاهيم النظم الأسرية | التثليث والحدود والتمايز','شرح علمي للمفاهيم النظامية في الأسرة مثل التثليث والتمايز والحدود والتحالفات والقطع العاطفي والاستتباب والأنماط العابرة للأجيال.','public',array['المرشدون الأسريون','الأخصائيون','الطلبة','الأسر'],'systems',jsonb_build_object('program','family_counseling','group','systems_concepts')),
    (v_sector,v_family,'family-counseling-techniques','تقنيات ومهارات الإرشاد الأسري','تقنيات العمل داخل الجلسة وخارجها، ومنها الأسئلة الدائرية وإعادة التأطير والإنجاز داخل الجلسة والخريطة الأسرية وصياغة الأهداف والواجبات المنزلية.',40,true,'تقنيات ومهارات الإرشاد والعلاج الأسري','تقنيات ومهارات عملية للإرشاد والعلاج الأسري مع شرح الهدف وآلية الاستخدام والقيود والأخطاء الشائعة لكل تقنية.','public',array['المرشدون الأسريون','الأخصائيون','الطلبة'],'tools',jsonb_build_object('program','family_counseling','group','techniques')),
    (v_sector,v_family,'family-assessment-formulation','تقييم الأسرة وصياغة الحالة','أطر تقييم بنية الأسرة وعلاقاتها ودورة حياتها ونقاط القوة وعوامل الخطورة والحماية، وتحويل المعلومات إلى صياغة حالة وخطة أهداف قابلة للمراجعة.',50,true,'تقييم الأسرة وصياغة الحالة في الإرشاد الأسري','أدلة عملية لتقييم الأسرة وصياغة الحالة: التاريخ الأسري، الخريطة الأسرية، الأنماط التفاعلية، نقاط القوة، عوامل الخطورة والحماية والأهداف.','public',array['المرشدون الأسريون','الأخصائيون','الطلبة'],'assessment',jsonb_build_object('program','family_counseling','group','assessment')),
    (v_sector,v_family,'marital-counseling','الإرشاد والعلاج الزوجي','موضوعات العلاقة الزوجية من التواصل والصراع والإصلاح والثقة والتعلق واتخاذ القرار إلى نماذج العلاج الزوجي وحدود الإرشاد في حالات العنف والخطر.',60,true,'الإرشاد والعلاج الزوجي | التواصل والصراع والعلاقة','قسم متخصص في الإرشاد والعلاج الزوجي يشرح التواصل والصراع والتعلق والثقة والإصلاح واتخاذ القرار والنماذج العلاجية وحدود السلامة.','public',array['الأزواج','المرشدون الأسريون','الأخصائيون','الطلبة'],'couples',jsonb_build_object('program','family_counseling','group','couples')),
    (v_sector,v_family,'family-crisis-safety','الأزمات والسلامة الأسرية','التعامل المهني مع الأزمات الأسرية والانفصال والفقد والمرض والعنف والإساءة والخطر، مع التمييز بين الإرشاد والحالات التي تتطلب حماية أو إحالة متخصصة.',70,true,'الأزمات والسلامة في الإرشاد الأسري','إرشاد علمي حول الأزمات الأسرية والسلامة والعنف والإساءة والانفصال والفقد ومتى تتقدم الحماية والإحالة على العمل الإرشادي المعتاد.','public',array['الأسر','المرشدون الأسريون','الأخصائيون'],'safety',jsonb_build_object('program','family_counseling','group','crisis_safety')),
    (v_sector,v_family,'family-resilience-life-cycle','المرونة ودورة حياة الأسرة','كيف تتغير احتياجات الأسرة عبر مراحلها، وكيف تتعامل مع الانتقالات والضغوط والفقد والتغير وتبني عوامل الحماية والمرونة والوقاية.',80,true,'المرونة الأسرية ودورة حياة الأسرة','مرجع حول دورة حياة الأسرة والانتقالات والضغط والتكيف والمرونة وعوامل الحماية والوقاية ودعم الأسرة عبر المراحل المختلفة.','public',array['الأسر','المرشدون الأسريون','الأخصائيون','الطلبة'],'resilience',jsonb_build_object('program','family_counseling','group','resilience'))
  on conflict (slug) do update set
    sector_id = excluded.sector_id,
    parent_id = excluded.parent_id,
    name_ar = excluded.name_ar,
    description = excluded.description,
    sort_order = excluded.sort_order,
    is_active = true,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    visibility = 'public',
    audience = excluded.audience,
    icon_key = excluded.icon_key,
    metadata = public.categories.metadata || excluded.metadata,
    updated_at = now();
end $$;
