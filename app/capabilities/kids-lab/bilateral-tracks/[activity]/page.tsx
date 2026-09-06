import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import KidsLabPrintButton from '@/components/kids-lab-print-button';
import { buildSeoMetadata } from '@/lib/seo';
import { bilateralActivities, getBilateralActivity } from '@/lib/capabilities/bilateral-tracks';
import styles from '../../kids-lab.module.css';

type Props = { params: Promise<{ activity: string }> };

export function generateStaticParams() {
  return bilateralActivities.map((activity) => ({ activity: activity.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { activity: slug } = await params;
  const activity = getBilateralActivity(slug);
  if (!activity) return {};
  return buildSeoMetadata({
    title: `${activity.title} | ${activity.label} | مسارا اليدين المتزامنان`,
    description: `${activity.purpose} ${activity.instruction}`,
    path: `/capabilities/kids-lab/bilateral-tracks/${activity.slug}/`,
    index: true,
    keywords: ['أنشطة أطفال قابلة للطباعة', 'التآزر الثنائي', 'التتبع البصري الحركي', activity.label],
  });
}

export default async function BilateralActivityPage({ params }: Props) {
  const { activity: slug } = await params;
  const activity = getBilateralActivity(slug);
  if (!activity) notFound();

  const currentIndex = bilateralActivities.findIndex((item) => item.slug === activity.slug);
  const previous = currentIndex > 0 ? bilateralActivities[currentIndex - 1] : null;
  const next = currentIndex < bilateralActivities.length - 1 ? bilateralActivities[currentIndex + 1] : null;
  const imageUrl = `/capabilities/kids-lab/bilateral-tracks/${activity.slug}/image/`;

  return (
    <>
      <div className={styles.noPrint}><SiteHeader /></div>
      <main className={styles.shell}>
        <nav className={`breadcrumbs ${styles.noPrint}`} aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><Link href="/capabilities/kids-lab/bilateral-tracks/">مسارا اليدين</Link><span>/</span><span aria-current="page">{activity.label}</span>
        </nav>

        <div className={styles.activityLayout}>
          <section className={styles.worksheetFrame} aria-label="معاينة ورقة النشاط">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={`${activity.title} - ${activity.label}`} />
          </section>

          <aside className={`${styles.sidePanel} ${styles.noPrint}`}>
            <section className={styles.infoCard}>
              <span className={styles.kicker}>{activity.label}</span>
              <h1>{activity.title}</h1>
              <div className={styles.metaRow}>
                <span className={styles.metaChip}>العمر: {activity.age}</span>
                <span className={styles.metaChip}>المدة: {activity.duration}</span>
                <span className={styles.metaChip}>المستوى: {activity.level}/5</span>
              </div>
              <p><strong>لماذا تستخدم؟</strong><br />{activity.purpose}</p>
              <p><strong>تعليمات سريعة:</strong><br />{activity.instruction}</p>
            </section>

            <section className={styles.infoCard}>
              <h2>المعاينة والتنزيل</h2>
              <p>الورقة تظهر بالحجم الكامل قبل الطباعة. يمكن حفظ النسخة المطبوعة كـ PDF من نافذة الطباعة، كما يمكن تنزيل الصورة المتجهية عالية الدقة.</p>
              <div className={styles.actions}>
                <KidsLabPrintButton />
                <a className={styles.secondaryButton} href={imageUrl} download={`${activity.slug}.svg`}>تنزيل الصورة SVG</a>
              </div>
            </section>

            <section className={styles.infoCard}>
              <h3>{activity.kind === 'test' ? 'معيار إتقان المستوى' : 'ما الذي نراقبه؟'}</h3>
              <p>{activity.mastery}</p>
              {activity.kind === 'test' && <p><strong>مهم:</strong> هذه نتيجة إتقان للمهمة وليست تشخيصًا طبيًا أو نفسيًا أو نمائيًا.</p>}
            </section>

            <div className={styles.actions}>
              {previous && <Link className={styles.secondaryButton} href={`/capabilities/kids-lab/bilateral-tracks/${previous.slug}/`}>السابق</Link>}
              {next && <Link className={styles.primaryButton} href={`/capabilities/kids-lab/bilateral-tracks/${next.slug}/`}>التالي</Link>}
            </div>
          </aside>
        </div>
      </main>
      <div className={styles.noPrint}><SiteFooter /></div>
    </>
  );
}
