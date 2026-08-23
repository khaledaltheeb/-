import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import StudentCalendarPlanner from '@/components/student-calendar-planner';
import { buildSeoMetadata } from '@/lib/seo';
import styles from '../calendar.module.css';

export const metadata = buildSeoMetadata({
  title: 'تقويم الطلاب التفاعلي وخطة الدراسة',
  description: 'منظم دراسة عربي محلي للمهام وجلسات التركيز والمراجعة المتباعدة وتصدير تقويم ICS دون حساب أو إرسال خطة الطالب إلى الخادم.',
  path: '/sectors/calendars/students',
  index: true,
  follow: true,
  keywords: ['تقويم الطلاب', 'خطة دراسة', 'المراجعة المتباعدة', 'جلسات التركيز', 'تنظيم الدراسة'],
});

export default function StudentCalendarPage() {
  return <><SiteHeader/><main className={styles.page}><section className={styles.hero}><div className={styles.shell}><span className={styles.eyebrow}>قطاع التقويمات · منظم دراسة محلي</span><h1>تقويم الطلاب التفاعلي</h1><p>مهام، تخطيط للجلسات، مؤقت تركيز، مراجعة متباعدة، وتصدير إلى تقويم الهاتف. الأداة محلية وأكثر خصوصية: لا حساب ولا إرسال للمهام أو السجل ولا استنتاجات عن الصحة النفسية أو القدرة.</p></div></section><section className={`${styles.shell} ${styles.section}`}><StudentCalendarPlanner/><div className={styles.notice}><strong>حدود الأداة:</strong> هذا منظم تعلم، لا علاج ولا اختبار قدرات. إذا كان ضعف النوم أو القلق أو الألم أو صعوبة التركيز يعطل الدراسة باستمرار، ناقش السبب مع شخص بالغ موثوق أو مرشد أو مختص مناسب بدل زيادة ساعات الدراسة فقط.</div><section className={`${styles.card} ${styles.sources}`}><h2>لماذا نستخدم الاسترجاع والمراجعة المتباعدة؟</h2><p>تشير أبحاث التعلم إلى أن استرجاع المعلومات والممارسة الموزعة عبر الزمن قد يدعمان الاحتفاظ مقارنة بإعادة القراءة المكثفة وحدها. أما مدة الجلسة فليست رقمًا سحريًا؛ اضبطها حسب المهمة والنوم والطاقة والتغذية الراجعة.</p><p>تذكّر أيضًا أن النوم الكافي عامل أساسي للانتباه والتعلم؛ لا ينبغي أن يتحول التقويم إلى أداة لتبرير تقليل النوم.</p></section></section></main><SiteFooter/></>;
}
