import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { executiveActivityCount, executiveSeriesPlans, executiveTestCount } from '@/lib/capabilities/executive-functions-lab';
import styles from '../kids-lab.module.css';

export const metadata = buildSeoMetadata({
  title: 'الوظائف التنفيذية للأطفال | 120 نشاطًا واختبارًا متدرجًا',
  description: 'ثماني سلاسل متدرجة لكبح الاستجابة والمرونة المعرفية والتخطيط وترتيب الخطوات ومراقبة الأخطاء وبدء المهمة والاستمرار وحل المشكلة، مع اختبار إتقان لكل مستوى.',
  path: '/capabilities/kids-lab/executive-functions/',
  index: true,
  keywords: ['الوظائف التنفيذية للأطفال','كبح الاستجابة','المرونة المعرفية','التخطيط للأطفال','مراقبة الأخطاء','بدء المهمة','حل المشكلات للأطفال'],
});

const principles = [
  ['مهارة محددة لا شعار عام','كل سلسلة تستهدف عملية تنفيذية واضحة، ولا نستخدم عبارة فضفاضة مثل «تنشيط الدماغ».'],
  ['خطط ثم نفّذ ثم راجع','المستويات العليا لا تزيد عدد العناصر فقط؛ بل تضيف التخطيط، تبديل القاعدة، المراقبة الذاتية أو القيود.'],
  ['اختبار مختلف عن التدريب','ترتيب المثيرات والعوائق والأمثلة يتغير في اختبار الإتقان حتى لا يقيس حفظ الورقة.'],
  ['مؤشرات مرتبطة بالمهمة','نراقب أخطاء المنع، الاستمرار على القاعدة القديمة، جودة الخطة، اكتشاف الخطأ، وزمن البدء—لا نصدر درجة تشخيصية عامة.'],
];

export default function ExecutiveFunctionsLabPage(){
  const breadcrumbs=breadcrumbJsonLd([{name:'الرئيسية',path:'/'},{name:'مختبر الأطفال',path:'/capabilities/kids-lab/'},{name:'الوظائف التنفيذية',path:'/capabilities/kids-lab/executive-functions/'}]);
  const collection={'@context':'https://schema.org','@type':'CollectionPage','@id':`${SITE_URL}/capabilities/kids-lab/executive-functions/#collection`,url:`${SITE_URL}/capabilities/kids-lab/executive-functions/`,name:'الوظائف التنفيذية للأطفال',inLanguage:'ar',isAccessibleForFree:true,numberOfItems:executiveActivityCount};
  return <><SiteHeader/><main className={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([breadcrumbs,collection]).replace(/</g,'\\u003c')}}/>
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><span aria-current="page">الوظائف التنفيذية</span></nav>
    <section className={styles.hero}><span className={styles.kicker}>المجال الثالث - الوظائف التنفيذية</span><h1>من التوقف قبل الاستجابة إلى التخطيط وحل المشكلة</h1><p className={styles.lead}>ثماني سلاسل منفصلة لأن الوظائف التنفيذية ليست مهارة واحدة. لكل سلسلة خمسة مستويات، وفي كل مستوى تدريبان ثم اختبار إتقان مستقل.</p><div className={styles.stats}><div className={styles.stat}><strong>{executiveSeriesPlans.length}</strong><span>سلاسل</span></div><div className={styles.stat}><strong>5</strong><span>مستويات لكل سلسلة</span></div><div className={styles.stat}><strong>{executiveTestCount}</strong><span>اختبار إتقان</span></div><div className={styles.stat}><strong>{executiveActivityCount}</strong><span>نشاطًا واختبارًا</span></div></div></section>
    <section className={styles.section}><div className={styles.sectionHead}><div><h2>السلاسل 16-23</h2><p>ابدأ من المهارة الوظيفية التي تريد تدريبها ومن مستوى أداء الطفل الفعلي.</p></div></div><div className={styles.categoryGrid}>{executiveSeriesPlans.map((series)=><article className={styles.categoryCard} style={{'--category-color':'#22C55E'} as React.CSSProperties} key={series.slug}><span className={styles.kicker}>السلسلة {series.number}</span><h3>{series.title}</h3><p>{series.purpose}</p><div className={styles.metaRow}><span className={styles.metaChip}>{series.ages}</span><span className={styles.metaChip}>{series.duration}</span><span className={styles.metaChip}>15 عنصرًا</span></div><div className={styles.actions}><Link className={styles.primaryButton} href={`/capabilities/kids-lab/executive-functions/${series.slug}/`}>افتح السلسلة</Link></div></article>)}</div></section>
    <section className={styles.section}><div className={styles.sectionHead}><div><h2>عقد الجودة</h2><p>هذه القواعد ثابتة في جميع أوراق المجال.</p></div></div><div className={styles.flow}>{principles.map(([title,body],i)=><article className={styles.flowCard} key={title}><span className={styles.flowNumber}>{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className={styles.section}><div className={styles.note}><strong>حدود الاستخدام:</strong> اختبارات الإتقان هنا ليست اختبارات نفسية معيارية ولا أدوات لتشخيص ADHD أو التوحد أو أي اضطراب. وهي لا تعني أن ورقة واحدة ستحسن «الوظائف التنفيذية كلها». نستخدمها لتدريب ومتابعة أداء مهمة محددة مع تدرج واضح.</div><div className={styles.infoCard} style={{marginTop:'1rem'}}><h2>مراجع منهجية مختارة</h2><ul><li><a href="https://pubmed.ncbi.nlm.nih.gov/39424962/" target="_blank" rel="noreferrer">Executive function in children with neurodevelopmental conditions: systematic review and meta-analysis</a></li><li><a href="https://pubmed.ncbi.nlm.nih.gov/38958229/" target="_blank" rel="noreferrer">Interventions to improve executive functions in young children: systematic review</a></li><li><a href="https://pubmed.ncbi.nlm.nih.gov/39967690/" target="_blank" rel="noreferrer">Open-skill exercise and executive functions in children: systematic review and meta-analysis</a></li></ul></div></section>
  </main><SiteFooter/></>;
}
