import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import KidsLabPrintButton from '@/components/kids-lab-print-button';
import { buildSeoMetadata } from '@/lib/seo';
import { attentionActivities, getAttentionActivitiesForSeries, getAttentionActivity, getAttentionSeries } from '@/lib/capabilities/attention-lab';
import styles from '../../../kids-lab.module.css';

type Props = { params: Promise<{ series: string; activity: string }> };

export function generateStaticParams() {
  return attentionActivities.map((activity) => ({ series: activity.seriesSlug, activity: activity.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series: seriesSlug, activity: activitySlug } = await params;
  const activity = getAttentionActivity(seriesSlug, activitySlug);
  if (!activity) return {};
  return buildSeoMetadata({
    title: `${activity.seriesTitle} - ${activity.label} | نشاط قابل للطباعة`,
    description: `${activity.purpose} ${activity.instruction}`,
    path: `/capabilities/kids-lab/attention/${seriesSlug}/${activitySlug}/`,
    index: true,
    keywords: [activity.seriesTitle, 'نشاط أطفال قابل للطباعة', activity.label, 'الانتباه والتركيز'],
  });
}

export default async function AttentionActivityPage({ params }: Props) {
  const { series: seriesSlug, activity: activitySlug } = await params;
  const series = getAttentionSeries(seriesSlug);
  const activity = getAttentionActivity(seriesSlug, activitySlug);
  if (!series || !activity) notFound();

  const seriesActivities = getAttentionActivitiesForSeries(seriesSlug);
  const currentIndex = seriesActivities.findIndex((item) => item.slug === activity.slug);
  const previous = currentIndex > 0 ? seriesActivities[currentIndex - 1] : null;
  const next = currentIndex < seriesActivities.length - 1 ? seriesActivities[currentIndex + 1] : null;
  const imageUrl = `/capabilities/kids-lab/attention/${seriesSlug}/${activity.slug}/image/`;

  return (
    <>
      <div className={styles.noPrint}><SiteHeader /></div>
      <main className={styles.shell}>
        <nav className={`breadcrumbs ${styles.noPrint}`} aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><Link href="/capabilities/kids-lab/attention/">الانتباه</Link><span>/</span><Link href={`/capabilities/kids-lab/attention/${series.slug}/`}>{series.title}</Link><span>/</span><span aria-current="page">{activity.label}</span>
        </nav>

        <div className={styles.activityLayout}>
          <section className={styles.worksheetFrame} aria-label="معاينة ورقة النشاط">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={`${activity.seriesTitle} - ${activity.label}`} />
          </section>

          <aside className={`${styles.sidePanel} ${styles.noPrint}`}>
            <section className={styles.infoCard}>
              <span className={styles.kicker}>{activity.label}</span>
              <h1>{activity.seriesTitle}</h1>
              <div className={styles.metaRow}>
                <span className={styles.metaChip}>العمر: {activity.age}</span>
                <span className={styles.metaChip}>المدة: {activity.duration}</span>
                <span className={styles.metaChip}>المستوى: {activity.level}/5</span>
              </div>
              <p><strong>لماذا تستخدم؟</strong><br />{activity.purpose}</p>
              <p><strong>تعليمات سريعة:</strong><br />{activity.instruction}</p>
              <p><strong>درجة هذا المستوى:</strong><br />{activity.progression}</p>
            </section>

            <section className={styles.infoCard}>
              <h2>المعاينة والطباعة</h2>
              <p>يمكن رؤية الورقة بالحجم الكامل قبل الاستخدام. زر الطباعة يتيح الطباعة المباشرة أو حفظ نسخة PDF، والصورة المتجهية SVG مناسبة للطباعة عالية الدقة.</p>
              <div className={styles.actions}>
                <KidsLabPrintButton />
                <a className={styles.secondaryButton} href={imageUrl} download={`${series.slug}-${activity.slug}.svg`}>تنزيل الصورة SVG</a>
              </div>
            </section>

            <section className={styles.infoCard}>
              <h3>{activity.kind === 'test' ? 'معيار إتقان المستوى' : 'ما الذي نراقبه؟'}</h3>
              <p>{activity.mastery}</p>
              {activity.kind === 'test' && <p><strong>تنبيه:</strong> الاختبار خاص بإتقان المهمة داخل هذه السلسلة، وليس أداة تشخيص ADHD أو اضطراب تعلم أو أي حالة أخرى.</p>}
            </section>

            <div className={styles.actions}>
              {previous && <Link className={styles.secondaryButton} href={`/capabilities/kids-lab/attention/${series.slug}/${previous.slug}/`}>السابق</Link>}
              {next && <Link className={styles.primaryButton} href={`/capabilities/kids-lab/attention/${series.slug}/${next.slug}/`}>التالي</Link>}
            </div>
          </aside>
        </div>
      </main>
      <div className={styles.noPrint}><SiteFooter /></div>
    </>
  );
}
