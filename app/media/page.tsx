import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import { infographics, worksheets } from '@/lib/practical-resources';

export const metadata:Metadata=buildSeoMetadata({
 title:'مركز الوسائط والمواد العملية | منصة روافد',
 description:'مركز وسائط عربي منظم للإنفوغرافيك والمواد القابلة للطباعة وEasy Read والحبسة والتنوع العصبي، مع قواعد واضحة للمصادر والحقوق والوصولية.',
 path:'/media/',index:true,follow:true,type:'website',
 keywords:['مركز وسائط روافد','إنفوغرافيك نفسي عربي','مواد قابلة للطباعة','Easy Read عربي','الحبسة','التنوع العصبي']
});

const evidenceCollections=[
 {title:'الحبسة وEasy Read',description:'تواصل متعدد الوسائط، لغة عربية ميسرة، والتحقق من الفهم دون تسطيح أو نبرة طفولية.',links:[['/evidence-guides/aphasia-accessible-communication/','الحبسة والتواصل الداعم'],['/evidence-guides/easy-read-arabic-aphasia/','معيار Easy Read بالعربية']]},
 {title:'التنوع العصبي والتقييم المتأخر',description:'عناقيد مستقلة للبحث عن ADHD لدى البنات وAuDHD والتمويه والاحتراق، مع فصل واضح بين المصطلح المجتمعي والتشخيص.',links:[['/evidence-guides/adhd-girls-late-recognition/','ADHD لدى البنات'],['/evidence-guides/autism-adhd-audhd/','التوحد وADHD معًا'],['/evidence-guides/autistic-masking-camouflaging/','Masking / Camouflaging'],['/evidence-guides/autistic-burnout/','الاحتراق التوحدي']]},
 {title:'اللغة والتعلم',description:'مادة تطبيقية تربط اضطراب اللغة النمائي بالسياق العربي والقراءة والحمل اللغوي داخل الصف دون إنشاء canonical منافس.',links:[['/evidence-guides/dld-arabic-literacy-classroom/','DLD والقراءة في الصف العربي'],['/encyclopedia/developmental-language-disorder/','الصفحة الموسوعية المالكة لـDLD']]},
 {title:'المصادر المفتوحة',description:'استخدام مؤسسي للمصادر المفتوحة يميز بين حق الوصول، حق إعادة الاستخدام، وحقوق العلامات والأصول البصرية.',links:[['/evidence-guides/openstax-responsible-arabic-use/','OpenStax: الترخيص والإسناد'],['/evidence-guides/pacer-family-assistive-technology-transition/','PACER: التقنية المساندة والانتقال'],['/evidence-guides/thoth-open-metadata-discovery/','Thoth: اكتشاف الكتب والبيانات المفتوحة']]},
 {title:'المشاركة والحوكمة',description:'مواد عملية للسفر الميسّر والأمراض النادرة ومراجعة محتوى الإدمان خارجيًا.',links:[['/evidence-guides/accessible-travel-disability-planning/','السفر الميسّر'],['/evidence-guides/rare-disease-family-navigation/','التنقل في الأمراض النادرة'],['/external-review/','برنامج المراجعة الخارجية']]}
] as const;

const mediaRules=[
 'لا ننشر صورة زخرفية بلا غرض إذا كانت تزيد الحمل أو لا تضيف معنى.',
 'كل صورة معلوماتية تحتاج نصًا بديلًا يصف وظيفتها، لا مجرد اسم الملف.',
 'يُسجل المصدر والترخيص لكل أصل معاد استخدامه؛ وجوده على الإنترنت لا يعني أنه حر.',
 'مواد OpenStax لا تستخدم شعار OpenStax أو أغلفتها بما يوحي بالشراكة، وتُحترم شروط الإسناد الخاصة بالإصدار.',
 'Easy Read طبقة وصولية ذات معنى واختبار، لا مجرد تقليل عدد الكلمات.',
 'الإنفوغرافيك لا يحول مفهومًا سريريًا معقدًا إلى اختبار أو درجة تشخيصية.',
 'المادة القابلة للطباعة تبقى مفيدة بالأبيض والأسود ومع التكبير، ولا تعتمد على اللون وحده لنقل المعنى.'
] as const;

