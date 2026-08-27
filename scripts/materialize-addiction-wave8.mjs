import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'data', 'addiction-atlas');
const RISK_KEYS = [
  'acute_toxicity',
  'overdose_risk',
  'dependence',
  'withdrawal_medical_risk',
  'neuro_harm',
  'cardio_harm',
  'respiratory_harm',
  'polysubstance_risk',
];

const readJson = async (name) => JSON.parse(await readFile(path.join(ROOT, name), 'utf8'));
const uniq = (values) => [...new Set(values)];
const d = (evidence_grade, source_ids, context_ar, rationale_ar) => ({ evidence_grade, source_ids, context_ar, rationale_ar });

const opioid = {
  acute_toxicity: d('B', ['who-opioid-overdose-2025-v2', 'fda-opioid-labeling-2023'], 'دليل فئوي للأفيونات يركز على التسمم الحاد وتدهور الوعي وكبت التنفس، ويُقرأ مع خصائص المادة نفسها.', 'السمية الحادة في الأفيونات مرتبطة أساساً بتثبيط الجهاز العصبي والتنفس. الدرجة ترتيبية تحريرية داخل هذا المحور وليست احتمالاً فردياً أو جرعة فاصلة.'),
  overdose_risk: d('A', ['who-opioid-overdose-2025-v2', 'fda-opioid-labeling-2023'], 'WHO وFDA يصفان الجرعة الزائدة الأفيونية كحالة قد تهدد الحياة، ويبرزان كبت التنفس كآلية مركزية.', 'وجود مسار جرعة زائدة واضح وقابل للوفاة يبرر ارتفاع هذا المحور. الرقم لا يحول بيانات السكان أو الملصقات الدوائية إلى احتمال شخصي.'),
  dependence: d('B', ['nida-opioids-current', 'fda-opioid-labeling-2023'], 'دليل فئوي على قابلية الأفيونات للاعتماد واضطراب الاستخدام؛ قوة الدليل الخاصة بالمادة قد تختلف حسب السياق العلاجي وغير الطبي.', 'يوثق المصدر الفئوي الاعتماد والإدمان كخطر جوهري للأفيونات. لا يعني ذلك أن كل تعرض يؤدي إلى اعتماد.'),
  withdrawal_medical_risk: d('B', ['nida-opioids-current', 'who-drug-withdrawal-mhgap'], 'المحور يقيّم الحاجة الطبية أثناء الانسحاب ولا يساوي شدة الانزعاج الذاتي، ولا يقدم خطة فطام منزلية.', 'الانسحاب الأفيوني قد يكون شديداً ويتطلب دعماً وعلاجاً منظماً، لكن نمط الخطر الطبي يختلف عن انسحاب الكحول أو البنزوديازيبينات؛ لذلك تبقى الدرجة محوراً مستقلاً.'),
  neuro_harm: d('C', ['nida-opioids-current', 'who-opioid-overdose-2025-v2'], 'دليل فئوي غير مباشر: تغير الوعي ونقص الأكسجة في التسمم قد يسببان أذى عصبياً؛ لا يفترض سمية عصبية نوعية لكل أفيون.', 'هذا المحور أكثر عدم يقين من كبت التنفس. الدرجة المنشورة تُحفظ مع خفض قوة الدليل كي لا تُعرض كقياس مباشر لسمية عصبية نوعية.'),
  cardio_harm: d('C', ['fda-opioid-labeling-2023'], 'دليل فئوي محدود للأثر القلبي مقارنة بمحور التنفس؛ لا تُفسر الدرجة المنخفضة كغياب للخطر أو كحماية قلبية.', 'المخاطر القلبية ليست النمط المسيطر لجميع الأفيونات وفق هذا المصدر الفئوي. لهذا تبقى قوة الدليل منخفضة ما لم توجد وثيقة خاصة بالمادة.'),
  respiratory_harm: d('A', ['who-opioid-overdose-2025-v2', 'fda-opioid-labeling-2023'], 'كبت التنفس هو آلية مركزية مثبتة في الجرعة الزائدة الأفيونية ويُعامل كمحور مستقل عن بقية الأضرار.', 'الربط المباشر بين الأفيونات وكبت التنفس المهدد للحياة يجعل هذا المحور من أقوى المحاور توثيقاً.'),
  polysubstance_risk: d('A', ['fda-opioid-labeling-2023', 'fda-opioid-cns-depressant-warning-2016'], 'FDA يحذر من الأفيونات مع البنزوديازيبينات ومثبطات الجهاز العصبي المركزي بسبب التهدئة العميقة وكبت التنفس والوفاة.', 'خطر الخلط هنا مبني على تحذير فئوي مؤسسي. لا يعني ذلك أن الأزواج غير الموجودة في سجل التفاعلات آمنة.'),
};

