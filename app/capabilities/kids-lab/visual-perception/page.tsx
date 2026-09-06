import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { visualPerceptionActivityCount, visualPerceptionSeriesPlans, visualPerceptionTestCount } from '@/lib/capabilities/visual-perception-lab';
import styles from '../kids-lab.module.css';

export const metadata = buildSeoMetadata({
  title: 'الإدراك البصري للأطفال | 105 أنشطة واختبارات متدرجة قابلة للطباعة',
  description: 'سبع سلاسل متدرجة للتمييز البصري والشكل والخلفية والإغلاق البصري والعلاقات المكانية وثبات الشكل والدوران والجزء والكل، مع اختبار إتقان لكل مستوى.',
  path: '/capabilities/kids-lab/visual-perception/',
  index: true,
  keywords: ['الإدراك البصري للأطفال', 'التمييز البصري', 'الشكل والخلفية', 'الإغلاق البصري', 'العلاقات المكانية', 'الدوران العقلي', 'أوراق عمل قابلة للطباعة'],
});

const principles = [
  ['المهارة محددة', 'لا نستخدم عبارة «إدراك بصري» كمظلة غامضة؛ لكل سلسلة عملية بصرية واضحة ومهمة مختلفة.'],
  ['التدرج ليس كثافة فقط', 'ترتفع الصعوبة عبر التشابه، التداخل، مقدار الجزء الناقص، تغيير المرجع أو التحويل المكاني بحسب نوع المهمة.'],
  ['الاختبار لا يكرر التدريب', 'كل اختبار يولد توزيعًا ومثيرات مختلفة عن ورقتي التدريب حتى لا يكون النجاح حفظًا لمكان الإجابة.'],
  ['السرعة ليست الهدف الوحيد', 'نسجل الدقة والاستراتيجية والأخطاء النوعية؛ الزمن مؤشر مساعد فقط عندما تكون المهمة مناسبة له.'],
];

export default function VisualPerceptionLabPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'مختبر الأطفال', path: '/capabilities/kids-lab/' },
    { name: 'الإدراك البصري', path: '/capabilities/kids-lab/visual-perception/' },
  ]);
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/capabilities/kids-lab/visual-perception/#collection`,
    url: `${SITE_URL}/capabilities/kids-lab/visual-perception/`,
    name: 'أنشطة الإدراك البصري للأطفال',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    numberOfItems: visualPerceptionActivityCount,
  };

  return <>
    <SiteHeader />
    <main className={styles.shell}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collection]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><span aria-current="page">الإدراك البصري</span></nav>

      <section className={styles.hero}>
        <span className={styles.kicker}>المجال الرابع - الإدراك البصري</span>
        <h1>سبع مهارات بصرية منفصلة، بتدرج واختبار لكل مستوى</h1>
        <p className={styles.lead}>من اكتشاف فرق صغير بين شكلين إلى العثور على هدف وسط خلفية مزدحمة، إكمال شكل ناقص، فهم العلاقات المكانية، التعرف إلى الشكل رغم تغير مظهره، تدويره ذهنيًا، ودمج الجزء مع الكل.</p>
        <div className={styles.stats}>
          <div className={styles.stat}><strong>{visualPerceptionSeriesPlans.length}</strong><span>سلاسل مختلفة</span></div>
          <div className={styles.stat}><strong>5</strong><span>مستويات لكل سلسلة</span></div>
          <div className={styles.stat}><strong>{visualPerceptionTestCount}</strong><span>اختبار إتقان</span></div>
          <div className={styles.stat}><strong>{visualPerceptionActivityCount}</strong><span>نشاطًا واختبارًا</span></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}><div><h2>السلاسل 24-30</h2><p>العمر إرشادي، أما نقطة البداية الحقيقية فتحددها سهولة المهمة ودقة الطفل واستقلاله.</p></div></div>
        <div className={styles.categoryGrid}>
          {visualPerceptionSeriesPlans.map((series) => <article className={styles.categoryCard} style={{ '--category-color': '#A855F7' } as React.CSSProperties} key={series.slug}>
            <span className={styles.kicker}>السلسلة {series.number}</span><h3>{series.title}</h3><p>{series.purpose}</p>
            <div className={styles.metaRow}><span className={styles.metaChip}>{series.ages}</span><span className={styles.metaChip}>{series.duration}</span><span className={styles.metaChip}>15 عنصرًا</span></div>
            <div className={styles.actions}><Link className={styles.primaryButton} href={`/capabilities/kids-lab/visual-perception/${series.slug}/`}>افتح السلسلة</Link></div>
          </article>)}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}><div><h2>عقد الجودة</h2><p>هذه القواعد تمنع تحويل الأوراق إلى زخرفة ملونة بلا هدف قابل للملاحظة.</p></div></div>
        <div className={styles.flow}>{principles.map(([title, body], index) => <article className={styles.flowCard} key={title}><span className={styles.flowNumber}>{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className={styles.section}>
        <div className={styles.note}><strong>حدود الاستخدام:</strong> هذه أوراق تدريب واختبارات إتقان داخلية وليست اختبارات إدراك بصري معيارية. وجود صعوبة متكررة قد يحتاج فحصًا أوسع للرؤية أو اللغة أو الانتباه أو المهارات الحركية بحسب السياق، ولا يُفسر من ورقة واحدة.</div>
        <div className={styles.infoCard} style={{ marginTop: '1rem' }}><h2>مراجع منهجية مختارة</h2><ul>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/37274562/" target="_blank" rel="noreferrer">Current directions in visual perceptual learning</a></li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/32982829/" target="_blank" rel="noreferrer">Is Early Spatial Skills Training Effective? A Meta-Analysis</a></li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/40912872/" target="_blank" rel="noreferrer">Assessing children's spatial thinking: challenges and implications</a></li>
        </ul></div>
      </section>
    </main>
    <SiteFooter />
  </>;
}