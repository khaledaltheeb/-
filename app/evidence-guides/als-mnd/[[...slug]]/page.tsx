import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildSeoMetadata } from '@/lib/seo';

const MAP = 'https://www.als-mnd.org/about-us/als-mnd-health-literacy-map/';
const DIRECTORY = 'https://www.als-mnd.org/find-als-mnd-association/';

type Params = Promise<{ slug?: string[] }>;
type PageDef = { slug: string; title: string; description: string; body: React.ReactNode };
const card = { border:'1px solid #d8e2df', borderRadius:16, padding:'1rem', background:'#fff', margin:'1rem 0' } as const;
const note = { ...card, background:'#f4faf7', borderInlineStart:'5px solid #0a6655' } as const;

const pages: Record<string, PageDef> = {
  '': {
    slug:'', title:'ALS/MND: مسار عربي لمحو الأمية الصحية واتخاذ القرار',
    description:'مسار عربي منظم وفق محاور ALS/MND Health Literacy Map: فهم المرض، العيش معه، العلاج، واتخاذ إجراء، مع إحالات موثوقة وحدود واضحة.',
    body:<>
      <section style={note}><h2>لماذا مسار لا موسوعة مرض فقط؟</h2><p>بعد تشخيص ALS/MND لا يحتاج الشخص تعريف المرض فحسب؛ يحتاج أن يعرف ما الذي يجب فهمه الآن، وما الذي قد يتغير لاحقًا، ومن يشارك في الرعاية، وكيف يحافظ على التواصل والوظيفة، وأين يجد دعمًا موثوقًا. لذلك نستخدم بنية Health Literacy Map التي أحالتنا إليها International Alliance of ALS/MND Associations كخريطة تنظيم، مع إعداد عربي مستقل.</p></section>
      <section style={card}><h2>المحاور الأربعة</h2><ul><li><Link href="/evidence-guides/als-mnd/understanding/">فهم ALS/MND</Link> — التشخيص، التباين، الأسئلة التي تحتاج توضيحًا، ومصادر المعلومة.</li><li><Link href="/evidence-guides/als-mnd/living/">العيش مع ALS/MND</Link> — التواصل، الحركة، التغذية، التنفس، الأسرة، التقنية المساعدة والتخطيط اليومي.</li><li><Link href="/evidence-guides/als-mnd/treatment/">العلاج والرعاية</Link> — دور الفريق متعدد التخصصات، أهداف العلاج، الرعاية التلطيفية والسلامة.</li><li><Link href="/evidence-guides/als-mnd/action/">اتخاذ إجراء والوصول إلى الدعم</Link> — تجهيز الزيارة، البحث عن جمعية، المشاركة في القرار والمناصرة دون خلط البلدان.</li></ul></section>
      <section style={card}><h2>موجود أصلًا في روافد</h2><p>بدل تكرار المحتوى، يربط هذا المسار إلى الصفحات المتخصصة الموجودة بالفعل عندما تكون هي الأنسب.</p><ul><li><Link href="/content/palliative-care-als-motor-neuron-disease">الرعاية التلطيفية في ALS/MND: التنفس والبلع والتواصل والقرارات</Link></li><li><Link href="/capabilities/amyotrophic-lateral-sclerosis/">قدرات التصلب الجانبي الضموري: نقاط القوة والوصول</Link></li></ul></section>
    </>
  },
  'understanding': {
    slug:'understanding', title:'فهم ALS/MND بعد التشخيص: خريطة أسئلة لا توقعات جامدة',
    description:'دليل عربي لتنظيم فهم ALS/MND بعد التشخيص: ما الذي نعرفه، ما الذي يختلف بين الأشخاص، وكيف نتحقق من المعلومات ونجهز الأسئلة.',
    body:<>
      <section style={note}><h2>ابدأ بما تحتاج معرفته الآن</h2><p>Health Literacy Map تضع «فهم ALS/MND» كأحد المحاور الأساسية. الاستخدام العملي ليس حفظ كل التفاصيل دفعة واحدة، بل بناء معرفة مرحلية تسمح للشخص والأسرة بالمشاركة في القرار.</p></section>
      <section style={card}><h2>ستة أسئلة تأسيسية</h2><ol><li>ما المصطلح الذي يستخدمه فريقي: ALS أم MND، وما المقصود به في حالتي؟</li><li>ما الذي يدعم التشخيص وما البدائل التي جرى استبعادها؟</li><li>ما الوظائف المتأثرة الآن، وما الذي نراقبه مع الوقت؟</li><li>من أعضاء الفريق الذين قد أحتاجهم ومتى؟</li><li>ما العلامات التي تستدعي تواصلًا سريعًا أو عاجلًا؟</li><li>ما المعلومات التي تخص بلدي أو نظامي الصحي ولا يجوز نقلها من مصدر أجنبي؟</li></ol></section>
      <section style={card}><h2>فلتر المعلومة</h2><ul><li>افصل بين وصف المرض وبين توصية علاجية فردية.</li><li>تحقق من تاريخ الصفحة والجهة الناشرة والسياق الجغرافي.</li><li>لا تعامل قصة شخص واحد كتوقع لمسارك.</li><li>إذا تعارضت معلومة عامة مع تعليمات فريقك، اطلب تفسير الاختلاف بدل تعديل العلاج ذاتيًا.</li></ul></section>
    </>
  },
  'living': {
    slug:'living', title:'العيش مع ALS/MND: الوظيفة والتواصل والأسرة والتقنية المساعدة',
    description:'خريطة عربية للاحتياجات اليومية في ALS/MND: الحركة، التواصل، التغذية، التنفس، الأسرة، التقنية المساعدة والتخطيط المبكر.',
    body:<>
      <section style={note}><h2>الجودة اليومية جزء من المعرفة الصحية</h2><p>إطار Alliance لا يفصل المعلومات عن جودة الحياة. لذلك نرتب الاحتياجات بحسب الوظيفة والمشاركة وما يهم الشخص، لا بحسب أسماء التخصصات فقط.</p></section>
      <section style={card}><h2>مجالات يجب ألا تضيع</h2><ul><li><strong>التواصل:</strong> خطط مبكرًا للبدائل قبل أن تصبح الحاجة طارئة.</li><li><strong>الحركة والوصول:</strong> راقب التعب والسقوط وصعوبة الانتقال والبيئة المنزلية.</li><li><strong>البلع والتغذية:</strong> أبلغ الفريق عن تغيرات المضغ والبلع والوزن بدل الاعتماد على تجارب منزلية خطرة.</li><li><strong>التنفس:</strong> ناقش الأعراض والمراقبة وخطة التواصل عند التغير مع الفريق المختص.</li><li><strong>الأسرة ومقدم الرعاية:</strong> وزع المسؤوليات واطلب الدعم قبل الوصول إلى الإنهاك.</li><li><strong>التقنية المساعدة:</strong> قيّم ما يحافظ على الاستقلال والتواصل، وليس أحدث جهاز فقط.</li></ul></section>
      <section style={card}><h2>صفحات مرتبطة</h2><p><Link href="/capabilities/amyotrophic-lateral-sclerosis/">مسار القدرات والوصول في ALS ←</Link></p></section>
    </>
  },
  'treatment': {
    slug:'treatment', title:'علاج ورعاية ALS/MND: كيف تنظّم الحوار مع الفريق متعدد التخصصات؟',
    description:'دليل عربي لتنظيم فهم العلاج والرعاية في ALS/MND دون وصفات فردية: الأهداف، الفريق متعدد التخصصات، المراقبة، الرعاية التلطيفية والسلامة.',
    body:<>
      <section style={note}><h2>العلاج ليس قائمة أدوية</h2><p>مع ALS/MND تتداخل إدارة المرض والأعراض والوظيفة والتغذية والتنفس والتواصل والدعم النفسي والاجتماعي. لذلك قيمة المعرفة الصحية هي فهم هدف كل تدخل ومن يتابعه وكيف نعرف أنه يساعد.</p></section>
      <section style={card}><h2>لكل تدخل اسأل</h2><ol><li>ما الهدف المحدد منه؟</li><li>ما الفائدة المتوقعة وما الذي لا يستطيع تحقيقه؟</li><li>ما المخاطر أو الأعباء التي نراقبها؟</li><li>كيف سنقيس النتيجة ومتى نعيد التقييم؟</li><li>هل يؤثر في خيارات أو أجهزة أو أدوية أخرى؟</li><li>من أتصل به إذا ظهرت مشكلة؟</li></ol></section>
      <section style={card}><h2>الرعاية التلطيفية مبكرًا عند الحاجة</h2><p>الرعاية التلطيفية لا تعني إيقاف العلاج. فائدتها في ALS/MND تشمل تخفيف المعاناة ودعم القرارات والأسرة والتعامل مع أعراض معقدة بالتوازي مع الرعاية العصبية.</p><p><Link href="/content/palliative-care-als-motor-neuron-disease">فتح دليل الرعاية التلطيفية في ALS/MND ←</Link></p></section>
      <section style={{...card,background:'#fff3ef'}}><h2>حد أمان</h2><p>لا تستخدم هذه الصفحة لتغيير دواء أو جهاز تنفسي أو تغذية أو جرعة أو خطة فردية. القرارات تعتمد على التقييم السريري والبلد وتوفر الخدمات.</p></section>
    </>
  },
  'action': {
    slug:'action', title:'ALS/MND: اتخاذ إجراء والعثور على دعم موثوق',
    description:'مسار عربي عملي للاستعداد للزيارة، توثيق الأولويات، العثور على جمعية ALS/MND عبر الدليل الدولي، وفهم حدود النقل بين البلدان.',
    body:<>
      <section style={note}><h2>المعلومة تصبح مفيدة عندما تتحول إلى خطوة</h2><p>«Taking Action» محور مستقل في Health Literacy Map. لا يعني المناصرة فقط؛ يشمل معرفة من نسأل، كيف نوثق ما تغير، وكيف نصل إلى دعم مناسب دون افتراض أن خدمة بلد آخر متاحة محليًا.</p></section>
      <section style={card}><h2>قبل الموعد</h2><ul><li>دوّن أهم ثلاثة تغيرات منذ الزيارة السابقة.</li><li>اكتب سؤالين أو ثلاثة تحتاج قرارًا أو تفسيرًا بشأنهما.</li><li>احمل قائمة الأدوية والأجهزة والمكملات كما تستخدم فعليًا.</li><li>حدد ما الذي أصبح أصعب في المنزل أو العمل أو التواصل.</li><li>اطلب لغة أو وسيلة تواصل أو حضور شخص داعم إذا احتجت.</li></ul></section>
      <section style={card}><h2>العثور على جمعية أو شبكة</h2><p>وجّهتنا Alliance إلى دليل جمعياتها الدولي. استخدمه كنقطة اكتشاف ثم تحقق من البلد، التغطية، شروط الخدمة، اللغة، وحداثة بيانات الاتصال قبل الاعتماد عليها.</p><p><a href={DIRECTORY} target="_blank" rel="noopener noreferrer">فتح دليل جمعيات ALS/MND الدولي لدى Alliance ←</a></p></section>
      <section style={card}><h2>لا تنقل الأهلية بين البلدان</h2><p>وجود منظمة في الدليل لا يعني أن خدماتها أو تمويلها أو أجهزتها متاحة لك. روافد يحافظ على البلد والسياق عند الإحالة ولا يعرض الدليل كبديل عن نظام الرعاية المحلي.</p></section>
    </>
  }
};