const stimulant = {
  acute_toxicity: d('B', ['fda-prescription-stimulants-warning-2023'], 'دليل فئوي للمنبهات يركز على السمية الحادة وفرط التنبيه، مع اختلاف شدة الصورة حسب المادة والسوق وطريق التعرض.', 'الدرجة ترتيبية تعكس إمكانية حدوث سمية حادة مهمة، وليست عتبة استخدام أو نسبة إصابة.'),
  overdose_risk: d('B', ['fda-prescription-stimulants-warning-2023'], 'FDA يبرز خطر الجرعة الزائدة عند إساءة استخدام المنبهات الموصوفة؛ المواد غير الموصوفة تحتاج أيضاً مرجعها الخاص.', 'وجود جرعات زائدة خطرة يبرر محوراً مرتفعاً، مع تجنب نقل أرقام من منبه إلى آخر.'),
  dependence: d('B', ['fda-prescription-stimulants-warning-2023'], 'الدليل الفئوي يثبت قابلية سوء الاستخدام والإدمان للمنبهات، وتضاف المراجع الخاصة بكل مادة عند توفرها.', 'الاعتماد واضطراب الاستخدام مخاطر مستقلة عن التسمم الحاد ولا يُشتق احتمال شخصي من الدرجة.'),
  withdrawal_medical_risk: d('B', ['who-drug-withdrawal-mhgap'], 'WHO توصي ببيئة داعمة لانسحاب الكوكايين والأمفيتامينات وتذكر احتمال الاكتئاب أو الذهان الذي يستلزم المراقبة المتخصصة.', 'هذا يميز الانسحاب المنبه عن الانسحابات التي قد تكون مهددة للحياة بصورة أوضح، مع بقاء المتابعة النفسية مهمة.'),
  neuro_harm: d('B', ['fda-prescription-stimulants-warning-2023'], 'يشمل المحور الاضطرابات العصبية والنفسية المرتبطة بفرط التنبيه، مع إضافة دليل المادة المباشر حيث يتوفر.', 'الدرجة لا تعني تلفاً عصبياً دائماً في كل مستخدم؛ هي تلخيص ترتيبي لنطاق أذى موثق.'),
  cardio_harm: d('B', ['fda-prescription-stimulants-warning-2023'], 'المنبهات ترفع عبء القلب والأوعية، لكن شدة الخطر تختلف بين الكوكايين والميثامفيتامين والمنبهات الموصوفة.', 'المحور مرتفع لأن القلب والأوعية من أنظمة الضرر المهمة للمنبهات، مع الاعتماد على المرجع الخاص بالمادة لرفع اليقين.'),
  respiratory_harm: d('C', ['fda-prescription-stimulants-warning-2023'], 'التنفس ليس نمط السمية المسيطر للمنبهات كما هو في الأفيونات؛ الدرجة المنخفضة لا تعني الأمان.', 'قوة الدليل منخفضة لهذا الترتيب لأنه مقارن داخل المحور ولا يمثل غياب مضاعفات تنفسية في حالات التسمم.'),
  polysubstance_risk: d('B', ['nida-fentanyl-2025'], 'NIDA توثق أن تعدد المواد، بما فيه وجود الفنتانيل مع منبهات، يزيد خطر الأذى الخطير والوفاة.', 'الخطر هنا لا يفترض أن كل عينة ملوثة أو كل خلط متساوٍ؛ إنما يمنع تفسير المنبه منفرداً بمعزل عن سوق متعدد المواد.'),
};

const benzodiazepine = {
  acute_toxicity: d('B', ['fda-benzodiazepine-boxed-warning-2020'], 'دليل فئوي للبنزوديازيبينات؛ التهدئة واضطراب الوعي مهمان، وتتصاعد الخطورة مع مثبطات CNS الأخرى.', 'الدرجة المتوسطة تحفظ الفرق بين السمية منفردة وبين الخطر المضاعف عند الخلط.'),
  overdose_risk: d('B', ['fda-benzodiazepine-boxed-warning-2020'], 'FDA يبرز مخاطر إساءة الاستخدام والجرعة الزائدة، ولا سيما مع الأفيونات أو مثبطات CNS.', 'المحور لا يُفسر كاحتمال وفاة منفرد ولا يلغي أثر الخلط الذي يعالج في محور مستقل.'),
  dependence: d('A', ['fda-benzodiazepine-boxed-warning-2020'], 'التحذير الصندوقي المحدث يذكر الإدمان والاعتماد الجسدي بوضوح على مستوى الفئة.', 'الاعتماد خطر مثبت حتى عند وجود استعمال طبي مشروع؛ التقدير لا يعني أن كل وصفة تؤدي إلى اضطراب استخدام.'),
  withdrawal_medical_risk: d('A', ['who-drug-withdrawal-mhgap', 'fda-benzodiazepine-boxed-warning-2020'], 'WHO وFDA يؤكدان أن الانسحاب غير المنضبط قد يكون شديداً، وقد تستلزم الحالات الشديدة رعاية تخصصية أو دخول المستشفى.', 'هذا محور مرتفع لأن الخطر الطبي للانسحاب مستقل عن خطر الجرعة الزائدة، ولا تُنشر منه خطة فطام ذاتي.'),
  neuro_harm: d('B', ['fda-benzodiazepine-boxed-warning-2020'], 'يشمل المحور التهدئة والاضطراب المعرفي ومضاعفات الانسحاب العصبية؛ لا يفترض سمية عصبية دائمة في كل حالة.', 'الدرجة تحفظ نطاق الأذى العصبي الوظيفي والمضاعفات دون تحويله إلى ادعاء تلف دائم شامل.'),
  cardio_harm: d('C', ['fda-benzodiazepine-boxed-warning-2020'], 'الأذى القلبي المباشر ليس محور التحذير الرئيسي لهذه الفئة مقارنة بالتهدئة والتنفس والانسحاب.', 'الدرجة المنخفضة حكم ترتيبي منخفض الثقة ولا تعني غياب المضاعفات القلبية في تسمم متعدد العوامل.'),
  respiratory_harm: d('B', ['fda-benzodiazepine-boxed-warning-2020'], 'كبت التنفس يصبح بارزاً خصوصاً مع الأفيونات ومثبطات CNS الأخرى.', 'المحور يحفظ الفرق بين الخطر التنفسي منفرداً وبين الارتفاع الشديد عند الخلط.'),
  polysubstance_risk: d('A', ['fda-benzodiazepine-boxed-warning-2020', 'fda-opioid-cns-depressant-warning-2016'], 'التحذيرات المؤسسية تربط الجمع مع الأفيونات ومثبطات CNS بالتهدئة العميقة وكبت التنفس والوفاة.', 'هذا من أقوى محاور الفئة توثيقاً، مع بقاء سجل التفاعلات مقصوراً على الأزواج التي تمت مراجعتها.'),
};

