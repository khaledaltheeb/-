-- Rawafid search-demand taxonomy expansion.
-- Adds precise editorial destinations required by the Arabic mental-health,
-- special-needs and inclusive-education search map. No content is published here.

with proposed(slug,name_ar,sector_slug,description,sort_order) as (
  values
    ('anxiety-disorders','اضطرابات القلق','mental-health','القلق المعمم والهلع والقلق الاجتماعي والرهاب والأعراض المرتبطة بها، مع التفريق بين القلق الطبيعي والاضطراب.',20),
    ('ocd-related','الوسواس القهري والاضطرابات المرتبطة','mental-health','الوسواس القهري والأفكار الاقتحامية والطقوس والموضوعات المرتبطة به، مع التقييم والعلاج والفروق التشخيصية.',30),
    ('trauma-stressor','الصدمة والاضطرابات المرتبطة بالضغوط','mental-health','الصدمة النفسية واضطراب ما بعد الصدمة واضطرابات التكيف والآثار المرتبطة بالأحداث الشديدة والفقد.',40),
    ('bipolar-related','ثنائي القطب واضطرابات المزاج المرتبطة','mental-health','الاضطراب ثنائي القطب والهوس والهوس الخفيف والاكتئاب ثنائي القطب ومتابعة النوبات والتعافي.',50),
    ('psychotic-disorders','الذهان واضطرابات طيف الفصام','mental-health','الذهان والفصام والاضطرابات الذهانية والهلاوس والضلالات والتشخيص التفريقي والرعاية المستمرة.',60),
    ('personality-disorders','اضطرابات الشخصية','mental-health','اضطرابات الشخصية وسماتها السريرية والتشخيص التفريقي والعلاج والعلاقات دون وصم أو تشخيص شعبي.',70),
    ('eating-disorders','اضطرابات الأكل وصورة الجسد','mental-health','اضطرابات الأكل وصورة الجسد والسلوكيات المرتبطة بالتغذية والتقييم والعلاج والدعم الأسري.',80),
    ('sleep-mental-health','النوم والصحة النفسية','mental-health','الأرق واضطرابات النوم ذات الصلة بالصحة النفسية والعلاقة بين النوم والمزاج والقلق والوظيفة اليومية.',90),
    ('dissociative-disorders','الانفصال وتبدد الشخصية والواقع','mental-health','الاضطرابات الانفصالية وتبدد الشخصية وتبدد الواقع والأعراض المشابهة والفروق التشخيصية.',100),
    ('somatic-health-anxiety','القلق الصحي والأعراض الجسدية','mental-health','القلق الصحي والأعراض الجسدية المرتبطة بالقلق والعلاقة بين التقييم الطبي والعوامل النفسية.',110),
    ('grief-loss','الحزن والفقد','mental-health','الحزن الطبيعي والحزن المطول والفقد والدعم النفسي والأسري بعد الوفاة أو الخسارات الكبرى.',120),
    ('stress-burnout','الضغط النفسي والاحتراق','mental-health','الضغط النفسي والاحتراق الوظيفي والدراسي والكمالية والإجهاد واستعادة التوازن والوظيفة.',130),
    ('emotional-regulation','تنظيم الانفعال والغضب','mental-health','تنظيم المشاعر والغضب والتهيج والاندفاع والمهارات العملية المبنية على الدليل.',140),
    ('relationships-attachment','العلاقات والتعلق والصحة النفسية','mental-health','أنماط التعلق والعلاقات المؤذية والحدود والتعافي العاطفي والفروق بين السمات والمفاهيم السريرية.',150),
    ('child-adolescent-mental-health','الصحة النفسية للأطفال والمراهقين','mental-health','الاضطرابات والمشكلات النفسية لدى الأطفال والمراهقين والتقييم المبكر والدعم الأسري والمدرسي.',160),
    ('suicide-self-harm-prevention','الوقاية من الانتحار وإيذاء النفس','mental-health','التثقيف الوقائي والتعرف إلى عوامل الخطورة وطلب المساعدة والدعم الآمن دون محتوى قد يزيد الخطر.',170),

    ('autism','اضطراب طيف التوحد','special-needs-inclusion','التوحد عبر مراحل العمر: السمات والتقييم والتواصل والحواس والتعليم والاستقلالية والدعم الأسري.',30),
    ('adhd','اضطراب نقص الانتباه وفرط الحركة','special-needs-inclusion','ADHD لدى الأطفال والبالغين والنساء، والوظائف التنفيذية والتعلم والعمل والدعم متعدد البيئات.',40),
    ('intellectual-developmental','الإعاقة الذهنية والنمو المعرفي','special-needs-inclusion','الإعاقة الذهنية والنمو المعرفي والمهارات التكيفية والتقييم والدعم والتعليم والاستقلالية.',50),
    ('learning-disorders','اضطرابات وصعوبات التعلم','special-needs-inclusion','عسر القراءة والكتابة والحساب واضطراب التعلم المحدد والتقييم والتدخلات المدرسية والأسرية.',60),
    ('speech-language','النطق واللغة والتواصل','special-needs-inclusion','تأخر الكلام واضطرابات اللغة وأصوات الكلام والطلاقة وتعذر الأداء والتواصل الداعم والبديل.',70),
    ('developmental-motor','النمو الحركي والتنسيق','special-needs-inclusion','اضطرابات التنسيق والحركة والمهارات الحركية والاحتياجات الوظيفية والتأهيل والوصول.',80),
    ('genetic-syndromes','المتلازمات الجينية والكروموسومية','special-needs-inclusion','المتلازمات ذات الأثر النمائي أو المعرفي أو السلوكي أو التعليمي والدعم متعدد التخصصات.',90),
    ('hearing-access','السمع والوصول السمعي','special-needs-inclusion','فقدان السمع والصمم والتواصل والوصول والتعليم والتقنيات المساعدة والهوية والاختيارات الفردية.',100),
    ('vision-access','البصر والوصول البصري','special-needs-inclusion','العمى وضعف البصر والوصول للمعلومات والتعليم والتنقل والتقنيات المساعدة.',110),
    ('motor-disabilities','الإعاقات الحركية','special-needs-inclusion','الإعاقات الحركية والشلل الدماغي والحركة والوضعية والمشاركة والتعليم والوصول البيئي.',120),
    ('sensory-processing','المعالجة الحسية والوصول الحسي','special-needs-inclusion','الحساسية الحسية والبحث الحسي والحمل الزائد والبيئات الداعمة مع توضيح حدود المصطلحات التشخيصية.',130),
    ('assistive-technology','التكنولوجيا المساعدة والوصول','special-needs-inclusion','التواصل البديل والأجهزة والبرمجيات والتقنيات التي تدعم المشاركة والتعلم والاستقلالية.',140),
    ('independent-living','الاستقلالية والمشاركة المجتمعية','special-needs-inclusion','مهارات الحياة اليومية والاختيار والمشاركة والعمل والانتقال للبلوغ والاستقلال بدرجاته المختلفة.',150),
    ('inclusive-education','التربية والتعليم الدامج','special-needs-inclusion','الدمج المدرسي وإزالة الحواجز والتسهيلات والخطط الفردية والتصميم الشامل للتعلم ومشاركة الأسرة.',160),

    ('school-mental-health','الصحة النفسية في المدرسة','child-family-education','القلق المدرسي والامتحانات والتنمر والرفض المدرسي والعلاقات والوقاية والدعم متعدد الأطراف.',20),
    ('inclusive-classroom','الصف الدامج واستراتيجيات التعليم','child-family-education','استراتيجيات الصف الدامج والتكييفات والتعليم المتمايز وإدارة البيئة الصفية والتعاون بين الفريق.',30),
    ('iep-support-planning','الخطط الفردية وتخطيط الدعم','child-family-education','الخطط التعليمية والتربوية الفردية وتحديد الأهداف والمتابعة ومشاركة الأسرة مع مراعاة اختلاف الأنظمة الوطنية.',40),
    ('teacher-guides','أدلة المعلمين','child-family-education','أدلة تطبيقية للمعلمين لدعم الصحة النفسية والتعلم والتواصل والسلوك والدمج داخل الصف.',50),
    ('family-school-partnership','الشراكة بين الأسرة والمدرسة','child-family-education','التواصل والتخطيط المشترك وحل المشكلات والانتقالات والمتابعة بين المنزل والمدرسة.',60),
    ('school-transitions','الانتقال بين المراحل التعليمية','child-family-education','الاستعداد للمدرسة والانتقال بين الصفوف والجامعة والعمل ودعم الاستقلال والاحتياجات الفردية.',70)
)
insert into public.categories(
  sector_id,parent_id,slug,name_ar,description,sort_order,is_active,visibility,audience,metadata
)
select
  s.id,
  null,
  p.slug,
  p.name_ar,
  p.description,
  p.sort_order,
  true,
  'public',
  '{}'::text[],
  jsonb_build_object('taxonomy_source','search-demand-expansion','taxonomy_version',1)
from proposed p
join public.sectors s on s.slug=p.sector_slug
on conflict(slug) do update set
  sector_id=excluded.sector_id,
  name_ar=excluded.name_ar,
  description=excluded.description,
  sort_order=excluded.sort_order,
  is_active=true,
  visibility='public',
  metadata=coalesce(public.categories.metadata,'{}'::jsonb) || excluded.metadata,
  updated_at=now();