function key(slug?: string[]) { return (slug ?? []).join('/'); }
export async function generateMetadata({params}:{params:Params}):Promise<Metadata>{ const {slug}=await params; const page=pages[key(slug)]; if(!page)return{}; const path=page.slug?`/evidence-guides/als-mnd/${page.slug}/`:'/evidence-guides/als-mnd/'; return buildSeoMetadata({title:page.title,description:page.description,path,index:true,follow:true,type:'website',keywords:['ALS','MND','التصلب الجانبي الضموري','مرض العصبون الحركي','محو الأمية الصحية']}); }
export default async function AlsMndPage({params}:{params:Params}){const {slug}=await params;const page=pages[key(slug)];if(!page)notFound();return <main dir="rtl" style={{maxWidth:1050,margin:'0 auto',padding:'2rem 1rem',lineHeight:1.95,color:'#14251f'}}><nav><Link href="/evidence-guides/">أدلة المصادر</Link> · <Link href="/evidence-guides/als-mnd/">ALS/MND</Link></nav><header><p style={{color:'#0a6655',fontWeight:700}}>International Alliance of ALS/MND Associations — Health Literacy Map</p><h1>{page.title}</h1><p>{page.description}</p></header>{page.body}<section style={card}><h2>المصدر الهيكلي الأصلي</h2><p><a href={MAP} target="_blank" rel="noopener noreferrer">ALS/MND Health Literacy Map — International Alliance of ALS/MND Associations</a></p><p>أحالتنا Alliance مباشرة إلى هذه الخريطة ودليل الجمعيات. المحتوى العربي هنا إعداد مستقل من Health Renewal؛ لا يعني أن Alliance راجعته أو اعتمدته، ولا نعيد نشر الخريطة أو نقدم خدمات الجمعيات كأنها متاحة في الأردن.</p></section></main>}