const cannabis = {
  acute_toxicity: d('B', ['nida-cannabis-current'], 'مراجعة NIDA المباشرة للقنب تشمل الاضطراب الحاد في الإدراك والتنسيق والآثار النفسية والجسدية.', 'الدرجة المنخفضة نسبياً مقارنة بمواد أخرى لا تعني أن التعرض الحاد آمن أو متوقع النتائج.'),
  overdose_risk: d('C', ['nida-cannabis-current'], 'المحور يميز بين التسمم الحاد وبين نمط الجرعة الزائدة المميتة الشائع في الأفيونات؛ الدليل لا يبرر تفسير الصفر أو الأمان.', 'تُحفظ الدرجة المنشورة كترتيب منخفض مع يقين أقل، وليس كاحتمال وفاة أو حد جرعة.'),
  dependence: d('A', ['nida-cannabis-current'], 'NIDA توثق اضطراب استخدام القنب والاعتماد لدى جزء من المستخدمين.', 'وجود قابلية للاعتماد يبرر محوراً مستقلاً، دون تعميمه على جميع المستخدمين.'),
  withdrawal_medical_risk: d('B', ['who-drug-withdrawal-mhgap'], 'WHO توصي ببيئة داعمة لانسحاب القنب ولا تصفه بنمط الاختلاجات والهذيان المميز للانسحابات الأعلى خطراً طبياً.', 'الدرجة تعكس الخطر الطبي النسبي للانسحاب ولا تنفي الأعراض أو الحاجة للدعم.'),
  neuro_harm: d('B', ['nida-cannabis-current'], 'الدليل المباشر يتناول الذاكرة والتعلم والانتباه والتنسيق ومخاطر نفسية لدى فئات معرضة.', 'المحور لا يساوي تشخيصاً عصبياً دائماً؛ هو ترتيب لنطاق التأثير العصبي/المعرفي الموثق.'),
  cardio_harm: d('B', ['nida-cannabis-current'], 'توجد تأثيرات قلبية وعائية موثقة، لكن قوة الاستدلال تختلف باختلاف المنتج والعمر والأمراض المصاحبة.', 'تبقى الدرجة متوسطة/منخفضة نسبياً ولا تعني الأمان القلبي.'),
  respiratory_harm: d('B', ['nida-cannabis-current'], 'تتعامل المراجعة مع آثار تدخين القنب على الرئة؛ لا تُنسب هذه المخاطر تلقائياً لكل شكل غير مدخن.', 'السياق مهم لأن طريق التعرض يغيّر الخطر التنفسي؛ لذلك لا يُعمم أثر الاحتراق على كل المنتجات.'),
  polysubstance_risk: d('C', ['nida-cannabis-current'], 'تعدد المواد قد يغير الأداء والإدراك والسمية، لكن الدرجة لا تُستخدم كحاسبة خلط.', 'قوة الدليل منخفضة لهذا الترتيب العام؛ لا تُستنتج سلامة أي زوج غير مراجع.'),
};

const alcohol = {
  acute_toxicity: d('A', ['who-alcohol-fact-sheet-2024'], 'WHO تصف الإيثانول كمادة سامة نفسية التأثير ومسببة للاعتماد، مع أذى حاد وإصابات وتسمم.', 'السمية الحادة قد تكون شديدة وتختلف مع السياق؛ الدرجة لا تحدد كمية آمنة.'),
  overdose_risk: d('A', ['who-alcohol-fact-sheet-2024'], 'التسمم بالكحول قد يهدد الحياة، وتزداد الخطورة مع مثبطات الجهاز العصبي الأخرى.', 'المحور مرتفع لأن فقدان الوعي والتثبيط المركزي قد يصبحان قاتلين، دون تحويل ذلك إلى جرعة تشغيلية.'),
  dependence: d('A', ['who-alcohol-fact-sheet-2024'], 'WHO توثق اضطراب استخدام الكحول والاعتماد كعبء صحي عالمي.', 'الاعتماد خطر مثبت على مستوى السكان لكنه لا يعني أن كل مستخدم سيصاب به.'),
  withdrawal_medical_risk: d('A', ['who-alcohol-withdrawal-mhgap'], 'WHO توثق اختلاجات وهذيان الانسحاب وتوصي بإدارة طبية للحالات المعرضة للانسحاب الشديد.', 'هذا يبرر أعلى فئة في خطر الانسحاب الطبي، مع حظر تحويل الإرشاد المهني إلى خطة منزلية.'),
  neuro_harm: d('A', ['who-alcohol-fact-sheet-2024'], 'يشمل عبء الكحول اضطرابات عصبية ونفسية وإصابات مرتبطة بضعف الوظائف.', 'المحور يجمع الضرر العصبي الموثق دون اختزال الآليات المتعددة في نتيجة واحدة.'),
  cardio_harm: d('A', ['who-alcohol-fact-sheet-2024'], 'WHO تربط الكحول بأمراض القلب والأوعية ضمن أكثر من 200 حالة صحية مرتبطة به.', 'وجود عبء قلبي وعائي سببي/منسوب يدعم محوراً مرتفعاً، لا مقارنة شخصية بين الأفراد.'),
  respiratory_harm: d('B', ['who-alcohol-fact-sheet-2024'], 'الخطر التنفسي يظهر خصوصاً في التسمم الشديد والشفط والخلط مع مثبطات CNS، وليس كأثر رئوي واحد بسيط.', 'الدرجة المرتفعة نسبياً تعكس التثبيط المركزي ومضاعفات التسمم، مع يقين أقل من محور الانسحاب.'),
  polysubstance_risk: d('A', ['fda-opioid-cns-depressant-warning-2016', 'fda-benzodiazepine-boxed-warning-2020'], 'الكحول مثبط CNS ويظهر صراحة في تحذيرات الجمع مع الأفيونات والبنزوديازيبينات.', 'الخطر المرتفع للخلط موثق مؤسسياً، ولا يحوّل الصفحة إلى وصفة تفاعل أو تقدير جرعة.'),
};

