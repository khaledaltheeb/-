import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { memoryActivityCount, memorySeriesPlans, memoryTestCount } from '@/lib/capabilities/memory-lab';
import styles from '../kids-lab.module.css';

export const metadata = buildSeoMetadata({
  title: 'أنشطة الذاكرة للأطفال | 105 أنشطة واختبارات متدرجة قابلة للطباعة',
  description: 'سبع سلاسل متدرجة للذاكرة العاملة البصرية والمكانية والتسلسلية والسمعية والترابطية وذاكرة التعليمات والتذكر بعد التداخل، مع اختبار إتقان لكل مستوى.',
  path: '/capabilities/kids-lab/memory/',
  index: true,
  keywords: ['أنشطة الذاكرة للأطفال', 'الذاكرة العاملة للأطفال', 'ذاكرة بصرية', 'ذاكرة سمعية', 'أوراق عمل قابلة للطباعة', 'اختبارات إتقان'],
});

const principles = [
  ['افصل نوع الذاكرة', 'لا نعامل الذاكرة كمهارة واحدة: حفظ الموقع يختلف عن التسلسل السمعي أو تنفيذ تعليمات متعددة الخطوات.'],
  ['غيّر السعة والحمل التنفيذي', 'يزداد عدد العناصر تدريجيًا، ثم تضاف متطلبات مثل الترتيب أو المعالجة أو التداخل عندما يناسب نوع المهمة.'],
  ['غطِّ النموذج فعلًا', 'المهام البصرية تستخدم منطقة ترميز قابلة للطي أو التغطية، والسمعية تستخدم بطاقة للمرافق لا يراها الطفل أثناء الاستجابة.'],
  ['اختبر بمثيرات جديدة', 'اختبار المستوى يستخدم ترتيبًا وبذرة مختلفة عن التدريب حتى لا نقيس حفظ شكل الورقة.'],
];

export default function MemoryLabPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'مختبر الأطفال', path: '/capabilities/kids-lab/' },
    { name: 'الذاكرة', path: '/capabilities/kids-lab/memory/' },
  ]);
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/capabilities/kids-lab/memory/#collection`,
    url: `${SITE_URL}/capabilities/kids-lab/memory/`,
    name: 'أنشطة الذاكرة للأطفال',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    numberOfItems: memoryActivityCount,
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collection]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><span aria-current="page">الذاكرة</span>
        </nav>

        <section className={styles.hero}>
          <span className={styles.kicker}>المجال الثاني - الذاكرة</span>
          <h1>سبع سلاسل ذاكرة، بتدرج حقيقي واختبار لكل مستوى</h1>
          <p className={styles.lead}>الهدف ليس تكرار ألعاب «احفظ الصور». فصلنا أنواع الذاكرة إلى مهام بصرية ومكانية وتسلسلية وسمعية وترابطية وتعليمات وتذكر مؤجل، ثم صممنا لكل منها خمسة مستويات واختبارات مستقلة.</p>
          <div className={styles.stats}>
            <div className={styles.stat}><strong>{memorySeriesPlans.length}</strong><span>سلاسل مختلفة</span></div>
            <div className={styles.stat}><strong>5</strong><span>مستويات لكل سلسلة</span></div>
            <div className={styles.stat}><strong>{memoryTestCount}</strong><span>اختبار إتقان</span></div>
            <div className={styles.stat}><strong>{memoryActivityCount}</strong><span>نشاطًا واختبارًا</span></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><div><h2>السلاسل 9-15</h2><p>اختر نوع الذاكرة الذي تريد تدريبه، ثم ابدأ من مستوى مناسب للأداء الفعلي لا من العمر وحده.</p></div></div>
          <div className={styles.categoryGrid}>
            {memorySeriesPlans.map((series) => (
              <article className={styles.categoryCard} style={{ '--category-color': '#EC4899' } as React.CSSProperties} key={series.slug}>
                <span className={styles.kicker}>السلسلة {series.number}</span>
                <h3>{series.title}</h3>
                <p>{series.purpose}</p>
                <div className={styles.metaRow}><span className={styles.metaChip}>{series.ages}</span><span className={styles.metaChip}>{series.duration}</span><span className={styles.metaChip}>15 عنصرًا</span></div>
                <div className={styles.actions}><Link className={styles.primaryButton} href={`/capabilities/kids-lab/memory/${series.slug}/`}>افتح السلسلة</Link></div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><div><h2>عقد التصميم العلمي</h2><p>قواعد ثابتة تطبق على جميع أوراق الذاكرة، خصوصًا عند الانتقال من التدريب إلى الاختبار.</p></div></div>
          <div className={styles.flow}>
            {principles.map(([title, text], index) => (
              <article className={styles.flowCard} key={title}><span className={styles.flowNumber}>{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.note}>
            <strong>حدود الدليل:</strong> التحسن الأقوى المتوقع من تدريب الذاكرة يكون عادة في المهام المتشابهة مع التدريب، بينما الانتقال البعيد إلى الذكاء أو التحصيل الدراسي ليس مضمونًا. لذلك لا نزعم أن هذه الأوراق «تزيد الذكاء»، ولا نقدم درجاتها كمعايير تشخيصية.
          </div>
          <div className={styles.infoCard} style={{ marginTop: '1rem' }}>
            <h2>مراجع منهجية مختارة</h2>
            <ul>
              <li><a href="https://pubmed.ncbi.nlm.nih.gov/31939109/" target="_blank" rel="noreferrer">Working memory training in typically developing children: multilevel meta-analysis</a></li>
              <li><a href="https://pubmed.ncbi.nlm.nih.gov/36508931/" target="_blank" rel="noreferrer">Working memory and inhibitory-control training in primary-school children</a></li>
              <li><a href="https://pubmed.ncbi.nlm.nih.gov/42505951/" target="_blank" rel="noreferrer">Integrated adaptive working-memory training in school-age children</a></li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
