import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata } from '@/lib/seo';
import { attentionSeriesPlans, getAttentionActivitiesForSeries, getAttentionSeries } from '@/lib/capabilities/attention-lab';
import styles from '../../kids-lab.module.css';

type Props = { params: Promise<{ series: string }> };

export function generateStaticParams() {
  return attentionSeriesPlans.map((series) => ({ series: series.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series: slug } = await params;
  const series = getAttentionSeries(slug);
  if (!series) return {};
  return buildSeoMetadata({
    title: `${series.title} للأطفال | 5 مستويات و15 نشاطًا واختبارًا`,
    description: `${series.purpose} خمسة مستويات متدرجة، وفي كل مستوى تدريبان واختبار إتقان مختلف بصريًا.`,
    path: `/capabilities/kids-lab/attention/${series.slug}/`,
    index: true,
    keywords: [series.title, 'أنشطة أطفال قابلة للطباعة', 'اختبارات إتقان', 'الانتباه والتركيز للأطفال'],
  });
}

export default async function AttentionSeriesPage({ params }: Props) {
  const { series: slug } = await params;
  const series = getAttentionSeries(slug);
  if (!series) notFound();
  const activities = getAttentionActivitiesForSeries(slug);

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><Link href="/capabilities/kids-lab/attention/">الانتباه والتركيز</Link><span>/</span><span aria-current="page">{series.title}</span>
        </nav>

        <section className={styles.hero}>
          <span className={styles.kicker}>السلسلة {series.number}</span>
          <h1>{series.title}</h1>
          <p className={styles.lead}>{series.purpose}</p>
          <div className={styles.metaRow}>
            <span className={styles.metaChip}>العمر الإرشادي: {series.ages}</span>
            <span className={styles.metaChip}>المدة: {series.duration}</span>
            <span className={styles.metaChip}>5 مستويات</span>
            <span className={styles.metaChip}>15 عنصرًا</span>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><h2>المستويات الخمسة</h2><p>في كل مستوى ورقتا تدريب ثم اختبار. الاختبار يستخدم توزيعًا مختلفًا عن التدريب حتى يقيس تطبيق المهارة لا حفظ الورقة.</p></div>
          </div>
          <div className={styles.flow}>
            {Array.from({ length: 5 }, (_, index) => index + 1).map((level) => {
              const levelActivities = activities.filter((activity) => activity.level === level);
              return (
                <article className={styles.flowCard} key={level}>
                  <span className={styles.flowNumber}>{level}</span>
                  <h3>المستوى {level}</h3>
                  <p>{series.progression[level - 1]}</p>
                  <div className={styles.seriesList}>
                    {levelActivities.map((activity) => (
                      <Link className={activity.kind === 'test' ? styles.seriesActive : styles.seriesItem} href={`/capabilities/kids-lab/attention/${series.slug}/${activity.slug}/`} key={activity.slug}>
                        <span><strong>{activity.label}</strong><small>{activity.title}</small></span>
                        {activity.kind === 'test' && <span className={styles.readyBadge}>اختبار</span>}
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.note}><strong>متى نصعّد المستوى؟</strong> بعد أداء مستقر في اختبار المستوى مع تلميحات قليلة، لا لمجرد إكمال ورقتي التدريب. إذا ظهرت أخطاء كثيرة أو فقد الطفل القاعدة، نعود للتدريب أو نبسّط البيئة.</div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