const nicotine = {
  acute_toxicity: d('C', ['who-tobacco-nicotine-2026'], 'WHO تثبت ضرر النيكوتين والتبغ، لكن عبء التبغ المزمن لا يساوي تلقائياً سمية النيكوتين الحادة منفرداً.', 'تُحفظ الدرجة الحالية مع خفض اليقين كي لا ننسب كل أذى منتج التبغ إلى النيكوتين وحده.'),
  overdose_risk: d('C', ['who-tobacco-nicotine-2026'], 'المصدر العام لا يقدم مقياساً شخصياً للجرعة الزائدة من النيكوتين؛ المحور هنا ترتيب محافظ.', 'الدرجة ليست حد سمية ولا ضمان أمان للمنتجات عالية التركيز.'),
  dependence: d('A', ['who-tobacco-nicotine-2026', 'who-nicotine-dependence-quit'], 'WHO تصف النيكوتين بأنه شديد الإدمان وتربط استخدام التبغ بالاعتماد والانسحاب.', 'الاعتماد هو أكثر محاور النيكوتين ثباتاً في الأدلة المؤسسية.'),
  withdrawal_medical_risk: d('B', ['who-nicotine-dependence-quit'], 'WHO تصف أعراض انسحاب النيكوتين وصعوبة الإقلاع، دون نمط الانسحاب المهدد للحياة كالكحول والبنزوديازيبينات.', 'الدرجة المنخفضة تقيس الخطر الطبي لا شدة الرغبة أو صعوبة الإقلاع.'),
  neuro_harm: d('B', ['who-tobacco-nicotine-2026'], 'WHO تنبه خصوصاً إلى ضرر النيكوتين على الأطفال والمراهقين والشباب مع استمرار نمو الدماغ.', 'المحور حساس للعمر والسياق ولا يساوي ادعاء تلف عصبي موحد لدى جميع البالغين.'),
  cardio_harm: d('C', ['who-tobacco-nicotine-2026'], 'WHO توثق عبئاً قلبياً وعائياً كبيراً للتبغ؛ نسبة هذا العبء إلى النيكوتين منفرداً محدودة في هذا المرجع.', 'يُعرض score المنشور مع درجة C منعاً للخلط بين النيكوتين كجزيء ومنتجات التبغ كتعرض مركب.'),
  respiratory_harm: d('C', ['who-tobacco-nicotine-2026'], 'الأمراض التنفسية المثبتة مرتبطة بقوة بمنتجات التبغ والاحتراق، ولا يجوز مساواتها تلقائياً بالنيكوتين منفرداً.', 'الدرجة المنخفضة لا تعني سلامة التدخين أو الاستنشاق؛ إنها تفصل هوية المادة عن أضرار وسيط التعرض.'),
  polysubstance_risk: d('C', ['who-tobacco-nicotine-2026'], 'لا يقدم المرجع العام أساساً لتوليد تفاعلات دوائية ثنائية آلياً للنيكوتين.', 'تبقى الدرجة منخفضة الثقة، وأي زوج محدد يحتاج مراجعة مستقلة قبل إظهاره كتفاعل.'),
};

const syntheticCannabinoid = {
  acute_toxicity: d('B', ['nida-synthetic-cannabinoids-current', 'euda-edr-2026-nps'], 'الفئة غير متجانسة وقد تنتج تأثيرات قوية وغير متوقعة وحالات تسمم حادة.', 'الدرجة المرتفعة تعكس عدم قابلية التنبؤ والسمية الموثقة على مستوى الفئة، لا كل مركب منفرد.'),
  overdose_risk: d('B', ['nida-synthetic-cannabinoids-current', 'euda-edr-2026-nps'], 'تقارير الفئة تشمل حالات خطرة ومهددة للحياة، مع تفاوت كبير بين المركبات والمنتجات.', 'لا تُنقل خطورة أقوى مركب إلى كل الفئة؛ لذلك يبقى الدليل فئوياً.'),
  dependence: d('B', ['nida-synthetic-cannabinoids-current'], 'توجد قابلية لسوء الاستخدام والاعتماد ضمن الفئة مع اختلاف بين النواهض الصناعية.', 'الدرجة تعكس الفئة ولا تعني تساوي كل مركب في قابلية الاعتماد.'),
  withdrawal_medical_risk: d('C', ['nida-synthetic-cannabinoids-current'], 'الانسحاب موصوف لكن قاعدة الدليل أقل اتساقاً من البنزوديازيبينات أو الكحول.', 'تبقى الدرجة المنشورة مع يقين منخفض ولا تُشتق منها خطة انسحاب ذاتي.'),
  neuro_harm: d('B', ['nida-synthetic-cannabinoids-current', 'euda-edr-2026-nps'], 'الارتباك والهلوسة والاختلاجات واضطرابات عصبية/نفسية حادة موثقة ضمن الفئة.', 'التباين الكيميائي يمنع تحويل هذا إلى توقع موحد لكل منتج.'),
  cardio_harm: d('B', ['nida-synthetic-cannabinoids-current'], 'توجد حالات تسرع قلب وارتفاع ضغط ونقص تروية ومضاعفات قلبية ضمن تقارير الفئة.', 'المحور مرتفع نسبياً لكن لا يساوي خطراً ثابتاً لكل مركب.'),
  respiratory_harm: d('C', ['nida-synthetic-cannabinoids-current'], 'المضاعفات التنفسية ممكنة في التسمم الشديد لكن قاعدة الدليل الفئوية أقل مباشرة من الأفيونات.', 'الدرجة تحفظ الخطر دون ادعاء آلية تنفسية موحدة.'),
  polysubstance_risk: d('B', ['euda-edr-2026-nps'], 'سوق NPS متعدد المواد والتكوين المتغير يجعل تفسير التعرض والخلط أكثر صعوبة.', 'لا يعني ذلك أن كل منتج متعدد المواد؛ المحور يمنع استنتاج الأمان من هوية اسمية غير مؤكدة.'),
};

