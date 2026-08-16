import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AssessmentMonitorRunner from '@/components/assessment-monitor-runner';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { assessmentSlugs, buildMonitorQuestions, getAssessmentMonitor, getSourceInstrument } from '@/lib/assessment-lab/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from '../assessment-lab.module.css';

type Params = Promise<{ slug: string }>;
export const dynamicParams = false;
export function generateStaticParams() { return assessmentSlugs.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const monitor = getAssessmentMonitor(slug);
  const instrument = getSourceInstrument(slug);
  if (!monitor && !instrument) return {};
  const title = monitor?.title ?? instrument?.title ?? 'مختبر المتابعة';
  return buildSeoMetadata({ title, description: monitor ? `ورقة متابعة غير تشخيصية حول ${title}، تحفظ الرابط التاريخي بلا درجة إجمالية أو تخزين للإجابات.` : `صفحة مصدر وحالة استعادة ${title} دون نسخ أو تسجيل درجات قبل تثبيت النسخة العربية وحقوق الاستخدام.`, path: '/assessment-lab', index: false, follow: true });
}

export default async function AssessmentLabDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const monitor = getAssessmentMonitor(slug);
  const instrument = getSourceInstrument(slug);
  if (!monitor && !instrument) notFound();
  const title = monitor?.title ?? instrument!.title;
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'مختبر المتابعة', path: '/assessment-lab' }, { name: title, path: `/assessment-lab/${slug}` }]);
  return <><SiteHeader/><main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}/>
    <section className={styles.detailHero}><div className={styles.shell}><nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-lab">مختبر المتابعة</Link><span>/</span><span aria-current="page">{title}</span></nav><span className={styles.eyebrow}>رابط تاريخي محفوظ · noindex</span><h1>{title}</h1>{monitor ? <p>أداة متابعة ذاتية غير تشخيصية لأربعة محاور. لا توجد درجة كلية؛ الهدف تنظيم الملاحظة خلال الأسبوع الماضي وإعداد أمثلة قابلة للمناقشة.</p> : <p>هذه الصفحة تحفظ مسار الأداة التاريخي وتربطه بالمصدر الأصلي، من دون ادعاء أن ترجمة الموقع القديمة نسخة معيارية أو أن الحساب القديم صالح للاستخدام السريري.</p>}</div></section>
    {monitor ? <div className={styles.shell}><AssessmentMonitorRunner title={monitor.title} questions={buildMonitorQuestions(monitor)}/></div> : <section className={`${styles.shell} ${styles.sourceCard}`}><span className={styles.eyebrow}>صفحة مصدر لا أداة تسجيل درجات</span><h2>{instrument!.source}</h2><p>{instrument!.note}</p><dl><div><dt>الفترة المرجعية التاريخية</dt><dd>{instrument!.period}</dd></div><div><dt>حالة الاستعادة</dt><dd>{instrument!.status}</dd></div></dl><a href={instrument!.sourceUrl} target="_blank" rel="noreferrer">فتح المصدر الرسمي</a><p className={styles.boundary}>عدم عرض البنود أو الدرجة هنا قرار جودة مقصود، وليس فقدانًا غير ملحوظ للمحتوى. سنعيد الوظيفة فقط عندما تكون النسخة العربية، طريقة الحساب، حقوق إعادة الاستخدام وحدود التفسير مثبتة بمصدر مناسب.</p></section>}
    <section className={`${styles.shell} ${styles.safety}`}><h2>متى تتجاوز الأداة؟</h2><p>التغير الشديد أو السريع، تعطّل الوظائف اليومية، أو أي خطر على السلامة يستحق تقييمًا مناسبًا بدل الاعتماد على متابعة ذاتية. عند الخطر الفوري استخدم خدمات الطوارئ المحلية المناسبة.</p><p><Link href="/assessment-lab">جميع أدوات المتابعة</Link> · <Link href="/guided-assessment">التحضير لموعد مهني</Link></p></section>
  </main><SiteFooter/></>;
}