export default function MediaPage(){
 const schema={'@context':'https://schema.org','@type':'CollectionPage','@id':`${SITE_URL}/media/#page`,url:`${SITE_URL}/media/`,name:'مركز الوسائط والمواد العملية في منصة روافد',description:'مركز منظم للمواد البصرية والقابلة للطباعة والأدلة الميسرة.',inLanguage:'ar',isPartOf:{'@id':`${SITE_URL}/#website`},publisher:{'@id':`${SITE_URL}/#organization`}};
 return <><SiteHeader/><main className="site-shell sector-page-shell">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">مركز الوسائط</span></nav>
  <section className="public-index-hero" aria-labelledby="media-title"><span className="eyebrow">المعرفة عندما تحتاج شكلًا أسرع وأوضح</span><h1 id="media-title">مركز الوسائط والمواد العملية</h1><p>ليس معرض صور. هو طبقة نشر منظمة تحول الأدلة إلى بطاقات ومواد قابلة للطباعة ومسارات Easy Read ومراجع يمكن تتبعها، مع الحفاظ على السياق والحدود العلمية والحقوق.</p><div className="public-stat-strip"><span>{infographics.length.toLocaleString('ar')} بطاقة معلوماتية</span><span>{worksheets.length.toLocaleString('ar')} أوراق عمل منظمة</span><span>{evidenceCollections.length.toLocaleString('ar')} مجموعات معرفة مرتبطة</span></div></section>

  <section aria-labelledby="media-cards"><div className="section-mini-heading"><div><span className="eyebrow">للهاتف والطباعة</span><h2 id="media-cards">بطاقات معلوماتية قابلة للمشاركة</h2></div><Link href="/resources/infographics">فتح مكتبة الإنفوغرافيك كاملة ←</Link></div><div className="institutional-sector-grid">{infographics.map((item)=><Link className="institutional-sector-card" href={`/resources/infographics/${item.slug}`} key={item.slug}><span className="eyebrow">بطاقة عملية</span><h3>{item.title}</h3><p>{item.summary}</p><div className="sector-metrics"><span>{item.items.length.toLocaleString('ar')} نقاط عملية</span></div><span className="sector-open">فتح البطاقة ←</span></Link>)}</div></section>

  <section aria-labelledby="media-worksheets"><div className="section-mini-heading"><div><span className="eyebrow">للملاحظة والتحضير</span><h2 id="media-worksheets">أوراق عمل دون تشخيص ذاتي</h2></div><Link href="/resources/worksheets">فتح صفحة أوراق العمل ←</Link></div><div className="institutional-sector-grid">{worksheets.map((item)=><article className="institutional-sector-card" key={item.slug}><span className="eyebrow">{item.audience}</span><h3>{item.title}</h3><p>{item.purpose}</p><div className="sector-metrics"><span>{item.prompts.length.toLocaleString('ar')} أسئلة تنظيمية</span></div></article>)}</div></section>

  <section aria-labelledby="media-evidence"><div className="section-mini-heading"><div><span className="eyebrow">من الوسيط إلى المصدر</span><h2 id="media-evidence">المجموعات العلمية المرتبطة</h2></div><span>كل بطاقة تقود إلى سياق أطول ومصادر أصلية.</span></div><div className="institutional-sector-grid">{evidenceCollections.map((group)=><article className="institutional-sector-card" key={group.title}><span className="eyebrow">مجموعة معرفة</span><h3>{group.title}</h3><p>{group.description}</p><ul>{group.links.map(([href,label])=><li key={href}><Link href={href}>{label} ←</Link></li>)}</ul></article>)}</div></section>

  <section aria-labelledby="media-governance"><div className="section-mini-heading"><div><span className="eyebrow">حقوق وإتاحة</span><h2 id="media-governance">عقد النشر البصري في روافد</h2></div><Link href="/accessibility-statement">بيان الوصولية ←</Link></div><div className="institutional-note"><ul>{mediaRules.map((rule)=><li key={rule}>{rule}</li>)}</ul><p><strong>قاعدة ثابتة:</strong> اسم الجهة المصدرية لا يعني اعتمادها لروافد. الأصل البصري أو النص المترجم لا ينشر إلا وفق حق استخدام واضح، مع إسناد يمكن للمستخدم تتبعه.</p></div></section>
 </main><SiteFooter/></>;
}