const mdma = {
  acute_toxicity: d('A', ['nida-mdma-current', 'euda-edr-2026-mdma'], 'NIDA وEUDA توثقان تأثيرات حادة قد تكون خطرة، مع تفاوت في محتوى المنتجات غير المشروعة.', 'السمية الحادة تشمل فرط الحرارة واضطراب السوائل والتأثيرات القلبية/العصبية؛ الدرجة لا تحدد عتبة جرعة.'),
  overdose_risk: d('B', ['nida-mdma-current', 'euda-edr-2026-mdma'], 'يمكن أن تحدث حالات شديدة ومهددة للحياة، لكن نمط الجرعة الزائدة يختلف عن الأفيونات.', 'الدرجة ترتيبية ولا تُستخدم لتقدير احتمال وفاة شخص أو مقارنة كمية استعمال.'),
  dependence: d('B', ['nida-mdma-current'], 'NIDA تناقش قابلية اضطراب الاستخدام والاعتماد مع MDMA.', 'القابلية موجودة لكنها لا تُعرض كحتمية لكل استخدام.'),
  withdrawal_medical_risk: d('C', ['nida-mdma-current'], 'قد تحدث أعراض ما بعد الاستخدام أو التوقف، لكن الخطر الطبي للانسحاب أقل وضوحاً من الكحول والبنزوديازيبينات.', 'الدرجة المنخفضة نسبياً لا تنفي الأعراض النفسية أو الحاجة للتقييم عند الشدة.'),
  neuro_harm: d('B', ['nida-mdma-current'], 'التأثيرات السيروتونينية والعصبية والنفسية جزء أساسي من مراجعة MDMA.', 'المحور لا يدعي تلفاً دائماً موحداً؛ يصف نطاق أذى عصبي موثق.'),
  cardio_harm: d('B', ['nida-mdma-current', 'euda-edr-2026-mdma'], 'التسارع القلبي وارتفاع الضغط وفرط الحرارة قد ترفع العبء القلبي الوعائي.', 'الدرجة المرتفعة نسبياً تعكس الخطر الفيزيولوجي الحاد لا نتيجة ثابتة لكل تعرض.'),
  respiratory_harm: d('C', ['nida-mdma-current'], 'التنفس ليس الآلية السمية الأساسية في معظم مراجعات MDMA، مع إمكانية مضاعفات في الحالات الشديدة.', 'تبقى قوة الدليل منخفضة لهذا الترتيب ولا تعني الأمان التنفسي.'),
  polysubstance_risk: d('B', ['euda-edr-2026-mdma'], 'EUDA تبرز تباين قوة ومحتوى منتجات MDMA والسياق متعدد المواد في السوق.', 'عدم اليقين في المحتوى والخلط يرفع الخطر، لكن لا تُولد استنتاجات لزوج غير مراجع.'),
};

const ketamine = {
  acute_toxicity: d('B', ['nida-ketamine-current', 'euda-edr-2026-other-drugs'], 'التسمم الحاد قد يتضمن انفصالاً شديداً واضطراب الوعي والحوادث ومضاعفات جسدية.', 'الدرجة تفرق بين استخدام طبي مراقب وبين استخدام غير طبي أو تعرض غير معلوم المحتوى.'),
  overdose_risk: d('B', ['nida-ketamine-current'], 'الجرعة الزائدة والمضاعفات الشديدة ممكنة، وتتأثر بشدة عند الجمع مع مثبطات أخرى.', 'الدرجة لا تحدد كمية ولا تساوي احتمالاً شخصياً.'),
  dependence: d('B', ['nida-ketamine-current', 'euda-edr-2026-other-drugs'], 'الاعتماد واضطراب الاستخدام موثقان مع الاستخدام المتكرر غير الطبي.', 'وجود استعمال طبي مشروع لا يلغي قابلية اضطراب الاستخدام خارج الإشراف.'),
  withdrawal_medical_risk: d('C', ['nida-ketamine-current'], 'الأدلة على الانسحاب الطبي الحاد أقل من مواد مثل الكحول/GHB/البنزوديازيبينات.', 'تُحفظ الدرجة المتوسطة المنخفضة مع يقين محدود، ولا تُستنتج منها خطة توقف.'),
  neuro_harm: d('B', ['nida-ketamine-current'], 'التأثيرات الانفصالية والمعرفية والعصبية جزء مباشر من ملف الكيتامين.', 'المحور يصف أذى وظيفياً وعصبياً محتملاً ولا يساوي تلفاً دائماً في كل مستخدم.'),
  cardio_harm: d('B', ['nida-ketamine-current'], 'التغيرات القلبية الوعائية ممكنة أثناء التعرض، خاصة مع عوامل خطر أو خلط.', 'الدرجة متوسطة ولا تُفسر كخطر ثابت لدى كل شخص.'),
  respiratory_harm: d('B', ['nida-ketamine-current'], 'قد تحدث مضاعفات تنفسية ووعي خصوصاً في التسمم والخلط، مع اختلاف السياق الطبي عن غير الطبي.', 'الخطر ليس مساوياً لكبت التنفس الأفيوني لكنه يظل مهماً سريرياً.'),
  polysubstance_risk: d('A', ['nida-ketamine-current'], 'الجمع مع الكحول أو مثبطات CNS يزيد مخاطر التهدئة وفقد الوعي والمضاعفات.', 'هذا المحور مرتفع لتأثير الجمع، دون تحويل الأطلس إلى حاسبة خلط.'),
};

