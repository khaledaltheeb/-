import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { visualMotorActivityCount, visualMotorSeriesPlans, visualMotorTestCount } from '@/lib/capabilities/visual-motor-lab';
import styles from '../kids-lab.module.css';

export const metadata = buildSeoMetadata({
  title: 'التكامل البصري الحركي للأطفال | 90 نشاطًا واختبارًا متدرجًا',
  description: 'ست سلاسل متدرجة لتتبع المسارات والمتاهات ووصل النقاط ونسخ الأشكال والنسخ على الشبكة ودقة العين واليد، مع تدريبين واختبار إتقان لكل مستوى.',
  path: '/capabilities/kids-lab/visual-motor/',
  index: true,
  keywords: ['التكامل البصري الحركي', 'أنشطة العين واليد للأطفال', 'تتبع المسارات', 'متاهات للأطفال', 'وصل النقاط', 'نسخ الأشكال', 'النسخ على الشبكة'],
});

const principles = [
  ['الممارسة مرتبطة بالمهمة', 'نستخدم تتبعًا ونسخًا ووصلًا ومتاهات فعلية بدل افتراض أن تدريبًا حسيًا عامًا وحده سينتقل تلقائيًا إلى الأداء الكتابي.'],
  ['الدقة قبل السرعة', 'نقيس البقاء داخل الحدود، الوصول إلى الهدف، العلاقات المكانية واستمرارية الخط، ثم نستخدم الزمن كمؤشر ثانوي.'],
  ['التدرج متعدد الأبعاد', 'الصعوبة ترتفع عبر ضيق الممر، طول المهمة، عدد القرارات، كثافة الشبكة وتعقيد النموذج، لا عبر تصغير العناصر فقط.'],
  ['اختبار جديد لكل مستوى', 'المتاهة والمسار والنموذج والنمط تتغير في الاختبار حتى نقيس تطبيق المهارة لا حفظ الورقة.'],
];

export default function VisualMotorLabPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'مختبر الأطفال', path: '/capabilities/kids-lab/' },
    { name: 'التكامل البصري الحركي', path: '/capabilities/kids-lab/visual-motor/' },
  ]);
  const collection = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    '@id': `${SITE_URL}/capabilities/kids-lab/visual-motor/#collection`,
    url: `${SITE_URL}/capabilities/kids-lab/visual-motor/`, name: 'أنشطة التكامل البصري الحركي للأطفال',
    inLanguage: 'ar', isAccessibleForFree: true, numberOfItems: visualMotorActivityCount,
  };
  return <><SiteHeader/><main className={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([breadcrumbs,collection]).replace(/</g,'\\u003c')}}/>
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><span aria-current="page">التكامل البصري الحركي</span></nav>
    <section className={styles.hero}><span className={styles.kicker}>المجال الخامس - التكامل البصري الحركي</span><h1>من الرؤية إلى حركة دقيقة ومنظمة بالقلم واليد</h1><p className={styles.lead}>ست سلاسل مختلفة فعلًا: تتبع مسار داخل حدود، حل متاهة بالقلم، وصل نقاط متسلسلة، نسخ نموذج، نقل نمط بين شبكتين، وتوجيه اليد نحو أهداف مع تجنب عوائق.</p><div className={styles.stats}><div className={styles.stat}><strong>{visualMotorSeriesPlans.length}</strong><span>سلاسل</span></div><div className={styles.stat}><strong>5</strong><span>مستويات لكل سلسلة</span></div><div className={styles.stat}><strong>{visualMotorTestCount}</strong><span>اختبار إتقان</span></div><div className={styles.stat}><strong>{visualMotorActivityCount}</strong><span>نشاطًا واختبارًا</span></div></div></section>
    <section className={styles.section}><div className={styles.sectionHead}><div><h2>السلاسل 31-36</h2><p>كل سلسلة تبني جانبًا مختلفًا من العلاقة بين الإدراك البصري وتنفيذ الحركة.</p></div></div><div className={styles.categoryGrid}>{visualMotorSeriesPlans.map((series)=><article className={styles.categoryCard} style={{'--category-color':'#3B82F6'} as React.CSSProperties} key={series.slug}><span className={styles.kicker}>السلسلة {series.number}</span><h3>{series.title}</h3><p>{series.purpose}</p><div className={styles.metaRow}><span className={styles.metaChip}>{series.ages}</span><span className={styles.metaChip}>{series.duration}</span><span className={styles.metaChip}>15 عنصرًا</span></div><div className={styles.actions}><Link className={styles.primaryButton} href={`/capabilities/kids-lab/visual-motor/${series.slug}/`}>افتح السلسلة</Link></div></article>)}</div></section>
    <section className={styles.section}><div className={styles.sectionHead}><div><h2>عقد الجودة</h2><p>تمنع هذه القواعد تحويل المهام إلى أوراق جميلة لكنها غير دقيقة.</p></div></div><div className={styles.flow}>{principles.map(([title,body],i)=><article className={styles.flowCard} key={title}><span className={styles.flowNumber}>{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className={styles.section}><div className={styles.note}><strong>حدود الاستخدام:</strong> هذه مهام تدريب وملاحظة وليست اختبارًا معياريًا للتكامل البصري الحركي، ولا بديلًا عن تقييم بصري أو حركي أو وظيفي عند وجود صعوبة مستمرة. كما لا تعني جودة الأداء على ورقة واحدة أن الكتابة أو الأداء المدرسي سيتحسن تلقائيًا.</div><div className={styles.infoCard} style={{marginTop:'1rem'}}><h2>مراجع منهجية مختارة</h2><ul><li><a href="https://pubmed.ncbi.nlm.nih.gov/34381323/" target="_blank" rel="noreferrer">Systematic Review of Visual Motor Integration in Children with Developmental Disabilities</a></li><li><a href="https://pubmed.ncbi.nlm.nih.gov/31329292/" target="_blank" rel="noreferrer">School-based motor skill interventions in children: systematic review</a></li><li><a href="https://pubmed.ncbi.nlm.nih.gov/29689170/" target="_blank" rel="noreferrer">Curriculum-Based Handwriting Programs: Systematic Review With Effect Sizes</a></li></ul></div></section>
  </main><SiteFooter/></>;
}
