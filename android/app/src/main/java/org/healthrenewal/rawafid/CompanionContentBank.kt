package org.healthrenewal.rawafid

import android.content.Context
import org.json.JSONArray
import java.time.LocalDate
import java.time.LocalDateTime
import kotlin.math.absoluteValue

data class CompanionMessage(val id: String, val tags: Set<String>, val text: String)

object CompanionContentBank {
    private const val PREFS = "rawafid_women_companion_v1"
    private const val HISTORY = "message_history_v2"
    private const val HISTORY_LIMIT = 48

    private val messages = listOf(
        CompanionMessage("check-01", setOf("checkin","general"), "كيف حالك فعلًا الآن؟ ليس كيف يفترض أن تكوني. اختاري شعورك كما هو، ثم اختاري شيئًا واحدًا تحتاجينه في الساعة القادمة."),
        CompanionMessage("check-02", setOf("checkin","general"), "مررت لأطمئن عليكِ. هل جسدك مرتاح؟ هل ذهنك مزدحم؟ هل تحتاجين ماءً، طعامًا، هدوءًا، حركةً لطيفة، أم شخصًا آمنًا يسمعك؟"),
        CompanionMessage("check-03", setOf("checkin","general"), "توقفي لحظة قبل أن تكملي يومك: أين كتفاك الآن؟ كيف تنفسك؟ هل تؤلمين في مكان تجاهلته لأنك كنت منشغلة؟"),
        CompanionMessage("check-04", setOf("checkin","general"), "سؤال صغير لكِ وحدك: ما الشيء الذي لو خفّ درجة واحدة سيجعل بقية اليوم أسهل؟ ابدئي به، لا بكل شيء."),
        CompanionMessage("check-05", setOf("checkin","general"), "هل أكلتِ؟ هل شربتِ؟ هل تحركتِ من مكانك؟ أحيانًا يحتاج اليوم إلى أساسيات بسيطة قبل أي نصيحة كبيرة."),
        CompanionMessage("check-06", setOf("checkin","general"), "كيف طاقتك من خمس؟ إذا كانت منخفضة، فلن نطلب منك يومًا كاملًا بطاقة لا تملكينها. سنعيد ترتيب الأولويات فقط."),
        CompanionMessage("check-07", setOf("checkin","general"), "ماذا تشعرين الآن في جسدك قبل أن تسمي شعورك النفسي؟ شدّ؟ ثقل؟ صداع؟ تعب؟ راحة؟ ملاحظة الجسد تساعدك على فهم ما تحتاجينه."),
        CompanionMessage("check-08", setOf("checkin","general"), "هل هناك شيء تؤجلينه لأنه يزعجك كلما تذكرتِه؟ لا تحليه الآن إن لم تستطيعي؛ فقط اكتبيه وحددي متى ستعودين إليه."),
        CompanionMessage("check-09", setOf("checkin","general"), "أنا هنا لأذكرك بالسؤال الذي يضيع وسط المسؤوليات: وأنتِ، ماذا تحتاجين اليوم؟"),
        CompanionMessage("check-10", setOf("checkin","general"), "قبل الرسالة التالية أو المهمة التالية، أعطي نفسك ثلاثين ثانية بلا طلبات. راقبي تنفسك فقط ثم قرري ما الخطوة التالية."),

        CompanionMessage("soft-01", setOf("soothing","anxious"), "لا تحاولي إقناع نفسك أن كل شيء بخير إن لم يكن كذلك. يكفي أن تقولي: هذا صعب الآن، وسأتعامل مع أقرب جزء منه فقط."),
        CompanionMessage("soft-02", setOf("soothing","anxious"), "إذا كان ذهنك يقفز بين عشر مشكلات، اختاري واحدة فقط: ما الذي يحتاج قرارًا الآن؟ وما الذي يستطيع الانتظار؟"),
        CompanionMessage("soft-03", setOf("soothing","anxious"), "ضعي قدميك على الأرض، أرخِي الفك والكتفين، وانظري حولك. لا نحتاج إلى حل المستقبل في هذه الدقيقة."),
        CompanionMessage("soft-04", setOf("soothing","anxious"), "القلق يحب الاحتمالات المفتوحة. اكتبي ما تعرفينه يقينًا، وما لا تعرفينه، وما يمكنك فعله اليوم. اتركي الباقي خارج هذه الساعة."),
        CompanionMessage("soft-05", setOf("soothing","tired"), "التعب ليس فشلًا في الانضباط. إذا كانت طاقتك منخفضة، قللي الحمل بدل أن ترفعي اللوم."),
        CompanionMessage("soft-06", setOf("soothing","tired"), "ليس مطلوبًا أن يكون يومك منتجًا حتى يكون يومًا جيدًا. أحيانًا النجاح هو أن تمرّي به دون استنزاف إضافي."),
        CompanionMessage("soft-07", setOf("soothing","sad"), "إذا كان مزاجك منخفضًا، لا تجبري نفسك على مشاعر مشرقة. ابحثي فقط عن شيء لطيف ومحايد: ضوء، هواء، ماء، صوت تحبينه، أو شخص آمن."),
        CompanionMessage("soft-08", setOf("soothing","sad"), "هناك فرق بين أن تكوني وحدك وأن تبقي وحدك مع كل شيء. إن احتجتِ، أرسلي لشخص تثقين به جملة بسيطة: هل لديك وقت لتسمعني؟"),
        CompanionMessage("soft-09", setOf("soothing","general"), "خذي يومك بالحجم الذي تستطيعين حمله، لا بالحجم الذي كنتِ تتمنين حمله صباحًا."),
        CompanionMessage("soft-10", setOf("soothing","general"), "يمكنك أن تبدلي الخطة دون أن تعتذري لنفسك. الخطة تخدمك أنتِ، وليست امتحانًا لكفاءتك."),

        CompanionMessage("mot-01", setOf("motivation","general"), "لا تحتاجين قفزة كبيرة اليوم. خطوة صغيرة واضحة أفضل من خطة عظيمة تؤجَّل."),
        CompanionMessage("mot-02", setOf("motivation","general"), "اختاري مهمة واحدة لو اكتملت ستشعرين أن اليوم تحرك في الاتجاه الصحيح، وابدئي بها."),
        CompanionMessage("mot-03", setOf("motivation","general"), "التقدم الهادئ لا يبدو دراميًا، لكنه يتراكم. لا تقللي من قيمة ما تفعلينه باستمرار."),
        CompanionMessage("mot-04", setOf("motivation","general"), "لا تقارني سرعتك اليوم بطاقة يوم آخر. اعملي بما لديك الآن."),
        CompanionMessage("mot-05", setOf("motivation","general"), "أغلقي دائرة واحدة: رسالة، ترتيب صغير، كوب ماء، أو عشر دقائق لمهمة. الإغلاق الصغير يخفف ازدحام الذهن."),
        CompanionMessage("mot-06", setOf("motivation","general"), "قبل أن تقولي لا أستطيع، صغّري المهمة. ما النسخة التي تستطيعين فعلها في خمس دقائق؟"),
        CompanionMessage("mot-07", setOf("motivation","general"), "لا تنتظري المزاج المثالي لتبدئي. ابدئي بخطوة سهلة، ثم دعي الحركة تولد بعض الدافع."),
        CompanionMessage("mot-08", setOf("motivation","general"), "كل ما عليك الآن هو القرار التالي، لا الخطة كلها."),
        CompanionMessage("mot-09", setOf("motivation","general"), "احتفظي بشيء واحد نجح اليوم، حتى لو كان بسيطًا. دماغك يتذكر النقص أسرع من التقدم إن لم تنتبهي له."),
        CompanionMessage("mot-10", setOf("motivation","general"), "المرونة قوة عملية: غيري الوقت، قسمي المهمة، اطلبي مساعدة، أو أجلي ما لا يحتمل اليوم."),

        CompanionMessage("care-01", setOf("care","general"), "هل مر وقت طويل وأنتِ تهتمين بكل من حولك؟ خصصي عشر دقائق لكِ بلا خدمة لأحد وبلا تبرير."),
        CompanionMessage("care-02", setOf("care","general"), "تفقدي احتياجاتك الأساسية الآن: ماء، طعام، حمام، دواء موصوف، راحة، حركة، أو نوم. اختاري الناقص أولًا."),
        CompanionMessage("care-03", setOf("care","general"), "رتبي مكانًا صغيرًا حولك بدل البيت كله. مساحة هادئة بحجم كرسي وطاولة قد تغيّر شعورك أكثر مما تتوقعين."),
        CompanionMessage("care-04", setOf("care","general"), "اختاري شيئًا واحدًا يريح جسدك: ملابس مريحة، تغيير وضعية، غسل الوجه، دش، أو تهوية الغرفة."),
        CompanionMessage("care-05", setOf("care","general"), "العناية ليست مكافأة بعد الإنهاك. ضعيها داخل اليوم قبل أن تصلي إلى آخر طاقتك."),
        CompanionMessage("care-06", setOf("care","general"), "هل تحتاج بشرتك أو شعرك أو جسدك عناية اليوم؟ اجعليها روتين راحة لا قائمة معايير جمال."),
        CompanionMessage("care-07", setOf("care","general"), "اليوم ليس مناسبًا لكل شيء. اختاري ما يحافظ على راحتك وصحتك واتركي الكمال خارج الخطة."),
        CompanionMessage("care-08", setOf("care","general"), "حضري لنفسك شيئًا يسهل المساء: ماء قربك، ملابس مريحة، دواؤك الموصوف في وقته، أو تجهيز بسيط لصباح الغد."),

        CompanionMessage("sleep-01", setOf("sleep","tired"), "إذا كان نومك سيئًا، لا تعاقبي نفسك بمزيد من الضغط. خففي القرارات المعقدة اليوم قدر الإمكان وحاولي حماية موعد نومك القادم."),
        CompanionMessage("sleep-02", setOf("sleep","general"), "قبل النوم بوقت، اختاري نهاية هادئة لليوم: إضاءة أقل، مهمة أقل، وشاشة أقل إن استطعتِ."),
        CompanionMessage("sleep-03", setOf("sleep","general"), "إذا كان ذهنك يكرر مهام الغد، اكتبيها خارج رأسك. القائمة على الورق لا تحتاج أن تسهر معك."),
        CompanionMessage("sleep-04", setOf("sleep","general"), "لا تطاردي النوم بالقوة. جهزي بيئة أهدأ، خففي المحفزات، ودعي جسمك ينتقل تدريجيًا من النشاط إلى الراحة."),
        CompanionMessage("sleep-05", setOf("sleep","general"), "راقبي لعدة أيام ما الذي يسبق ليالي النوم الأفضل لديك: وقت الكافيين، القيلولة، الشاشة، الألم، أو القلق. الأنماط أهم من ليلة واحدة."),

        CompanionMessage("head-01", setOf("headache","pain"), "سجلي وقت الصداع وشدته وما سبقه: نوم قليل، جوع، توتر، دورة، شاشة، أو شيء آخر. التتبع يساعدك على وصف النمط لمختصة إذا تكرر."),
        CompanionMessage("head-02", setOf("headache","pain"), "خففي الضوء والشاشة إن كانا يزيدان الصداع، واشربي أو كلي إذا كان ذلك مناسبًا لك ولم تكوني فعلتِ. إذا كان الصداع شديدًا جدًا أو غير معتاد فاطلبي تقييمًا مناسبًا."),
        CompanionMessage("head-03", setOf("headache","pain"), "لا تكتفي بتسجيل وجود الصداع. لاحظي: أين؟ متى بدأ؟ هل معه غثيان أو حساسية للضوء؟ ما مدته؟ هذه التفاصيل مفيدة عند التقييم الطبي."),
        CompanionMessage("head-04", setOf("headache","pain"), "إذا أصبح الصداع نمطًا متكررًا، اجمعي سجلًا لبضعة أسابيع بدل محاولة تذكر التفاصيل لاحقًا."),

        CompanionMessage("social-01", setOf("social","isolation"), "إذا رغبتِ بالعزلة، اسألي نفسك: هل أحتاج هدوءًا صحيًا، أم أنني أبتعد لأنني لا أريد أن أشرح تعبي؟ كلاهما مفهوم، لكن الثاني قد يستفيد من شخص آمن واحد."),
        CompanionMessage("social-02", setOf("social","isolation"), "لا تحتاجين محادثة طويلة. يمكنك أن ترسلي: يومي ثقيل، هل تبقى معي قليلًا؟"),
        CompanionMessage("social-03", setOf("social","connection"), "اختاري شخصًا ترتاحين معه لا شخصًا يتطلب منك أداءً اجتماعيًا. التواصل الذي يريحك هو المطلوب الآن."),
        CompanionMessage("social-04", setOf("social","connection"), "إذا كنت لا تريدين نصائح، قولي ذلك بوضوح: أحتاج أن تسمعني فقط، وسأطلب رأيك إذا احتجته."),
        CompanionMessage("social-05", setOf("social","general"), "افحصي أثر الأشخاص عليكِ بعد اللقاء: هل تشعرين أهدأ، أم أصغر، أم مذنبة، أم مستنزفة؟ هذا أيضًا جزء من فهم حدودك."),

        CompanionMessage("bound-01", setOf("boundaries","safety"), "من حقك أن تقولي: لا أستطيع الآن. لا أحتاج أن يكون لديك سبب كبير حتى يكون حدك مشروعًا."),
        CompanionMessage("bound-02", setOf("boundaries","safety"), "إذا ضغط عليك أحد لقرار لا ترتاحين له، خذي وقتًا قبل الإجابة. الاستعجال ليس دليلًا على أن عليك الموافقة."),
        CompanionMessage("bound-03", setOf("boundaries","safety"), "يمكنك أن تغيري رأيك عندما تتغير المعلومات أو عندما تشعرين بعدم الارتياح."),
        CompanionMessage("bound-04", setOf("boundaries","safety"), "الشخص الآمن يحترم لا، ويحترم الوقت، ولا يجعل محبتك أو ولاءك ثمنًا لموافقتك."),
        CompanionMessage("bound-05", setOf("boundaries","safety"), "إذا شعرتِ بالخوف من رد فعل شخص على حد بسيط، فالمشكلة ليست في صياغتك فقط. ضعي الأمان أولًا واستعيني بمن تثقين به عند الحاجة."),
        CompanionMessage("bound-06", setOf("boundaries","general"), "جملة اليوم: أحتاج وقتًا لأفكر وسأعود إليك. احتفظي بها عندما لا تريدين قرارًا فوريًا."),

        CompanionMessage("period-01", setOf("period","cycle"), "لا تنظري إلى يوم واحد وحده. سجلي النزف والألم والمزاج والطاقة والنوم، ثم راقبي النمط عبر عدة دورات."),
        CompanionMessage("period-02", setOf("period","cycle"), "إذا تغيرت دورتك عن المعتاد لديك، سجلي ما تغير ومتى بدأ. التغيير المستمر أو المقلق يستحق مناقشة مع مختصة."),
        CompanionMessage("period-03", setOf("period","cycle"), "الألم الذي يمنعك من نشاطك المعتاد ليس شيئًا يجب أن تتجاهليه فقط لأنه مرتبط بالدورة. سجليه واطلبي تقييمًا إذا كان شديدًا أو متكررًا."),
        CompanionMessage("period-04", setOf("period","cycle"), "راقبي كمية النزف بصورة وصفية بدل محاولة تخمين رقم دقيق: خفيف، متوسط، غزير، مع وجود تكتلات أو تسربات غير معتادة إن وجدت."),
        CompanionMessage("period-05", setOf("period","cycle"), "إذا كنت تعرفين نمطك المعتاد، تصبح الملاحظة أقوى: ما المختلف هذه المرة؟ المدة؟ الكمية؟ الألم؟ التوقيت؟"),
        CompanionMessage("period-06", setOf("period","cycle"), "لا تستخدمي توقعات التقويم لمنع الحمل. الدورة قد تتغير، والتقديرات ليست اختبار إباضة أو وسيلة منع حمل."),
        CompanionMessage("period-07", setOf("period","cycle"), "سجلي الصداع أو اضطراب النوم أو تغير الطاقة بجانب أيام الدورة إذا لاحظتِ ارتباطًا؛ الرفيقة ستعرض النمط وصفيًا فقط دون افتراض السبب."),
        CompanionMessage("period-08", setOf("period","cycle"), "عندما يكون النزف غزيرًا على نحو غير معتاد، راقبي شعورك العام أيضًا. الدوخة الشديدة أو ضيق النفس أو ألم الصدر مع نزف شديد يحتاج عناية عاجلة."),

        CompanionMessage("breast-01", setOf("breast","awareness"), "اليوم مساحة قصيرة لصحة الثدي، لا اختبارًا تخافين منه. أثناء الاستحمام أو ارتداء الملابس لاحظي ما هو طبيعي لديك في الشكل والإحساس."),
        CompanionMessage("breast-02", setOf("breast","awareness"), "لا تحتاجين إلى فحص شهري صارم بخطوات ثابتة. المطلوب أن تعرفي المعتاد لديك حتى تنتبهي إلى تغير جديد."),
        CompanionMessage("breast-03", setOf("breast","awareness"), "انتبهي إلى كتلة جديدة، تغير واضح في الجلد مثل التنقر أو السماكة أو الاحمرار غير المفسر، أو تغير جديد في الحلمة. التغير الجديد يستحق إبلاغ مختصة."),
        CompanionMessage("breast-04", setOf("breast","awareness"), "إذا ظهر إفراز جديد غير متوقع من الحلمة، أو ألم موضعي يزداد، أو تغير لا يختفي، سجليه ولا تحاولي تشخيصه بنفسك."),
        CompanionMessage("breast-05", setOf("breast","awareness"), "معرفة ثدييك لا تستبدل التصوير أو الفحوص المناسبة لعمرك وخطورتك. استخدمي الوعي الذاتي لاكتشاف تغير ثم اتركي التقييم لمختصة."),
        CompanionMessage("breast-06", setOf("breast","awareness"), "إن لاحظتِ شيئًا جديدًا، اكتبي مكانه ووقت ملاحظته وما إذا كان يتغير. هذه المعلومات تساعد عند التواصل مع مقدمة الرعاية."),
        CompanionMessage("breast-07", setOf("breast","awareness"), "لا تفترضي الأسوأ عند أي تغير؛ كثير من تغيرات الثدي حميدة. لكن الجديد أو المستمر يستحق التقييم بدل القلق الصامت."),
        CompanionMessage("breast-08", setOf("breast","awareness"), "خصصنا اليوم للوعي بصحة الثدي: دقيقتان للملاحظة، ثم عودي ليومك. الهدف معرفة المعتاد لديك، لا البحث القهري عن مشكلة."),

        CompanionMessage("pelvic-01", setOf("pelvic","pain"), "إذا ظهر ألم حوض جديد، سجلي مكانه ووقته وما إذا كان مرتبطًا بالدورة أو التبول أو الأكل أو النشاط. النمط يساعد في التقييم."),
        CompanionMessage("pelvic-02", setOf("pelvic","pain"), "ألم الحوض المتكرر أو الذي يعيق نشاطك ليس تفصيلًا صغيرًا. لا تعتادي عليه فقط لأنك تحملته من قبل."),
        CompanionMessage("pelvic-03", setOf("pelvic","general"), "لاحظي أي تغير جديد في التبول أو الإفرازات أو الألم أثناء العلاقة، وسجليه إن استمر بدل أن تحاولي تفسيره وحدك."),
        CompanionMessage("pelvic-04", setOf("pelvic","safety"), "الألم المفاجئ الشديد، الإغماء، الحمى مع ألم حوض، أو احتمال الحمل مع ألم شديد/نزف يستحق تقييمًا عاجلًا."),

        CompanionMessage("selfcare-01", setOf("selfcare","routine"), "مفاجأة اليوم: خصصتِ لنفسك وقت العناية الشخصية. حضري منشفة وملابس مريحة ومنتجاتك المعتادة، وأغلقي باب الطلبات قليلًا."),
        CompanionMessage("selfcare-02", setOf("selfcare","routine"), "يوم العناية ليس مشروع تجميل. ابدئي بدش مريح، تفقدي جلدك وشعرك بلطف، وافعلي فقط ما يجعلك أنظف وأهدأ وأكثر راحة."),
        CompanionMessage("selfcare-03", setOf("selfcare","routine"), "قبل الدش: جهزي كل شيء حتى لا يتحول الوقت إلى مقاطعات. بعده: ماء، ملابس مريحة، وعشر دقائق بلا استعجال إن استطعتِ."),
        CompanionMessage("selfcare-04", setOf("selfcare","routine"), "خلال العناية لاحظي أي تغير جسدي جديد أو مستمر يلفت انتباهك. لا تشخصيه من التطبيق؛ سجليه واطلبي رأيًا مهنيًا إذا كان مقلقًا."),
        CompanionMessage("selfcare-05", setOf("selfcare","routine"), "اسألي نفسك بعد العناية: ما الشيء الصغير الذي جعلني أشعر أفضل؟ احتفظي به لروتينك القادم واتركي ما لم يفدك."),
        CompanionMessage("selfcare-06", setOf("selfcare","routine"), "اليوم لكِ ربع ساعة فقط. لا نحتاج قائمة طويلة: دش، عناية بسيطة، تغيير ملابس، وترتيب صغير لمكان راحتك."),

        CompanionMessage("meno-01", setOf("perimenopause","cycle"), "إذا بدأت الدورة تتغير في التوقيت أو الكمية مع تغيرات في النوم أو الحرارة أو المزاج، سجلي الأنماط. لا تفترضي أن كل عرض سببه مرحلة ما قبل انقطاع الطمث دون تقييم."),
        CompanionMessage("meno-02", setOf("perimenopause","sleep"), "تغير النوم والهبات الساخنة قد يرهقان اليوم. اجمعي سجلًا للأعراض وتوقيتها لتناقشي الخيارات المناسبة مع مختصة."),
        CompanionMessage("meno-03", setOf("perimenopause","general"), "أي نزف بعد انقطاع الطمث يحتاج تواصلًا مع مقدمة رعاية لتقييمه، حتى لو كان قليلًا."),
        CompanionMessage("meno-04", setOf("perimenopause","general"), "هذه المرحلة ليست اختبار تحمل. الأعراض التي تعطل النوم أو العمل أو العلاقة تستحق مناقشة خيارات المساعدة المتاحة."),

        CompanionMessage("preg-01", setOf("pregnancy","general"), "في الحمل، لا تستخدمي رفيقة روافد بدل متابعة الحمل. سجلي الأعراض والأسئلة، وخذي أي تغير مقلق إلى مقدمة الرعاية التي تعرف حملك."),
        CompanionMessage("preg-02", setOf("pregnancy","safety"), "الصداع الشديد المستمر، ضيق النفس، ألم الصدر، نزف، أو شعور قوي بأن شيئًا ليس طبيعيًا يستحق تواصلًا عاجلًا مع فريق الرعاية أثناء الحمل."),
        CompanionMessage("preg-03", setOf("pregnancy","care"), "احتياجاتك في الحمل قد تتغير من أسبوع لآخر. عدلي الراحة والطعام والنشاط وفق إرشادات مقدمة الرعاية ولا تقارني تجربتك بتجربة أخرى."),

        CompanionMessage("post-01", setOf("postpartum","care"), "بعد الولادة، صحتك أنتِ جزء من الرعاية وليست خلفية لرعاية الطفل. النوم، الألم، النزف، المزاج والدعم كلها أمور تستحق السؤال عنها."),
        CompanionMessage("post-02", setOf("postpartum","mood"), "إذا كان الحزن أو القلق شديدًا أو مستمرًا، أو شعرتِ أنك لا تستطيعين الاعتناء بنفسك، اطلبي دعمًا مهنيًا. لا تحتاجين إلى الانتظار حتى تنهاري."),
        CompanionMessage("post-03", setOf("postpartum","safety"), "إذا ظهرت أفكار بإيذاء نفسك أو الطفل، أو ارتباك شديد أو أعراض ذهانية، فهذا يحتاج مساعدة طبية فورية، وليس مجرد متابعة في التطبيق."),
        CompanionMessage("post-04", setOf("postpartum","care"), "من حقك أن تطلبي مساعدة عملية: وجبة، ساعة نوم، رعاية الطفل قليلًا، أو مرافقة لموعد. الدعم ليس ترفًا في التعافي بعد الولادة."),
        CompanionMessage("post-05", setOf("postpartum","general"), "سجلي الأسئلة التي تضيع وسط التعب: النزف، الجرح، المثانة، الأمعاء، الألم، الرضاعة، النوم، المزاج، العلاقة أو منع الحمل، وخذيها للزيارة التالية."),

        CompanionMessage("warm-01", setOf("warm","general"), "تعالي هنا دقيقة. لا أريد منك إنجازًا الآن؛ فقط تأكدي أنك لم تنسي نفسك وسط يومك."),
        CompanionMessage("warm-02", setOf("warm","general"), "مررت لأتفقدك، لا لأضيف مهمة جديدة. إن كنت بخير، جميل. وإن لم تكوني، اختاري ما تحتاجينه وسنصغر اليوم قليلًا."),
        CompanionMessage("warm-03", setOf("warm","general"), "أعرف أن بعض الأيام تمر وأنتِ تؤجلين نفسك إلى آخر القائمة. اليوم لن نضعك في آخرها."),
        CompanionMessage("warm-04", setOf("warm","general"), "قبل أن تعتني بكل شيء آخر، أريد منك فحصًا بسيطًا: هل أنتِ جائعة؟ عطشى؟ متعبة؟ متوترة؟ مؤلمة؟ اختاري إجابة واحدة وابدئي منها."),
        CompanionMessage("warm-05", setOf("warm","general"), "إن كان يومك مزدحمًا جدًا، خذي مني هذا الإذن العملي: ليس عليك الرد على كل شيء الآن."),
        CompanionMessage("warm-06", setOf("warm","general"), "قد لا تحتاجين نصيحة. ربما تحتاجين فقط مساحة تقولين فيها: اليوم ثقيل. هذا يكفي كبداية."),
        CompanionMessage("warm-07", setOf("warm","general"), "ما الذي تتمنين أن يفعله شخص مهتم بك الآن؟ اسألي نفسك إن كان بإمكانك إعطاء جزء صغير منه لنفسك."),
        CompanionMessage("warm-08", setOf("warm","general"), "تفقدي نفسك كما تتفقدين شخصًا تحبينه: بلطف، وبلا توبيخ، وبانتباه للتفاصيل الصغيرة."),
        CompanionMessage("warm-09", setOf("warm","general"), "أنا هنا كرفيقة رقمية تذكّرك بما قد يضيع منك، لكن الأشخاص الحقيقيين مهمون أيضًا. إن احتجتِ قربًا إنسانيًا، اختاري شخصًا آمنًا وتواصلي معه."),
        CompanionMessage("warm-10", setOf("warm","general"), "لا أريد أن أربح انتباهك؛ أريد أن يكون إشعاري مفيدًا ثم أتركك تعيشين يومك. إن لم يفدك، خففي وتيرتي من الإعدادات.")
    )

    fun next(context: Context, preferredTags: Set<String> = setOf("general")): CompanionMessage {
        val candidates = messages.filter { message -> message.tags.any { it in preferredTags } }.ifEmpty { messages }
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val history = readHistory(prefs.getString(HISTORY, "[]") ?: "[]")
        val fresh = candidates.filterNot { it.id in history }.ifEmpty { candidates }
        val seed = (LocalDate.now().dayOfYear * 1000 + LocalDateTime.now().hour * 31 + LocalDateTime.now().minute).absoluteValue
        val chosen = fresh[seed % fresh.size]
        val nextHistory = (listOf(chosen.id) + history.filterNot { it == chosen.id }).take(HISTORY_LIMIT)
        val json = JSONArray().apply { nextHistory.forEach { put(it) } }
        prefs.edit().putString(HISTORY, json.toString()).apply()
        return chosen
    }

    fun count(): Int = messages.size

    fun categories(): Set<String> = messages.flatMap { it.tags }.toSet()

    private fun readHistory(raw: String): List<String> = runCatching {
        val array = JSONArray(raw)
        buildList { for (i in 0 until array.length()) add(array.getString(i)) }
    }.getOrDefault(emptyList())
}