const ghb = {
  acute_toxicity: d('A', ['who-ghb-ecdd-2013', 'euda-edr-2026-other-drugs'], 'WHO تصف GHB كمثبط للجهاز العصبي المركزي ذي هامش أمان ضيق.', 'الهامش الضيق والتثبيط المركزي يبرران خطراً حاداً مرتفعاً، دون نشر جرعات أو حدود تشغيلية.'),
  overdose_risk: d('A', ['who-ghb-ecdd-2013'], 'تقييم WHO يوثق هامش الأمان الضيق وتقارير السمية الشديدة.', 'التغير السريع بين التأثير والتسمم الشديد يبرر أعلى فئة للجرعة الزائدة.'),
  dependence: d('A', ['who-ghb-ecdd-2013'], 'WHO تشير إلى دليل مقنع على وجود الاعتماد على GHB لدى البشر.', 'الاعتماد مثبت ولا يعني أن كل تعرض منفرد يؤدي إليه.'),
  withdrawal_medical_risk: d('A', ['who-ghb-ecdd-2013'], 'تقييم WHO يذكر متلازمات انسحاب واختلاجات انسحابية.', 'هذه المضاعفات تبرر أعلى فئة للانسحاب الطبي وتحظر تفسير الصفحة كدليل انسحاب منزلي.'),
  neuro_harm: d('B', ['who-ghb-ecdd-2013'], 'التثبيط المركزي وفقد الوعي والاختلاجات في الانسحاب تمثل عبئاً عصبياً مهماً.', 'المحور لا يدعي سمية عصبية مزمنة موحدة؛ يلتقط الخطر العصبي الحاد والانسحابي.'),
  cardio_harm: d('C', ['who-ghb-ecdd-2013'], 'الخطر القلبي ليس محور الدليل الرئيسي مقارنة بالوعي والتنفس والانسحاب.', 'تبقى الدرجة المنخفضة مع يقين محدود ولا تعني غياب المضاعفات القلبية.'),
  respiratory_harm: d('A', ['who-ghb-ecdd-2013'], 'كمثبط CNS ذي هامش أمان ضيق، يشكل التثبيط التنفسي جزءاً من السمية الشديدة.', 'المحور مرتفع سريرياً، خاصة عند وجود مثبطات أخرى.'),
  polysubstance_risk: d('A', ['who-ghb-ecdd-2013'], 'خلط مثبطات CNS يزيد التهدئة وفقد الوعي وخطر التنفس.', 'الدرجة المرتفعة لا تنشئ تلقائياً استنتاجاً لزوج لم تتم مراجعته.'),
};

const buprenorphine = {
  acute_toxicity: d('C', ['samhsa-buprenorphine-2026', 'who-opioid-overdose-2025-v2'], 'Buprenorphine دواء علاجي أفيوني جزئي؛ تقييم الخطر يجب أن يفصل الاستخدام العلاجي المراقب عن سوء الاستخدام أو الخلط.', 'تحفظ الدرجة المنشورة مع يقين منخفض للمقارنة، ولا تُستخدم لتقويض فائدته المثبتة في علاج OUD.'),
  overdose_risk: d('C', ['samhsa-buprenorphine-2026', 'who-opioid-overdose-2025-v2'], 'الخطر الأفيوني موجود، ويتغير بقوة مع السياق والخلط، بينما الدواء علاج قائم على الدليل عند استخدامه كما وُصف.', 'المحور لا يقارن مباشرةً معدل الوفاة مع نواهض كاملة ولا يساوي علاج OUD بإساءة الاستخدام.'),
  dependence: d('B', ['samhsa-buprenorphine-2026', 'nida-opioids-current'], 'بوبرينورفين ناهض جزئي أفيوني وقد يحدث اعتماد جسدي، مع كونه دواءً علاجياً معتمداً لـOUD.', 'الاعتماد الجسدي على دواء علاجي ليس مرادفاً تلقائياً للإدمان أو فشل العلاج.'),
  withdrawal_medical_risk: d('B', ['samhsa-buprenorphine-2026', 'nida-opioids-current'], 'التوقف يجب أن يكون ضمن قرار علاجي، ولا يُحوّل الأطلس إلى خطة خفض ذاتية.', 'المحور يحفظ خطر الانسحاب مع التأكيد أن استمرارية العلاج قد تكون مفيدة وضرورية.'),
  neuro_harm: d('C', ['samhsa-buprenorphine-2026'], 'لا يدعم المرجع العلاجي ادعاء سمية عصبية عالية مباشرة؛ الدرجة المنخفضة تحفظ عدم اليقين.', 'لا تُستعمل القيمة المنخفضة كإثبات أمان مطلق أو غياب تأثيرات عصبية.'),
  cardio_harm: d('C', ['samhsa-buprenorphine-2026'], 'الأذى القلبي المباشر ليس محور الدليل العلاجي الرئيسي في هذا المرجع.', 'تبقى قوة الدليل منخفضة للدرجة الترتيبية المنشورة.'),
  respiratory_harm: d('B', ['who-opioid-overdose-2025-v2', 'fda-opioid-cns-depressant-warning-2016'], 'كدواء أفيوني يظل كبت التنفس مهماً، خصوصاً مع مثبطات CNS، رغم اختلاف ملفه عن النواهض الكاملة.', 'الدرجة لا تلغي فائدة العلاج ولا تبرر خفض الإشراف عند الخلط.'),
  polysubstance_risk: d('A', ['fda-opioid-cns-depressant-warning-2016', 'fda-benzodiazepine-boxed-warning-2020'], 'FDA يحذر من المخاطر عند الجمع بين أدوية علاج OUD والبنزوديازيبينات/مثبطات CNS، مع التأكيد على الإدارة الطبية بدلاً من حجب العلاج تلقائياً.', 'الخطر المرتفع للخلط يجب أن يقود إلى إدارة سريرية، لا إلى وصم الدواء العلاجي أو إيقافه عشوائياً.'),
};

