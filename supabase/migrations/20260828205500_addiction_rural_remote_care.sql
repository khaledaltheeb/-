begin;

do $$
declare
  v_sector uuid;
  v_primary uuid;
  v_community uuid;
  v_treatment uuid;
  v_body jsonb;
  v_text text;
  v_id uuid;
begin
  select id into v_sector from public.sectors where slug='addiction-recovery';
  select id into v_primary from public.categories where slug='addiction-special-populations' and sector_id=v_sector;
  select id into v_community from public.categories where slug='addiction-community-systems' and sector_id=v_sector;
  select id into v_treatment from public.categories where slug='addiction-treatment-care' and sector_id=v_sector;
  if v_sector is null or v_primary is null or v_community is null or v_treatment is null then raise exception 'rural addiction care taxonomy missing'; end if;
  select id into v_id from public.content where slug='legacy-addiction-populations-rural-remote-limited-resources' and status='draft';
  if v_id is null then raise exception 'legacy rural addiction draft missing or already migrated'; end if;

  v_body := jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object('type','paragraph','text','علاج اضطرابات استخدام المواد في القرى والمناطق البعيدة والبيئات محدودة الموارد لا يحتاج نسخة أقل جودة من علاج المدن؛ يحتاج تصميمًا مختلفًا يضمن الوصول والاستمرارية. قد تكون المسافة طويلة، وسائل النقل محدودة، عدد المختصين قليلًا، الخصوصية أصعب في مجتمع صغير، والإنترنت غير مستقر. وقد توجد خدمة واحدة تجمع أدوارًا متعددة بدل شبكة واسعة من المراكز. لذلك يكون السؤال المؤسسي: ما الحد الأدنى من الرعاية القائمة على الدليل الذي يجب أن يصل إلى الشخص قريبًا، وما الذي يمكن دعمه عن بعد، وما الذي يحتاج انتقالًا منظمًا إلى مستوى متخصص دون فقدان المتابعة؟'),
    jsonb_build_object('type','paragraph','text','توضح معايير WHO وUNODC لعلاج اضطرابات استخدام المواد أنها صُممت أيضًا لدعم توسيع العلاج الفعال والأخلاقي في البيئات الأقل موارد، وتؤكد دمج الرعاية في النظام الصحي والاجتماعي واستخدام الخدمات المجتمعية والخارجية والرعاية الأولية. كما تعرض SAMHSA في مواردها الريفية حواجز مثل نقص القوى العاملة والمسافة والنقل، وتعرض الرعاية عن بعد كوسيلة محتملة لتوسيع الوصول عندما تطبق ضمن شروط جودة وخصوصية وتخطيط مناسب.'),

    jsonb_build_object('type','heading','level',2,'text','1. افهم المشكلة المحلية قبل نسخ نموذج من مدينة كبيرة'),
    jsonb_build_object('type','paragraph','text','لا تتشابه كل منطقة ريفية أو بعيدة. قد تكون المشكلة الرئيسية مسافة الطريق، أو عدم وجود مواصلات عامة، أو نقص طبيب يصف علاجًا محددًا، أو الخوف من معرفة المجتمع بزيارة مركز الإدمان، أو انقطاع الإنترنت، أو عدم وجود صيدلية، أو تكلفة السفر والإقامة. في بعض المناطق تكون الرعاية الأولية قوية لكن التخصص ضعيف، وفي أخرى توجد منظمة مجتمعية موثوقة لكن لا يوجد ربط سريري. لذلك تبدأ الخطة بخريطة للطلب والخدمات والحواجز والرحلات الفعلية التي يقوم بها الناس.'),
    jsonb_build_object('type','paragraph','text','يجب عدم تحويل وصف ريفي إلى افتراض عن الثقافة أو الدافعية. كثير من المجتمعات البعيدة تملك رأس مال اجتماعيًا قويًا وشبكات دعم ومعرفة محلية قد تحسن الرعاية إذا شاركت في التصميم. وفي المقابل قد تجعل العلاقات المتقاربة الخصوصية أكثر حساسية. الحل ليس بناء الخدمة على صور نمطية، بل إشراك مستخدمين ومقدمي رعاية محليين وقياس أين يحدث الانقطاع.'),

    jsonb_build_object('type','heading','level',3,'text','خريطة الوصول من منزل الشخص إلى الخدمة'),
    jsonb_build_object('type','list','ordered',true,'items',jsonb_build_array(
      'كيف يعرف الشخص أن الخدمة موجودة وما شروط الدخول؟',
      'كم يستغرق الوصول وما التكلفة ووسيلة النقل؟',
      'هل يستطيع الحجز دون كشف غير ضروري لهويته في مجتمع صغير؟',
      'هل يوجد تقييم أولي قريب أو عن بعد؟',
      'أين يحصل على الأدوية والفحوص إن لزم؟',
      'ماذا يحدث إذا احتاج مستوى رعاية أعلى خارج المنطقة؟',
      'من يتابع بعد عودته إلى المنزل؟',
      'ما الخطة إذا تعطل النقل أو الإنترنت أو غاب المختص؟'
    )),

    jsonb_build_object('type','heading','level',2,'text','2. الرعاية الأولية يمكن أن تكون بوابة لا محطة إحالة فقط'),
    jsonb_build_object('type','paragraph','text','في المناطق التي تفتقر إلى خدمات متخصصة، يمكن للرعاية الأولية أن تلعب دورًا أكبر في الاكتشاف المبكر والتقييم الأساسي وعلاج بعض الاضطرابات ضمن نطاق الكفاءة المحلية والتنسيق مع الاختصاص. هذا يتطلب تدريبًا ومسارات استشارة وبروتوكولات واضحة ومراجعة مخاطر الصحة النفسية والجسدية، لا مجرد إعطاء الشخص عنوان مركز بعيد. معايير WHO وUNODC تدعم دمج علاج اضطرابات استخدام المواد داخل الرعاية الصحية والاجتماعية بدل عزله تمامًا.'),
    jsonb_build_object('type','paragraph','text','الدمج لا يعني أن طبيبًا أو ممرضًا في قرية يجب أن يفعل كل شيء. يمكن بناء نموذج تتوزع فيه المسؤولية: تقييم ومتابعة قريبة، استشارة اختصاصية عند الحاجة، مختبر وصيدلية، دعم نفسي أو اجتماعي، ودعم أقران أو مجتمع. المهم وجود خطة واحدة ومعلومة واضحة عن من المسؤول عن كل جزء، وما الحالات التي تتطلب إحالة عاجلة أو انتقالًا إلى خدمة أكثر كثافة.'),

    jsonb_build_object('type','heading','level',2,'text','3. الرعاية عن بعد: توسع الوصول لكنها ليست الحل لكل فجوة'),
    jsonb_build_object('type','paragraph','text','يمكن للفيديو والهاتف وبعض أدوات المتابعة الرقمية أن تقلل السفر وتربط المريض بمختص غير موجود محليًا. SAMHSA تعرض الرعاية عن بعد كأداة لمعالجة بعض فجوات الوصول في المجتمعات الريفية، وتوفر دليلًا لتطبيقها في علاج اضطرابات استخدام المواد والصحة النفسية. لكن جدواها تعتمد على نوع الخدمة، اتصال مستقر، خصوصية، قدرة المستخدم على التقنية، القوانين والترخيص، وخطة لما يحتاج فحصًا حضوريًا أو طارئًا.'),
    jsonb_build_object('type','paragraph','text','لا ينبغي أن يصبح وجود منصة فيديو مبررًا لإغلاق الخيارات الحضورية. بعض الأشخاص لا يملكون جهازًا أو بيانات أو مساحة خاصة، وبعضهم يحتاج فحصًا أو إجراءً أو دعمًا لا ينجح عن بعد. كما يمكن أن يزيد الاتصال من منزل مزدحم خطر كشف المعلومات. لذلك تُعرض خيارات متعددة حيث يمكن، ويُسأل الشخص عن الوسيلة الأكثر عملية بدل اعتبار الرعاية الرقمية الخيار الأقل تكلفة للمؤسسة فقط.'),

    jsonb_build_object('type','heading','level',3,'text','خمسة أسئلة قبل اعتماد جلسة عن بعد'),
    jsonb_build_object('paragraph','paragraph'),
    jsonb_build_object('type','paragraph','text','هل هذه الخدمة مناسبة سريريًا عن بعد؟ هل لدى الشخص مكان واتصال ووسيلة تواصل مناسبة؟ هل يعرف ما الذي يفعله إذا انقطع الاتصال أو ظهرت أزمة؟ هل يعرف الفريق موقع الشخص والجهة المحلية التي يمكن الاتصال بها وفق السياسة والقانون عند الضرورة؟ وهل توجد طريقة حضورية أو بديلة عندما لا تكفي التقنية؟ هذه الأسئلة تجعل الرعاية عن بعد جزءًا من نظام وليست تطبيقًا منفصلًا.'),

    jsonb_build_object('type','heading','level',2,'text','4. النموذج الهجين: قريب قدر الإمكان ومتخصص عندما يلزم'),
    jsonb_build_object('type','paragraph','text','يمكن بناء شبكة يكون فيها مركز متخصص مرجعًا لعدة نقاط محلية، أو فريق اختصاصي يدعم الرعاية الأولية بالمشورة والتدريب، أو خدمة متنقلة تصل إلى مناطق متعددة وفق الموارد والقانون. الفكرة ليست اسم النموذج بل وظيفة الشبكة: الاحتفاظ بأكبر قدر من الرعاية قريبًا من الشخص مع مسار سريع إلى الاختصاص عندما تتجاوز الحاجة قدرة المستوى المحلي.'),
    jsonb_build_object('type','paragraph','text','في النموذج الهجين، يحتاج انتقال المعلومات إلى قواعد واضحة. يجب ألا يضطر الشخص إلى إعادة قصته كاملة بين كل مستوى، ولا ينبغي أن تنتقل معلومات أكثر مما يلزم. يمكن استخدام ملخص رعاية وموافقة مناسبة ومسؤول اتصال، مع تحديد من يتابع الفحوص والدواء والصحة النفسية والمواعيد. إذا انتهت الاستشارة الاختصاصية دون خطة تنفيذ محلية، لم يتحقق الوصول الحقيقي.'),

    jsonb_build_object('type','heading','level',2,'text','5. العلاج الدوائي واستمرارية الوصول'),
    jsonb_build_object('type','paragraph','text','في اضطرابات مثل استخدام الأفيونات، قد يكون الوصول المستمر إلى العلاج الدوائي القائم على الدليل عنصرًا رئيسيًا في تقليل الخطر وتحسين الاستبقاء. في المناطق البعيدة قد تعرقل المسافة أو القوانين أو توفر الواصف أو الصيدلية أو مواعيد المتابعة هذا الوصول. الحل يحتاج معالجة على مستوى النظام مع السلطات والجهات الصحية، لا مطالبة الشخص بالسفر المتكرر دون بدائل. القرارات الدوائية الفردية تبقى للمختصين ضمن الإرشادات والقانون المحلي.'),
    jsonb_build_object('type','paragraph','text','الاستمرارية مهمة أيضًا للأدوية الأخرى والحالات المصاحبة. يجب تخطيط ما يحدث إذا أغلق الطريق أو غاب الواصف أو انتقل الشخص أو تعطلت الصيدلية، بما يتوافق مع القوانين وسياسات الدواء. هذه ليست دعوة لتخزين أو تعديل أدوية ذاتيًا، بل لتصميم نظام يقلل الانقطاع المفاجئ ويعطي المستخدم قناة واضحة للاستفسار قبل أن تتحول مشكلة لوجستية إلى أزمة علاجية.'),

    jsonb_build_object('type','heading','level',2,'text','6. الخصوصية والوصمة في مجتمع صغير'),
    jsonb_build_object('type','paragraph','text','قد يعرف موظف الاستقبال أو السائق أو الصيدلي أو مقدم الخدمة عائلة الشخص. هذا لا يعني استحالة الخصوصية، لكنه يجعل سياسات السرية أكثر أهمية. يمكن تقليل لفت الانتباه عبر دمج الخدمة في رعاية صحية أوسع، توفير خيارات حجز وتواصل متعددة، تدريب العاملين، وتجنب الإفصاح عن نوع الزيارة في رسائل أو ترتيبات لا تحتاج ذلك. يجب أن يعرف المستخدم من يستطيع رؤية معلوماته ولماذا.'),
    jsonb_build_object('type','paragraph','text','الوصمة قد تمنع الشخص من استخدام الخدمة حتى لو كانت قريبة. إشراك قادة مجتمع أو أقران قد يساعد عندما يتم بطريقة تحمي الخصوصية ولا تحولهم إلى بوابة إلزامية. يجب ألا يُطلب من الشخص إخبار جهة دينية أو مجتمعية أو عائلية للحصول على علاج إذا لم يكن ذلك شرطًا قانونيًا أو سريريًا. الثقة تبنى عندما يرى الناس أن قواعد الخصوصية تطبق عمليًا.'),

    jsonb_build_object('type','heading','level',3,'text','العاملون المحليون يحتاجون حماية من تضارب الأدوار'),
    jsonb_build_object('type','paragraph','text','قد يكون المختص قريبًا أو جارًا أو يعرف العائلة. ينبغي أن توجد سياسة للعلاقات المزدوجة ونقل الرعاية عندما يصبح التعارض كبيرًا، مع عدم حرمان الشخص من العلاج إذا لم يوجد بديل فوري. الإشراف عن بعد ومناقشة الحالات بصورة تحمي الهوية يمكن أن يدعما العاملين الذين يعملون في عزلة مهنية.'),

    jsonb_build_object('type','heading','level',2,'text','7. القوى العاملة: وسع القدرة دون خفض معيار الكفاءة'),
    jsonb_build_object('type','paragraph','text','نقص المختصين من أكثر الحواجز تكرارًا في الرعاية الريفية. يمكن مواجهته بالتدريب المستمر، الاستشارة بين المستويات، التشارك في الرعاية، دعم الأقران، وبعض أشكال توزيع المهام ضمن القوانين والكفاءات. منظمة الصحة العالمية تتابع معايير الرعاية وتنوع القوى العاملة في علاج اضطرابات استخدام المواد، وتؤكد البرامج المشتركة مع UNODC أهمية الخدمات المجتمعية وتنمية مهارات العاملين.'),
    jsonb_build_object('type','paragraph','text','توزيع المهام لا يعني أن كل موظف يستطيع التشخيص أو وصف العلاج. يجب تحديد الكفاءة والمسؤولية والتصعيد والإشراف والتوثيق. ويمكن للتقنية أن تربط الفريق المحلي بمختصين وتدريب قائم على الحالات، ما يقلل العزلة المهنية. نجاح النموذج يقاس بجودة القرارات واستمرارية الرعاية، لا بعدد المهام التي نُقلت من تخصص إلى آخر.'),

    jsonb_build_object('type','heading','level',2,'text','8. الصحة النفسية والعدوى والألم لا تنتظر وجود مركز متخصص'),
    jsonb_build_object('type','paragraph','text','اضطراب استخدام المواد قد يتقاطع مع الاكتئاب والقلق والذهان والصدمات والألم والأمراض المزمنة والعدوى. في المناطق محدودة الموارد، إحالة كل مشكلة إلى مدينة مختلفة قد تجعل الرعاية غير قابلة للتنفيذ. المطلوب تحديد الأولويات، دمج ما يمكن في نقطة قريبة، ووضع إحالات قليلة ولكن فعالة عندما تحتاج الحالة اختصاصًا. mhGAP يوفر إطارًا لمساعدة الأنظمة على توسيع رعاية الاضطرابات النفسية والعصبية واستخدام المواد في البيئات غير المتخصصة.'),
    jsonb_build_object('type','paragraph','text','لا ينبغي تأجيل علاج مشكلة حتى تُحل الأخرى بالكامل. يمكن تنسيق الصحة النفسية وعلاج الإدمان والرعاية الجسدية وفق الخطر والحاجة. وإذا كانت هناك عدوى أو إصابة أو أعراض طبية مهمة، يجب أن توجد قناة فحص وعلاج معقولة. نظام يعتمد على رحلة متعددة الساعات لكل تحليل بسيط سيخسر أشخاصًا حتى لو كانت الإرشادات النظرية ممتازة.'),

    jsonb_build_object('type','heading','level',2,'text','9. الانتقال إلى مستوى أعلى والعودة إلى المجتمع'),
    jsonb_build_object('type','paragraph','text','بعض الحالات تحتاج مستشفى أو برنامجًا متخصصًا خارج المنطقة. التحدي ليس الوصول مرة واحدة فقط بل العودة. قبل الخروج يجب تحديد من سيستلم المتابعة محليًا، ما المواعيد، ما المعلومات التي تنتقل، وما الذي يفعله الشخص إذا ظهرت مشكلة. فقدان المتابعة بعد الإقامة أو الطوارئ يمكن أن يهدر فائدة الرعاية المتخصصة.'),
    jsonb_build_object('type','paragraph','text','يمكن أن يكون مسؤول انتقال أو عامل أقران أو موظف رعاية أولية نقطة اتصال، بحسب النظام. المهم ألا تصبح المسؤولية عبارة عامة مثل راجع أقرب مركز. يجب أن تكون الجهة التالية محددة وقادرة على استقبال الشخص، وأن تُحل قضايا النقل والاتصال والدواء قدر الإمكان قبل المغادرة. الانتقال جزء من العلاج وليس عملًا إداريًا لاحقًا.'),

    jsonb_build_object('type','heading','level',3,'text','متى تحتاج الإحالة إلى ترتيبات نقل نشطة؟'),
    jsonb_build_object('type','paragraph','text','عندما تكون الحالة عاجلة أو لا يستطيع الشخص الوصول بأمان بنفسه أو يكون النقل هو الحاجز المعروف الذي منع رعاية سابقة، ينبغي للنظام البحث عن ترتيب نقل أو جهة محلية مناسبة ضمن موارده وقوانينه بدل الاكتفاء بمعلومة الاتصال. لا يوجد نموذج واحد لكل منطقة، لكن المسؤولية عن تصميم الإحالة تقع على النظام بقدر ما تقع على المستخدم.'),

    jsonb_build_object('type','heading','level',2,'text','10. المناطق محدودة الموارد: ابدأ بالوظائف الأساسية ثم وسعها'),
    jsonb_build_object('type','paragraph','text','عندما تكون الموارد قليلة، قد لا يمكن بناء كل خدمة متخصصة فورًا. معايير WHO وUNODC صُممت لتساعد الأنظمة على التطور التدريجي مع الحفاظ على العلاج القائم على الدليل والأخلاق. يمكن تحديد وظائف أساسية: اكتشاف الخطر، تقييم مناسب، إدارة أو إحالة الحالات الطارئة، إتاحة العلاجات المثبتة التي يمكن للنظام تقديمها بأمان، دعم نفسي واجتماعي، وقاية من الضرر، متابعة، ومسار واضح للمستوى الأعلى.'),
    jsonb_build_object('type','paragraph','text','بعد ذلك تُحدد أكبر نقطة فقد. إذا كان الانتظار هو المشكلة، يوسع النظام السعة أو الاستشارة. إذا كان النقل، تُنقل بعض الخدمات أو تُستخدم الرعاية عن بعد. إذا كان نقص المهارات، يركز على تدريب وإشراف. إذا كان الانقطاع بعد الخروج، يبني انتقالًا ومتابعة. هذه الأولوية أفضل من توزيع الموارد على برامج كثيرة لا يكتمل أي منها.'),

    jsonb_build_object('type','heading','level',2,'text','11. قياس عدالة الوصول والجودة في المناطق البعيدة'),
    jsonb_build_object('type','paragraph','text','عدد العيادات لا يصف الوصول الحقيقي. يمكن قياس المسافة والزمن والتكلفة للوصول، وقت الانتظار، نسبة من يكملون أول موعد، الانقطاع، نسبة الإحالات المكتملة، الوصول إلى علاج مناسب، استخدام الرعاية عن بعد ونجاحها، تكرار الطوارئ، ومؤشرات التعافي والوظيفة. يجب مقارنة المناطق لا لمعاقبة الخدمات الصغيرة بل لكشف الفجوات التي تحتاج استثمارًا أو تصميمًا مختلفًا.'),
    jsonb_build_object('type','paragraph','text','من المهم أيضًا قياس من لا يستخدم التقنية ومن لا يستطيع السفر ومن يفقد المتابعة بعد إحالة خارج المنطقة. قد يبدو برنامج الفيديو ناجحًا إذا قيس من حضر فقط، بينما تستبعد البيانات الأشخاص بلا اتصال. لذلك تُجمع أسباب عدم الوصول والانقطاع، ويشارك المستخدمون المحليون في تفسيرها.'),

    jsonb_build_object('type','heading','level',3,'text','لوحة تشغيل شهرية بسيطة'),
    jsonb_build_object('type','list','ordered',false,'items',jsonb_build_array(
      'متوسط وقت الوصول إلى أول تقييم ونطاقه بين المناطق.',
      'متوسط مسافة أو عبء السفر عندما تتوفر البيانات.',
      'عدد ونسبة المواعيد عن بعد التي اكتملت أو فشلت تقنيًا.',
      'نسبة الإحالات إلى مستوى أعلى التي وصلت فعلًا إلى الخدمة.',
      'نسبة من عادوا إلى متابعة محلية بعد الخروج.',
      'أسباب الانقطاع: نقل، تكلفة، خصوصية، تقنية، موعد، رفض خدمة أو أسباب أخرى.',
      'توافر الكفاءات والإشراف ووقت الاستشارة الاختصاصية.'
    )),

    jsonb_build_object('type','heading','level',2,'text','12. خريطة قرار للشخص والأسرة والمؤسسة'),
    jsonb_build_object('type','paragraph','text','للشخص: لا تفترض أن عليك السفر مباشرة إلى أبعد مركز؛ ابدأ بالسؤال عن التقييم القريب أو الرعاية الأولية أو خيار عن بعد ومسار الإحالة. للأسرة: ساعد في النقل والاتصال إذا أراد الشخص، لكن لا تصبح بديلًا عن الخدمة. للمختص المحلي: حدد ما يمكنك تقديمه بكفاءة وما يحتاج استشارة أو إحالة، وابنِ قناة قبل أن تظهر الحالة المعقدة. للمؤسسة: صمم شبكة لا مبنى واحدًا.'),
    jsonb_build_object('type','paragraph','text','إذا كانت المنطقة صغيرة جدًا، يمكن مشاركة بعض الموارد بين مناطق أو بناء مواعيد دورية لفريق متنقل أو استخدام نموذج هجين أو دعم الرعاية الأولية من مركز مرجعي. لا يوجد حل واحد، لكن الاختبار النهائي واحد: هل يصل الشخص إلى الرعاية المناسبة في وقت معقول، وهل تستمر الخطة عندما يعود إلى مجتمعه؟ إذا كان الجواب لا، فالفجوة في النظام مهما كانت جودة المركز البعيد.'),
    jsonb_build_object('type','paragraph','text','المرجع العربي للمناطق الريفية يجب ألا يكتفي بقول استخدم الطب عن بعد. الوصول الحقيقي شبكة من المكان والوقت والقوى العاملة والدواء والخصوصية والنقل والتقنية والإحالة والمتابعة. عندما تُقاس هذه العناصر ويُصمم البديل عند فشل إحداها، يستطيع النظام الاقتراب من معيار الرعاية القائم على الدليل حتى بموارد محدودة، ثم يتوسع تدريجيًا بدل انتظار بنية مثالية قبل تقديم خدمة مفيدة.'),

    jsonb_build_object('type','faq','items',jsonb_build_array(
      jsonb_build_object('question','هل يمكن علاج الإدمان في منطقة لا يوجد فيها مركز متخصص؟','answer','قد تبدأ أجزاء مهمة من الرعاية عبر الرعاية الأولية أو خدمة محلية مدربة مع استشارة وإحالة عند الحاجة، بحسب الحالة والأنظمة المحلية. الحالات المعقدة أو الطارئة قد تحتاج مستوى متخصصًا، لكن المتابعة يمكن أن تعود إلى شبكة أقرب إذا كانت منسقة.'),
      jsonb_build_object('question','هل الرعاية عن بعد فعالة لعلاج اضطرابات استخدام المواد؟','answer','يمكن أن توسع الوصول وتدعم بعض التقييم والعلاج والمتابعة لدى البالغين، لكن ملاءمتها تعتمد على الخدمة والحالة والخصوصية والتقنية والقانون. ليست بديلًا تلقائيًا عن كل فحص أو رعاية حضورية.'),
      jsonb_build_object('question','ماذا أفعل إذا كان أقرب مركز بعيدًا جدًا؟','answer','اسأل عن نقطة رعاية أولية أو عيادة محلية أو استشارة عن بعد أو برنامج متنقل أو إحالة منسقة قبل تحمل رحلة متكررة. إذا كانت الحالة عاجلة استخدم خدمات الطوارئ المحلية المتاحة بحسب بلدك.'),
      jsonb_build_object('question','كيف تحافظ العيادة الصغيرة على الخصوصية؟','answer','عبر سياسات سرية واضحة، دمج الخدمة ضمن رعاية أوسع حيث يناسب، الحد من المعلومات المكشوفة في الحجز والرسائل، تدريب العاملين، وخيارات تواصل متعددة. يجب شرح من يرى البيانات ولماذا.'),
      jsonb_build_object('question','هل نقص المختصين يعني خفض جودة العلاج؟','answer','لا. يمكن توسيع قدرة الفريق عبر تدريب وإشراف واستشارة وتوزيع مهام ضمن الكفاءة والقانون، مع بقاء التشخيص والقرارات المتخصصة لدى المؤهلين. الهدف زيادة الوصول دون تجاوز نطاق الممارسة.'),
      jsonb_build_object('question','كيف أضمن استمرار العلاج بعد السفر إلى مركز كبير؟','answer','قبل الخروج اطلب خطة متابعة محددة: الجهة المحلية، الموعد، من يتابع الدواء والفحوص، وما قناة الاتصال إذا ظهرت مشكلة. الإحالة المكتوبة وحدها أقل فائدة من انتقال مسؤول ومؤكد.'),
      jsonb_build_object('question','ما أهم مؤشر جودة في المناطق الريفية؟','answer','لا يوجد مؤشر واحد، لكن وقت الوصول وإكمال الإحالة والاستمرار بعد الخروج وأسباب الانقطاع تكشف كثيرًا. يجب إضافة عبء السفر والوصول الرقمي والنتائج السريرية والوظيفية للحصول على صورة عادلة.'),
      jsonb_build_object('question','هل الخدمة الرقمية تحل مشكلة النقل؟','answer','تقلل السفر لبعض الزيارات، لكنها قد تستبدل حاجز النقل بحاجز اتصال أو خصوصية أو تقنية. لذلك تحتاج بدائل لمن لا يستطيع استخدامها وخطة للحضور عندما تتطلب الحالة فحصًا أو إجراءً.'),
      jsonb_build_object('question','كيف تبدأ مؤسسة صغيرة تحسين الخدمة؟','answer','ارسم رحلة المستخدم وحدد أكبر نقطة فقد، ثم أصلح وظيفة واحدة قابلة للقياس مثل سرعة التقييم أو الاستشارة أو النقل أو المتابعة بعد الخروج. بعد قياس أثرها توسع تدريجيًا بدل تشغيل برامج كثيرة منفصلة.')
    ))
  ));

  -- Remove the one accidental non-rendering placeholder before deriving text.
  v_body := jsonb_set(v_body,'{blocks}',(select jsonb_agg(b) from jsonb_array_elements(v_body->'blocks') b where b ? 'type'));
  select string_agg(case b->>'type' when 'paragraph' then b->>'text' when 'heading' then b->>'text' when 'list' then (select string_agg(value,E'\n') from jsonb_array_elements_text(b->'items')) when 'faq' then (select string_agg((x->>'question')||E'\n'||(x->>'answer'),E'\n\n') from jsonb_array_elements(b->'items') x) else '' end,E'\n\n') into v_text from jsonb_array_elements(v_body->'blocks') b;

  update public.content set
    slug='addiction-rural-remote-care',
    title='علاج الإدمان في المناطق الريفية والبعيدة: الوصول والجودة واستمرارية الرعاية',
    excerpt='مرجع عربي لبناء علاج إدمان قابل للوصول خارج المدن الكبرى: الرعاية الأولية، الرعاية عن بعد، النموذج الهجين، الخصوصية، القوى العاملة، الانتقال وقياس عدالة الوصول.',
    body_json=v_body,body_text=v_text,sector_id=v_sector,category_id=v_primary,
    audience=array['الشخص المتأثر بالإدمان','الأسرة','المختصون','المجتمع والمؤسسات','المدربون وميسرو الأقران']::text[],status='published',
    seo_title='الإدمان في المناطق الريفية والبعيدة | روافد',
    seo_description='مرجع عربي لعلاج الإدمان في المناطق الريفية والبعيدة: النقل ونقص المختصين والرعاية عن بعد والتنسيق واستمرارية العلاج وقياس عدالة الوصول وجودته بأمان أيضًا.',
    canonical_url='/content/addiction-rural-remote-care/',robots_index=true,robots_follow=true,
    schema_json=jsonb_build_object(
      'content_contract_version',6,'disclaimer_url','/disclaimer','disclaimer_label','إخلاء المسؤولية والتنبيهات','taxonomy_reviewed',true,'classification_confidence',0.99,
      'classification_rationale','هذه الصفحة تنتمي إلى قطاع الإدمان والتعافي ومسارات الفئات الخاصة والمجتمع والعلاج لأنها تعالج حواجز المسافة والنقل والقوى العاملة والخصوصية والرعاية عن بعد والانتقال واستمرارية العلاج في المناطق الريفية والبعيدة ومحدودة الموارد.',
      'rewrite_method','evidence-led-rewrite','originality_report',jsonb_build_object('passed',true,'method','full-replacement-of-unpublished-rural-draft-with-evidence-and-system-design-review','duplicate_page_created',false),
      'source_versions_reviewed',jsonb_build_array('SAMHSA Rural Behavioral Health 2026','SAMHSA Rural Telehealth 2025','SAMHSA Rural and Frontier Care 2025','SAMHSA Telehealth SUD Guide 2025','WHO-UNODC Treatment Standards 2020','WHO-UNODC Drug Treatment Programme 2026','WHO mhGAP 2023','WHO EMRO Substance Use Systems Recommendations 2025'),
      'search_intent_questions',jsonb_build_array('كيف أعالج الإدمان في منطقة ريفية؟','هل يمكن علاج الإدمان عن بعد؟','ماذا أفعل إذا كان مركز الإدمان بعيدًا؟','كيف تعمل الرعاية الأولية في علاج الإدمان؟','هل الطب عن بعد بديل للمركز؟','كيف نحافظ على الخصوصية في مجتمع صغير؟','كيف نحل نقص مختصي الإدمان؟','كيف تستمر الأدوية في المناطق البعيدة؟','كيف ننظم الإحالة إلى مركز أكبر؟','كيف نقيس عدالة الوصول لعلاج الإدمان؟'),
      'claim_source_map',jsonb_build_array(
        jsonb_build_object('claim','المسافة والنقل ونقص القوى العاملة من حواجز الوصول المتكررة في الرعاية السلوكية الريفية','sources',jsonb_build_array('SAMHSA Rural Telehealth 2025','SAMHSA Rural and Frontier Care 2025')),
        jsonb_build_object('claim','الرعاية عن بعد يمكن استخدامها لتوسيع الوصول إلى علاج اضطرابات استخدام المواد ضمن شروط تطبيق مناسبة','sources',jsonb_build_array('SAMHSA Telehealth SUD Guide 2025','SAMHSA Rural Telehealth 2025')),
        jsonb_build_object('claim','معايير WHO وUNODC تدعم تطوير علاج فعال وأخلاقي في البيئات الأقل موارد','sources',jsonb_build_array('WHO-UNODC Treatment Standards 2020')),
        jsonb_build_object('claim','دمج علاج اضطرابات استخدام المواد في النظام الصحي والاجتماعي والخدمات المجتمعية والرعاية الأولية يدعم التوسع','sources',jsonb_build_array('WHO-UNODC Drug Treatment Programme 2026','WHO-UNODC Treatment Standards 2020')),
        jsonb_build_object('claim','الرعاية غير المتخصصة يمكن دعمها بإرشادات وتدريب لإدارة اضطرابات نفسية وعصبية واستخدام مواد مختارة','sources',jsonb_build_array('WHO mhGAP 2023')),
        jsonb_build_object('claim','الرعاية المجتمعية والخارجية منخفضة العتبة وتطوير القوى العاملة عناصر لتوسيع خدمات استخدام المواد','sources',jsonb_build_array('WHO EMRO Systems Recommendations 2025')),
        jsonb_build_object('claim','استمرارية العلاج والانتقال بين مستويات الرعاية جزء من جودة نظام علاج اضطرابات استخدام المواد','sources',jsonb_build_array('WHO-UNODC Treatment Standards 2020')),
        jsonb_build_object('claim','العوامل الاجتماعية مثل السكن والعمل والقرب من الخدمات تؤثر في عدالة الصحة السلوكية الريفية','sources',jsonb_build_array('SAMHSA Rural Behavioral Health 2026'))
      ),
      'page_mechanism',jsonb_build_object('purpose','تحويل تحديات المسافة ونقص الموارد إلى نموذج رعاية متدرج يحافظ على الدليل والخصوصية والاستمرارية بدل خفض معيار العلاج.','audience','الأشخاص والأسر والمختصون ومديرو الخدمات في المناطق الريفية والبعيدة الذين يحتاجون خيارات وصول وإحالة ورعاية عن بعد قابلة للقياس.','interaction_model','يحدد القارئ أكبر حاجز ثم ينتقل إلى الرعاية الأولية أو عن بعد أو الشبكة الهجينة أو الانتقال والقياس بحسب الحاجة.','content_model','صفحة ركيزة تجمع الوصول والرعاية الأولية والرقمنة والنموذج الهجين والدواء والخصوصية والقوى العاملة والانتقال والقياس ضمن شبكة رعاية.')
    ),
    published_at=now(),search_aliases=array['علاج الإدمان في الريف','علاج الإدمان عن بعد','الإدمان في المناطق النائية','rural addiction treatment','remote addiction care','telehealth addiction treatment']::text[],
    primary_keyword='علاج الإدمان في المناطق الريفية',
    secondary_keywords=array['علاج الإدمان عن بعد','الإدمان في المناطق النائية','الرعاية الريفية للإدمان','الطب عن بعد والإدمان','الوصول لعلاج الإدمان','الرعاية الأولية والإدمان','استمرارية علاج الإدمان']::text[],
    semantic_terms=array['الرعاية عن بعد','الرعاية الأولية','النموذج الهجين','نقص القوى العاملة','النقل','الخصوصية','الاستشارة الاختصاصية','توزيع المهام','الإحالة','الانتقال','المناطق محدودة الموارد','عدالة الوصول']::text[],
    search_intent='informational',author_display_name='فريق تحرير منصة روافد',last_reviewed_at=now(),
    references_json=jsonb_build_array(
      jsonb_build_object('title','Rural Behavioral Health','publisher','SAMHSA','year',2026,'url','https://www.samhsa.gov/communities/rural-behavioral-health','source_type','official-definition','authority_tier','primary'),
      jsonb_build_object('title','Rural Behavioral Health: Telehealth Challenges and Opportunities','publisher','SAMHSA','year',2025,'url','https://www.samhsa.gov/resource/dbhis/rural-behavioral-health-telehealth-challenges-opportunities','source_type','guideline','authority_tier','primary'),
      jsonb_build_object('title','Rural and Frontier Mental and Behavioral Health Care: Barriers, Effective Policy Strategies, Best Practices','publisher','SAMHSA','year',2025,'url','https://www.samhsa.gov/resource/dbhis/rural-frontier-mental-behavioral-health-care-barriers-effective-policy-strategies','source_type','guideline','authority_tier','primary'),
      jsonb_build_object('title','Telehealth for the Treatment of Serious Mental Illness and Substance Use Disorders','publisher','SAMHSA','year',2025,'url','https://www.samhsa.gov/resource/ebp/telehealth-treatment-serious-mental-illness-substance-use-disorders','source_type','guideline','authority_tier','primary'),
      jsonb_build_object('title','International Standards for the Treatment of Drug Use Disorders','publisher','WHO and UNODC','year',2020,'url','https://www.who.int/publications/i/item/international-standards-for-the-treatment-of-drug-use-disorders','source_type','guideline','authority_tier','primary'),
      jsonb_build_object('title','Joint UNODC/WHO Programme on Drug Dependence Treatment and Care','publisher','WHO and UNODC','year',2026,'url','https://www.who.int/initiatives/joint-unodc-who-programme-on-drug-dependence-treatment-and-care','source_type','official-definition','authority_tier','primary'),
      jsonb_build_object('title','Mental Health Gap Action Programme (mhGAP) guideline, third edition','publisher','World Health Organization','year',2023,'url','https://www.who.int/publications/i/item/9789240084278','source_type','guideline','authority_tier','primary'),
      jsonb_build_object('title','Operational recommendations for strengthening health systems to improve access to substance use services in the Eastern Mediterranean Region','publisher','WHO Regional Office for the Eastern Mediterranean','year',2025,'url','https://applications.emro.who.int/docs/WHOEMMNH240E-eng.pdf','source_type','guideline','authority_tier','primary')
    ),medical_disclaimer=null,updated_at=now()
  where id=v_id;

  insert into public.content_categories(content_id,category_id,is_primary) values(v_id,v_primary,true) on conflict(content_id,category_id) do update set is_primary=true;
  insert into public.content_categories(content_id,category_id,is_primary) values(v_id,v_community,false) on conflict(content_id,category_id) do nothing;
  insert into public.content_categories(content_id,category_id,is_primary) values(v_id,v_treatment,false) on conflict(content_id,category_id) do nothing;
end $$;

commit;