const nitazenes = {
  acute_toxicity: d('B', ['who-cnd-nps-control-2026', 'euda-edr-2026-nps'], 'النيتازينات فئة أفيونية صناعية جديدة عالية الخطورة مع تقارير تسمم ووفيات؛ التباين بين المركبات يمنع تعميم رقم قوة واحد.', 'المحور مرتفع بسبب السمية الأفيونية الشديدة الموثقة على مستوى الفئة، دون تحويل ذلك إلى نسبة قوة أو جرعة.'),
  overdose_risk: d('A', ['who-cnd-nps-control-2026', 'euda-edr-2026-nps'], 'تقارير WHO/EUDA تربط نيتازينات حديثة بجرعات زائدة قاتلة وغير قاتلة.', 'هذا يدعم أعلى فئة لخطر الجرعة الزائدة مع إبقاء المقارنة نوعية لا تشغيلية.'),
  dependence: d('B', ['who-cnd-nps-control-2026'], 'الآلية الأفيونية وإشارات سوء الاستخدام تدعم قابلية اعتماد مرتفعة على مستوى الفئة.', 'قوة الدليل أقل من مواد أقدم ذات تاريخ سريري طويل، لذلك لا تُرفع إلى A تلقائياً.'),
  withdrawal_medical_risk: d('U', [], 'لا توجد في الطبقة الحالية قاعدة دليل كافية لتثبيت درجة ترتيبية مسؤولة للانسحاب الطبي على مستوى فئة النيتازينات.', 'يبقى المحور غير محسوم ولا يجوز استنتاج درجة من كون المادة أفيونية فقط.'),
  neuro_harm: d('C', ['who-cnd-nps-control-2026'], 'الأذى العصبي قد ينتج من نقص الأكسجة وفقد الوعي في التسمم؛ لا توجد هنا قاعدة كافية لسمية عصبية نوعية لكل مركب.', 'الدرجة المنشورة تُحفظ مع دليل منخفض الثقة وفصل صريح عن السمّية العصبية المباشرة.'),
  cardio_harm: d('C', ['who-cnd-nps-control-2026'], 'لا يتيح الدليل الفئوي الحالي توصيفاً قلبياً دقيقاً لكل نيتازين.', 'تُحفظ الدرجة المنخفضة مع يقين C ولا تُفهم كغياب خطر قلبي.'),
  respiratory_harm: d('A', ['who-cnd-nps-control-2026', 'who-opioid-overdose-2025-v2'], 'بوصفها أفيونات صناعية قوية، كبت التنفس هو آلية مركزية للجرعة الزائدة.', 'هذا من أقوى المحاور المدعومة فئوياً ويبرر أعلى فئة.'),
  polysubstance_risk: d('B', ['euda-edr-2026-nps', 'who-opioid-overdose-2025-v2'], 'الظهور في سوق مواد غير منظمة وتعدد المواد يزيد صعوبة تحديد التعرض ومخاطر التسمم.', 'لا يفترض أن كل عينة مختلطة؛ إنما يمنع استنتاج الأمان في غياب تحليل أو مراجعة زوجية.'),
};

function withSource(profile, sourceId, gradeOverrides = {}) {
  return Object.fromEntries(RISK_KEYS.map((key) => [key, {
    ...profile[key],
    evidence_grade: gradeOverrides[key] ?? profile[key].evidence_grade,
    source_ids: uniq([sourceId, ...profile[key].source_ids]),
  }]));
}

function mergeProfile(profile, overrides = {}) {
  return Object.fromEntries(RISK_KEYS.map((key) => [key, { ...profile[key], ...(overrides[key] ?? {}) }]));
}

const configs = {
  fentanyl: withSource(opioid, 'nida-fentanyl-2025', { acute_toxicity: 'A', dependence: 'A', neuro_harm: 'B' }),
  heroin: withSource(opioid, 'nida-heroin-current', { acute_toxicity: 'A', dependence: 'A', neuro_harm: 'B' }),
  morphine: withSource(opioid, 'nida-prescription-medicines-current'),
  oxycodone: withSource(opioid, 'nida-prescription-medicines-current'),
  tramadol: mergeProfile(withSource(opioid, 'nida-prescription-medicines-current'), {
    neuro_harm: d('A', ['fda-tramadol-label-2023'], 'الملصق الرسمي لـtramadol يوثق اختلاجات يمكن أن تحدث حتى ضمن الجرعات الموصوفة ومتلازمة السيروتونين كخطر عصبي نوعي.', 'وجود خطر اختلاجات نوعي يبرر رفع يقين هذا المحور مقارنة بتعميم أفيوني فقط.'),
    respiratory_harm: d('A', ['fda-tramadol-label-2023', 'who-opioid-overdose-2025-v2'], 'الملصق الرسمي يذكر كبت التنفس المهدد للحياة ضمن التحذيرات الأفيونية.', 'الخطر التنفسي مثبت مباشرة، مع حظر تحويل الملصق إلى إرشادات جرعة.'),
    polysubstance_risk: d('A', ['fda-tramadol-label-2023', 'fda-opioid-cns-depressant-warning-2016'], 'التداخل مع مثبطات CNS والمواد التي تخفض عتبة الاختلاج قد يزيد الخطر.', 'يظل كل زوج بحاجة إلى مراجعة مستقلة قبل إضافته لسجل التفاعلات.'),
  }),
  methadone: mergeProfile(withSource(opioid, 'samhsa-methadone-2026'), {
    acute_toxicity: d('A', ['fda-methadone-label-2025', 'samhsa-methadone-2026'], 'Methadone ناهض أفيوني طويل المفعول وعلاج معتمد، لكن الملصق الرسمي يبرز مخاطر السمية التنفسية عند التعرض غير الآمن.', 'الفائدة العلاجية لا تلغي خطر السمية، كما أن الخطر لا يبرر وصم العلاج المنضبط.'),
    overdose_risk: d('A', ['fda-methadone-label-2025'], 'الملصق الرسمي يتضمن تحذيراً من كبت التنفس المهدد للحياة والجرعة الزائدة.', 'المحور مرتفع مع ضرورة التمييز بين وصف علاجي مضبوط وإساءة الاستخدام.'),
    cardio_harm: d('A', ['fda-methadone-label-2025'], 'الملصق الرسمي الحديث يتضمن تحذيراً صريحاً من إطالة QT واضطرابات نظم خطرة.', 'هذا دليل خاص بالمادة يبرر يقيناً عالياً للمحور القلبي، لا تعميماً على كل الأفيونات.'),
    respiratory_harm: d('A', ['fda-methadone-label-2025'], 'كبت التنفس المهدد للحياة تحذير رسمي خاص بـmethadone.', 'يُعرض كخطر سريري لا كتعليمات جرعة.'),
    polysubstance_risk: d('A', ['fda-methadone-label-2025', 'fda-benzodiazepine-boxed-warning-2020'], 'الجمع مع البنزوديازيبينات أو مثبطات CNS قد يؤدي إلى تهدئة عميقة وكبت تنفس ووفاة.', 'لا يعني التحذير حجب MOUD تلقائياً؛ بل إدارة الخطر طبياً.'),
  }),
  buprenorphine,
  cocaine: withSource(stimulant, 'nida-cocaine-current', { acute_toxicity: 'A', dependence: 'A', neuro_harm: 'A', cardio_harm: 'A' }),
  methamphetamine: withSource(stimulant, 'nida-methamphetamine-current', { acute_toxicity: 'A', dependence: 'A', neuro_harm: 'A', cardio_harm: 'A' }),
  amphetamine: withSource(stimulant, 'euda-edr-2026-synthetic-stimulants'),
  cannabis,
  alcohol,
  nicotine,
  'synthetic-cannabinoids': syntheticCannabinoid,
  alprazolam: benzodiazepine,
  diazepam: benzodiazepine,
  mdma,
  ketamine,
  ghb,
  nitazenes,
};

const substanceManifest = await readJson('substance-waves.json');
const waves = await Promise.all(substanceManifest.waves.map((entry) => readJson(entry.split('/').pop())));
const substances = waves.flatMap((wave) => wave.substances ?? []);
const bySlug = new Map(substances.map((item) => [item.slug, item]));

const selectedSlugs = Object.keys(configs);
if (selectedSlugs.length !== 20) throw new Error(`Wave 8 expected 20 selected substances, got ${selectedSlugs.length}`);

const evidenceManifest = await readJson('risk-evidence-manifest.json');
const existingEvidenceFiles = evidenceManifest.waves.map((entry) => entry.split('/').pop());
const existingEvidence = (await Promise.all(existingEvidenceFiles.map(readJson))).flatMap((wave) => wave.records ?? []);
const alreadyCovered = new Set(existingEvidence.map((item) => item.substance_slug));
for (const slug of selectedSlugs) {
  if (!bySlug.has(slug)) throw new Error(`Wave 8 references missing substance: ${slug}`);
  if (alreadyCovered.has(slug)) throw new Error(`Wave 8 would duplicate existing evidence record: ${slug}`);
}

const sourceFiles = (await readdir(ROOT)).filter((name) => /^source-registry-v\d+\.json$/.test(name)).sort();
const registries = await Promise.all(sourceFiles.map(readJson));
const sourceIds = new Set(registries.flatMap((registry) => registry.sources ?? []).map((source) => source.id));

const records = selectedSlugs.map((slug) => {
  const substance = bySlug.get(slug);
  const profile = configs[slug];
  const dimensions = {};
  for (const key of RISK_KEYS) {
    const score = substance.risk[key];
    const cfg = profile[key];
    if (!cfg) throw new Error(`Wave 8 missing profile cell: ${slug}.${key}`);
    if (score === null && cfg.evidence_grade !== 'U') throw new Error(`Wave 8 null score must be U: ${slug}.${key}`);
    if (score !== null && cfg.evidence_grade === 'U') throw new Error(`Wave 8 U grade must have null score: ${slug}.${key}`);
    if (cfg.evidence_grade !== 'U' && !cfg.source_ids.length) throw new Error(`Wave 8 evidence cell missing sources: ${slug}.${key}`);
    for (const sourceId of cfg.source_ids) if (!sourceIds.has(sourceId)) throw new Error(`Wave 8 unresolved source ${sourceId} at ${slug}.${key}`);
    dimensions[key] = {
      score,
      evidence_grade: cfg.evidence_grade,
      source_ids: cfg.source_ids,
      context_ar: cfg.context_ar,
      rationale_ar: cfg.rationale_ar,
    };
  }
  return { substance_slug: slug, dimensions };
});

const wave = {
  schema_version: 'rawafid-addiction-atlas-risk-evidence-v8',
  wave: 'wave-8-core-evidence-coverage',
  updated_on: '2026-08-27',
  policy_ar: 'الموجة الثامنة توسع التتبع محوراً بمحور للمواد المركزية الموجودة بالفعل، ولا تضيف أرقام خطر جديدة ولا تغير الدرجات المنشورة. الدليل الفئوي موسوم بوضوح كدليل فئوي، والدليل الخاص بالمادة يرفع اليقين فقط في المحور الذي يدعمه. كل score ترتيب تحريري داخل المحور وليس احتمالاً شخصياً أو جرعة أو نسبة قوة. أي U يبقى null، ولا يستنتج الأمان من انخفاض الدرجة أو غياب تفاعل مراجع.',
  records,
};

await writeFile(path.join(ROOT, 'risk-evidence-v8.json'), `${JSON.stringify(wave, null, 2)}\n`, 'utf8');
const wavePath = '/data/addiction-atlas/risk-evidence-v8.json';
if (!evidenceManifest.waves.includes(wavePath)) evidenceManifest.waves.push(wavePath);
evidenceManifest.updated_on = '2026-08-27';
await writeFile(path.join(ROOT, 'risk-evidence-manifest.json'), `${JSON.stringify(evidenceManifest, null, 2)}\n`, 'utf8');

console.log(`Wave 8 materialized: ${records.length} substances / ${records.length * RISK_KEYS.length} evidence cells.`);
